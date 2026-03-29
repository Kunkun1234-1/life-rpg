import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar />
      {/* Content area: offset for sidebar (64px) and topbar (52px) */}
      <main
        style={{
          marginLeft: '64px',
          paddingTop: '52px',
          minHeight: '100vh',
        }}
        className="p-6"
      >
        <Outlet />
      </main>
    </div>
  );
}
