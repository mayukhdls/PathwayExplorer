import { useMemo, useState } from 'react';

import { usePathwayStore } from '../store/usePathwayStore';

export function Sidebar() {
  const [search, setSearch] = useState('');
  const { pathways, activePathway, setActivePathway } = usePathwayStore();

  const filtered = useMemo(
    () => pathways.filter((pathway) => pathway.name.toLowerCase().includes(search.toLowerCase())),
    [pathways, search],
  );

  return (
    <aside className="h-full w-72 border-r border-slate-700 bg-slate-900 p-4 text-slate-100">
      <h2 className="mb-3 text-lg font-semibold">Pathways</h2>
      <input
        className="mb-3 w-full rounded-md border border-slate-600 bg-slate-800 p-2 text-sm"
        placeholder="Search pathways..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <ul className="space-y-2 overflow-y-auto">
        {filtered.map((pathway) => (
          <li key={pathway.id}>
            <button
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                activePathway?.id === pathway.id ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
              }`}
              onClick={() => setActivePathway(pathway)}
            >
              <div className="font-semibold">{pathway.name}</div>
              <div className="text-xs opacity-70">{pathway.description}</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
