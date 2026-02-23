import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

import { usePathwayStore } from '../store/usePathwayStore';
import { Pathway } from '../types/pathway';

interface Props {
  pathway: Pathway;
}

const getNodeColor = (
  nodeId: string,
  nodeType: string,
  highlightedNodeIds: string[],
  expressionByNode: Record<string, number>,
) => {
  if (highlightedNodeIds.includes(nodeId)) return '#f59e0b';
  if (expressionByNode[nodeId] !== undefined) {
    const scale = d3.scaleLinear<string>().domain([-2, 0, 2]).range(['#2563eb', '#e2e8f0', '#dc2626']);
    return scale(expressionByNode[nodeId]);
  }
  if (nodeType === 'gene') return '#34d399';
  if (nodeType === 'protein') return '#38bdf8';
  return '#c084fc';
};

export function PathwayGraph({ pathway }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const {
    layers,
    highlightedNodeIds,
    expressionByNode,
    knockoutDimmedNodes,
    knockoutDeactivatedEdges,
    setSelectedNode,
  } = usePathwayStore();

  const dimmedNodeSet = useMemo(() => new Set(knockoutDimmedNodes), [knockoutDimmedNodes]);
  const deactivatedEdgeSet = useMemo(() => new Set(knockoutDeactivatedEdges), [knockoutDeactivatedEdges]);

  useEffect(() => {
    if (!svgRef.current || !layers.basePathway) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 980;
    const height = 700;

    const root = svg.attr('viewBox', `0 0 ${width} ${height}`).append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.4, 4]).on('zoom', (event) => {
      root.attr('transform', event.transform);
    });

    svg.call(zoom);

    const nodeById = new Map(pathway.nodes.map((node) => [node.id, node]));

    root
      .append('g')
      .selectAll('line')
      .data(pathway.edges)
      .join('line')
      .attr('x1', (edge) => nodeById.get(edge.source)?.x || 0)
      .attr('y1', (edge) => nodeById.get(edge.source)?.y || 0)
      .attr('x2', (edge) => nodeById.get(edge.target)?.x || 0)
      .attr('y2', (edge) => nodeById.get(edge.target)?.y || 0)
      .attr('stroke', (edge) => (deactivatedEdgeSet.has(edge.id) ? '#64748b' : '#475569'))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (edge) => (deactivatedEdgeSet.has(edge.id) ? '5 5' : ''))
      .transition()
      .duration(350)
      .attr('opacity', (edge) => (deactivatedEdgeSet.has(edge.id) ? 0.3 : 0.95));

    const nodeGroups = root
      .append('g')
      .selectAll('g')
      .data(pathway.nodes)
      .join('g')
      .attr('transform', (node) => `translate(${node.x}, ${node.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, node) => setSelectedNode(node))
      .on('mousemove', (event, node) => {
        if (!tooltipRef.current) return;
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${event.pageX + 10}px`;
        tooltipRef.current.style.top = `${event.pageY + 10}px`;
        tooltipRef.current.innerText = `${node.name} (${node.type})`;
      })
      .on('mouseleave', () => {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
      });

    nodeGroups
      .append('circle')
      .attr('r', 24)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.5)
      .attr('fill', (node) => getNodeColor(node.id, node.type, highlightedNodeIds, expressionByNode))
      .transition()
      .duration(350)
      .attr('opacity', (node) => (dimmedNodeSet.has(node.id) ? 0.25 : 1));

    nodeGroups
      .append('text')
      .text((node) => node.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('font-size', 12)
      .attr('fill', '#cbd5e1');

    nodeGroups.call(
      d3
        .drag<SVGGElement, (typeof pathway.nodes)[number]>()
        .on('drag', function drag(event, d) {
          d.x = event.x;
          d.y = event.y;
          d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);
        }),
    );
  }, [
    pathway,
    highlightedNodeIds,
    expressionByNode,
    layers.basePathway,
    dimmedNodeSet,
    deactivatedEdgeSet,
    setSelectedNode,
  ]);

  return (
    <div className="relative h-full w-full rounded-xl bg-slate-800 shadow-lg">
      <svg ref={svgRef} className="h-full w-full" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute hidden rounded bg-slate-950 px-2 py-1 text-xs text-slate-100"
      />
    </div>
  );
}
