import { useEffect } from 'react';

import { NodeDetailPanel } from './components/NodeDetailPanel';
import { PathwayGraph } from './components/PathwayGraph';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { usePathwayStore } from './store/usePathwayStore';
import { fetchPathway, fetchPathways } from './utils/api';

function App() {
  const { darkMode, activePathway, setPathways, setActivePathway, toggleDarkMode } = usePathwayStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    async function initialize() {
      const summaries = await fetchPathways();
      const loaded = await Promise.all(summaries.map((item) => fetchPathway(item.id)));
      setPathways(loaded);
      if (!activePathway && loaded.length > 0) {
        setActivePathway(loaded[0]);
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
    <div className="h-screen bg-slate-950 text-slate-100">
      <TopBar />
      <div className="flex h-[calc(100%-57px)]">
        <Sidebar />
        <main className="flex-1 p-4">
          {activePathway ? (
            <PathwayGraph pathway={activePathway} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-800 text-slate-300">
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
