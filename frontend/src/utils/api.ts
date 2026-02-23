import { Pathway } from '../types/pathway';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchPathways(): Promise<{ id: string; name: string; description: string }[]> {
  const res = await fetch(`${API_BASE}/pathways`);
  if (!res.ok) throw new Error('Failed to fetch pathways');
  return res.json();
}

export async function fetchPathway(id: string): Promise<Pathway> {
  const res = await fetch(`${API_BASE}/pathway/${id}`);
  if (!res.ok) throw new Error('Failed to fetch pathway data');
  return res.json();
}

export async function uploadGeneList(pathwayId: string, file: File): Promise<string[]> {
  const form = new FormData();
  form.append('pathway_id', pathwayId);
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload/gene-list`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Failed to upload gene list');
  const data = await res.json();
  return data.highlighted_node_ids;
}

export async function uploadExpression(pathwayId: string, file: File): Promise<Record<string, number>> {
  const form = new FormData();
  form.append('pathway_id', pathwayId);
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload/expression`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Failed to upload expression CSV');
  const data = await res.json();
  return data.expression_by_node;
}

export async function simulateKnockout(pathwayId: string, geneId: string): Promise<{dimmed_node_ids: string[]; deactivated_edge_ids: string[]}> {
  const res = await fetch(`${API_BASE}/simulate/knockout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathway_id: pathwayId, gene_id: geneId }),
  });
  if (!res.ok) throw new Error('Failed to simulate knockout');
  return res.json();
}
