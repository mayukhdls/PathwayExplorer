# Pathway Explorer

Pathway Explorer is a full-stack bioinformatics visualization app for interactive KEGG-style pathway exploration.

## 1) Project folder structure

```text
PathwayExplorer/
├── backend/
│   ├── app/
│   │   ├── api/routes.py
│   │   ├── core/config.py
│   │   ├── data/pathways.json
│   │   ├── models/schemas.py
│   │   ├── services/pathway_service.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NodeDetailPanel.tsx
│   │   │   ├── PathwayGraph.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── store/usePathwayStore.ts
│   │   ├── types/pathway.ts
│   │   ├── utils/api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
├── data/
│   ├── example_expression.csv
│   └── example_gene_list.txt
└── docker-compose.yml
```

## 2) Backend code (FastAPI + Neo4j-ready)

Implemented in `backend/app` with routes:
- `GET /pathways`
- `GET /pathway/{id}`
- `POST /upload/expression`
- `POST /upload/gene-list`
- `POST /simulate/knockout`

Service behavior:
- Loads pathway graph JSON data.
- Optionally connects to Neo4j on startup (fallbacks to JSON if unavailable).
- Handles uploaded files and simulation logic.

## 3) Frontend code (React + TypeScript + D3 + Tailwind + Zustand)

Implemented in `frontend/src` with:
- **Layout:** left sidebar, top bar, graph canvas, right details panel.
- **D3 Graph:** zoom, pan, node drag, click-to-select, tooltips, smooth transitions.
- **Layer toggles:** base pathway, expression overlay, disease mutations, flux simulation.
- **Uploads:** gene list + expression CSV.
- **Simulation mode:** knockout API call dims downstream nodes and deactivates edges.
- **Extras:** dark mode + keyboard shortcut (`d`) for quick theme toggle.

## 4) Instructions to run locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional, for Neo4j)

### Start Neo4j (optional)
```bash
docker compose up -d neo4j
```

### Run backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Run frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## 5) Example dataset for testing

Located under `data/`:
- `example_gene_list.txt`
- `example_expression.csv`

Use those in the upload buttons after selecting a pathway.
