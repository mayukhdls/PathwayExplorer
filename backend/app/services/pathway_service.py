from __future__ import annotations

import csv
import io
import json
from collections import deque
from pathlib import Path

from neo4j import Driver, GraphDatabase

from backend.app.core.config import settings
from backend.app.models.schemas import KnockoutResponse, Pathway


class PathwayService:
    """Service layer that optionally syncs with Neo4j while always supporting JSON-backed demo data."""

    def __init__(self) -> None:
        self._pathways = self._load_pathways(settings.data_file)
        self._driver: Driver | None = None

    @property
    def pathways(self) -> dict[str, Pathway]:
        return self._pathways

    def connect_neo4j(self) -> None:
        try:
            self._driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
            )
            self._driver.verify_connectivity()
        except Exception:
            self._driver = None

    def close(self) -> None:
        if self._driver:
            self._driver.close()

    @staticmethod
    def _load_pathways(path: str) -> dict[str, Pathway]:
        payload = json.loads(Path(path).read_text())
        return {item['id']: Pathway.model_validate(item) for item in payload['pathways']}

    def list_pathways(self) -> list[Pathway]:
        return list(self._pathways.values())

    def get_pathway(self, pathway_id: str) -> Pathway:
        return self._pathways[pathway_id]

    def parse_gene_list(self, raw_bytes: bytes) -> list[str]:
        lines = raw_bytes.decode('utf-8').splitlines()
        return [line.strip() for line in lines if line.strip()]

    def map_genes_to_nodes(self, pathway_id: str, genes: list[str]) -> list[str]:
        pathway = self.get_pathway(pathway_id)
        lookup = {node.name.lower(): node.id for node in pathway.nodes}
        return [lookup[gene.lower()] for gene in genes if gene.lower() in lookup]

    def parse_expression_csv(self, raw_bytes: bytes) -> dict[str, float]:
        expression_by_gene: dict[str, float] = {}
        reader = csv.DictReader(io.StringIO(raw_bytes.decode('utf-8')))
        for row in reader:
            gene = (row.get('gene') or '').strip()
            value = row.get('expression')
            if not gene or value is None:
                continue
            try:
                expression_by_gene[gene.lower()] = float(value)
            except ValueError:
                continue
        return expression_by_gene

    def map_expression_to_nodes(self, pathway_id: str, expression_by_gene: dict[str, float]) -> dict[str, float]:
        pathway = self.get_pathway(pathway_id)
        response: dict[str, float] = {}
        for node in pathway.nodes:
            key = node.name.lower()
            if key in expression_by_gene:
                response[node.id] = expression_by_gene[key]
        return response

    def simulate_knockout(self, pathway_id: str, gene_id: str) -> KnockoutResponse:
        pathway = self.get_pathway(pathway_id)

        adjacency: dict[str, list[str]] = {}
        edge_lookup: dict[tuple[str, str], str] = {}
        for edge in pathway.edges:
            adjacency.setdefault(edge.source, []).append(edge.target)
            edge_lookup[(edge.source, edge.target)] = edge.id

        queue = deque([gene_id])
        visited = {gene_id}
        dimmed_nodes: set[str] = set()
        deactivated_edges: set[str] = set()

        while queue:
            current = queue.popleft()
            for nxt in adjacency.get(current, []):
                edge_id = edge_lookup.get((current, nxt))
                if edge_id:
                    deactivated_edges.add(edge_id)
                if nxt not in visited:
                    visited.add(nxt)
                    dimmed_nodes.add(nxt)
                    queue.append(nxt)

        return KnockoutResponse(
            deactivated_edge_ids=sorted(deactivated_edges),
            dimmed_node_ids=sorted(dimmed_nodes),
        )


pathway_service = PathwayService()
