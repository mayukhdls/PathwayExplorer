export type NodeType = 'metabolite' | 'gene' | 'protein';

export interface PathwayNode {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface PathwayEdge {
  id: string;
  source: string;
  target: string;
  interaction: string;
}

export interface Pathway {
  id: string;
  name: string;
  description: string;
  nodes: PathwayNode[];
  edges: PathwayEdge[];
}

export interface LayerState {
  basePathway: boolean;
  expressionOverlay: boolean;
  diseaseMutations: boolean;
  fluxSimulation: boolean;
}
