import { useEffect, useState } from 'react';

import { NodeDetailPanel } from './components/NodeDetailPanel';
import { PathwayGraph } from './components/PathwayGraph';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { usePathwayStore } from './store/usePathwayStore';
import { fetchPathway, fetchPathways } from './utils/api';

function App() {
  const { darkMode, activePathway, setPathways, setActivePathway, toggleDarkMode } = usePathwayStore();
  const [isLoadingPathways, setIsLoadingPathways] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    async function initialize() {
      setIsLoadingPathways(true);
      setLoadError(null);
      try {
        const summaries = await fetchPathways();
        const loaded = await Promise.all(summaries.map((item) => fetchPathway(item.id)));
        setPathways(loaded);
        if (!activePathway && loaded.length > 0) {
          setActivePathway(loaded[0]);
        }
      } catch {
        setPathways([]);
        setLoadError('Could not load pathways. Check backend connection and refresh.');
      } finally {
        setIsLoadingPathways(false);
      }
    }
    initialize();
  }, [setPathways, setActivePathway, activePathway]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        toggleDarkMode();
      }
    };

    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, [toggleDarkMode]);

  return (
    <div className="h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <TopBar />
      <div className="flex h-[calc(100%-57px)]">
        <Sidebar />
        <main className="flex-1 p-4">
          {activePathway ? (
            <PathwayGraph pathway={activePathway} />
          ) : isLoadingPathways ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Loading pathways...
            </div>
          ) : loadError ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
              {loadError}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Select a pathway from the sidebar
            </div>
          )}
        </main>
        <NodeDetailPanel />
      </div>
    </div>
  );
}

export default App;
