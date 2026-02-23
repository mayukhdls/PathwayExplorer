from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.app.models.schemas import (
    ExpressionOverlayResponse,
    GeneListUploadResponse,
    KnockoutRequest,
    KnockoutResponse,
    Pathway,
    PathwaySummary,
)
from backend.app.services.pathway_service import pathway_service

router = APIRouter()


@router.get('/pathways', response_model=list[PathwaySummary])
def get_pathways() -> list[PathwaySummary]:
    pathways = pathway_service.list_pathways()
    return [PathwaySummary(id=p.id, name=p.name, description=p.description) for p in pathways]


@router.get('/pathway/{pathway_id}', response_model=Pathway)
def get_pathway(pathway_id: str) -> Pathway:
    if pathway_id not in pathway_service.pathways:
        raise HTTPException(status_code=404, detail='Pathway not found')
    return pathway_service.get_pathway(pathway_id)


@router.post('/upload/gene-list', response_model=GeneListUploadResponse)
async def upload_gene_list(
    pathway_id: str = Form(...),
    file: UploadFile = File(...),
) -> GeneListUploadResponse:
    raw = await file.read()
    genes = pathway_service.parse_gene_list(raw)
    highlighted = pathway_service.map_genes_to_nodes(pathway_id, genes)
    return GeneListUploadResponse(highlighted_node_ids=highlighted)


@router.post('/upload/expression', response_model=ExpressionOverlayResponse)
async def upload_expression(
    pathway_id: str = Form(...),
    file: UploadFile = File(...),
) -> ExpressionOverlayResponse:
    raw = await file.read()
    expression = pathway_service.parse_expression_csv(raw)
    mapped = pathway_service.map_expression_to_nodes(pathway_id, expression)
    return ExpressionOverlayResponse(expression_by_node=mapped)


@router.post('/simulate/knockout', response_model=KnockoutResponse)
def simulate_knockout(request: KnockoutRequest) -> KnockoutResponse:
    if request.pathway_id not in pathway_service.pathways:
        raise HTTPException(status_code=404, detail='Pathway not found')
    return pathway_service.simulate_knockout(request.pathway_id, request.gene_id)
