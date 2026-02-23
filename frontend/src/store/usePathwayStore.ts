import { create } from 'zustand';

import { LayerState, Pathway, PathwayNode } from '../types/pathway';

interface PathwayStore {
  pathways: Pathway[];
  activePathway: Pathway | null;
  selectedNode: PathwayNode | null;
  highlightedNodeIds: string[];
  expressionByNode: Record<string, number>;
  knockoutDimmedNodes: string[];
  knockoutDeactivatedEdges: string[];
  layers: LayerState;
  darkMode: boolean;
  setPathways: (value: Pathway[]) => void;
  setActivePathway: (value: Pathway | null) => void;
  setSelectedNode: (value: PathwayNode | null) => void;
  setHighlightedNodeIds: (value: string[]) => void;
  setExpressionByNode: (value: Record<string, number>) => void;
  setKnockoutResult: (dimmedNodes: string[], deactivatedEdges: string[]) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  toggleDarkMode: () => void;
}

export const usePathwayStore = create<PathwayStore>((set) => ({
  pathways: [],
  activePathway: null,
  selectedNode: null,
  highlightedNodeIds: [],
  expressionByNode: {},
  knockoutDimmedNodes: [],
  knockoutDeactivatedEdges: [],
  layers: {
    basePathway: true,
    expressionOverlay: true,
    diseaseMutations: false,
    fluxSimulation: false,
  },
  darkMode: false,
  setPathways: (pathways) => set({ pathways }),
  setActivePathway: (activePathway) =>
    set({
      activePathway,
      selectedNode: null,
      highlightedNodeIds: [],
      expressionByNode: {},
      knockoutDimmedNodes: [],
      knockoutDeactivatedEdges: [],
    }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setHighlightedNodeIds: (highlightedNodeIds) => set({ highlightedNodeIds }),
  setExpressionByNode: (expressionByNode) => set({ expressionByNode }),
  setKnockoutResult: (knockoutDimmedNodes, knockoutDeactivatedEdges) =>
    set({ knockoutDimmedNodes, knockoutDeactivatedEdges }),
  toggleLayer: (layer) =>
    set((state) => ({ layers: { ...state.layers, [layer]: !state.layers[layer] } })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
