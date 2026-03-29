import { useState } from 'react';
import CharacterPage from './pages/Character';
import TasksPage from './pages/Tasks';

type Page = 'character' | 'tasks';

function App() {
  const [page, setPage] = useState<Page>('character');

  return (
    <div style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>
      {/* Simple nav for dev */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex gap-2 p-2 border-b border-white/10"
        style={{ background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(10px)' }}
      >
        <button
          className={`px-3 py-1.5 rounded text-sm transition-colors ${page === 'character' ? 'text-yellow-300 bg-yellow-400/10' : 'text-white/50 hover:text-white'}`}
          onClick={() => setPage('character')}
        >
          角色面板
        </button>
        <button
          className={`px-3 py-1.5 rounded text-sm transition-colors ${page === 'tasks' ? 'text-yellow-300 bg-yellow-400/10' : 'text-white/50 hover:text-white'}`}
          onClick={() => setPage('tasks')}
        >
          任务中心
        </button>
      </nav>
      <div className="pt-12">
        {page === 'character' && <CharacterPage />}
        {page === 'tasks' && <TasksPage />}
      </div>
    </div>
  );
}

export default App;
