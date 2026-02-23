from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import router
from backend.app.core.config import settings
from backend.app.services.pathway_service import pathway_service


@asynccontextmanager
async def lifespan(_: FastAPI):
    pathway_service.connect_neo4j()
    yield
    pathway_service.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(router)


@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
