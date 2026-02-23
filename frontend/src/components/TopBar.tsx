import { ChangeEvent } from 'react';

import { usePathwayStore } from '../store/usePathwayStore';
import { simulateKnockout, uploadExpression, uploadGeneList } from '../utils/api';

export function TopBar() {
  const {
    activePathway,
    layers,
    toggleLayer,
    setHighlightedNodeIds,
    setExpressionByNode,
    setKnockoutResult,
    darkMode,
    toggleDarkMode,
  } = usePathwayStore();

  const onGeneListUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activePathway || !event.target.files?.[0]) return;
    const ids = await uploadGeneList(activePathway.id, event.target.files[0]);
    setHighlightedNodeIds(ids);
  };

  const onExpressionUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activePathway || !event.target.files?.[0]) return;
    const expression = await uploadExpression(activePathway.id, event.target.files[0]);
    setExpressionByNode(expression);
  };

  const onSimulateKnockout = async () => {
    if (!activePathway) return;
    const candidate = activePathway.nodes.find((node) => node.type !== 'metabolite');
    if (!candidate) return;
    const result = await simulateKnockout(activePathway.id, candidate.id);
    setKnockoutResult(result.dimmed_node_ids, result.deactivated_edge_ids);
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-2">
        {(Object.keys(layers) as (keyof typeof layers)[]).map((layer) => (
          <button
            key={layer}
            className={`rounded px-3 py-1.5 text-xs font-semibold capitalize ${
              layers[layer] ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
            }`}
            onClick={() => toggleLayer(layer)}
          >
            {layer.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs">
        <label className="rounded bg-slate-200 px-3 py-1.5 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">
          Gene list
          <input type="file" className="hidden" accept=".txt" onChange={onGeneListUpload} />
        </label>

        <label className="rounded bg-slate-200 px-3 py-1.5 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">
          Expression CSV
          <input type="file" className="hidden" accept=".csv" onChange={onExpressionUpload} />
        </label>

        <button className="rounded bg-amber-600 px-3 py-1.5" onClick={onSimulateKnockout}>
          Simulate knockout
        </button>

        <button
          className="rounded bg-slate-200 px-3 py-1.5 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
          onClick={toggleDarkMode}
        >
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </header>
  );
}
