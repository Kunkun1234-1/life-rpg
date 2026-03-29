import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: '🏠', label: '仪表盘' },
  { to: '/character', icon: '⚔️', label: '角色' },
  { to: '/tasks', icon: '📋', label: '任务' },
  { to: '/shop', icon: '🏪', label: '商城' },
  { to: '/calendar', icon: '📅', label: '日历' },
  { to: '/principles', icon: '📖', label: '原则' },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col items-center py-4 gap-1"
      style={{
        width: '64px',
        background: 'rgba(10, 10, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Player Avatar */}
      <div className="mb-4 mt-1">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #FFD54F 0%, #FF7043 100%)',
            color: '#0a0a1a',
          }}
        >
          旅
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative w-full flex flex-col items-center justify-center py-3 px-1 transition-colors duration-150 group ${
                isActive ? 'text-[#FFD54F]' : 'text-gray-500 hover:text-gray-200'
              }`
            }
            title={label}
          >
            {({ isActive }) => (
              <>
                {/* Gold active indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                    style={{ background: '#FFD54F' }}
                  />
                )}
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[9px] mt-1 leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <button
        className="w-full flex flex-col items-center justify-center py-3 px-1 text-gray-500 hover:text-gray-200 transition-colors"
        title="设置"
      >
        <span className="text-xl leading-none">⚙️</span>
        <span className="text-[9px] mt-1 leading-none">设置</span>
      </button>
    </aside>
  );
}
