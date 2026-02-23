from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class PathwayNode(BaseModel):
    id: str
    name: str
    type: Literal["metabolite", "gene", "protein"]
    x: float
    y: float
    expression: float | None = None
    mutated: bool = False
    flux: float | None = None


class PathwayEdge(BaseModel):
    id: str
    source: str
    target: str
    interaction: str
    active: bool = True


class Pathway(BaseModel):
    id: str
    name: str
    description: str
    nodes: list[PathwayNode]
    edges: list[PathwayEdge]


class PathwaySummary(BaseModel):
    id: str
    name: str
    description: str


class GeneListUploadResponse(BaseModel):
    highlighted_node_ids: list[str]


class ExpressionOverlayResponse(BaseModel):
    expression_by_node: dict[str, float]


class KnockoutRequest(BaseModel):
    pathway_id: str = Field(..., description="Target pathway identifier")
    gene_id: str = Field(..., description="Gene/protein node id to knockout")


class KnockoutResponse(BaseModel):
    deactivated_edge_ids: list[str]
    dimmed_node_ids: list[str]
