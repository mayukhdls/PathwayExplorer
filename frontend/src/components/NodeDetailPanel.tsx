import { useMemo } from 'react';

import { usePathwayStore } from '../store/usePathwayStore';

export function NodeDetailPanel() {
  const { selectedNode, expressionByNode, highlightedNodeIds, knockoutDimmedNodes } = usePathwayStore();

  const status = useMemo(() => {
    if (!selectedNode) return null;
    return {
      highlighted: highlightedNodeIds.includes(selectedNode.id),
      expression: expressionByNode[selectedNode.id],
      knockedDown: knockoutDimmedNodes.includes(selectedNode.id),
    };
  }, [selectedNode, highlightedNodeIds, expressionByNode, knockoutDimmedNodes]);

  return (
    <aside className="h-full w-80 border-l border-slate-700 bg-slate-900 p-4 text-slate-100">
      <h2 className="mb-3 text-lg font-semibold">Node details</h2>
      {!selectedNode && <p className="text-sm opacity-70">Click a node to inspect details.</p>}
      {selectedNode && status && (
        <div className="space-y-2 rounded bg-slate-800 p-3 text-sm">
          <p><span className="font-semibold">Name:</span> {selectedNode.name}</p>
          <p><span className="font-semibold">ID:</span> {selectedNode.id}</p>
          <p><span className="font-semibold">Type:</span> {selectedNode.type}</p>
          <p><span className="font-semibold">Highlighted:</span> {status.highlighted ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Expression:</span> {status.expression ?? 'N/A'}</p>
          <p><span className="font-semibold">Downstream affected:</span> {status.knockedDown ? 'Yes' : 'No'}</p>
        </div>
      )}
    </aside>
  );
}
