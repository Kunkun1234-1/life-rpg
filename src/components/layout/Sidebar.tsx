import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePlayerStore } from '../../stores/usePlayerStore';

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
  { to: '/achievements', icon: '🏆', label: '成就' },
  { to: '/principles', icon: '📖', label: '原则' },
];

function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d')!;
        // Center crop
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const playerName = usePlayerStore((s) => s.playerName);
  const avatarUrl = usePlayerStore((s) => s.avatarUrl);
  const setAvatar = usePlayerStore((s) => s.setAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarChar = playerName ? playerName.charAt(0) : '旅';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 128);
      setAvatar(dataUrl);
    } catch {
      // silently fail
    }
    e.target.value = '';
  };

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
      <div className="mb-4 mt-1 relative group cursor-pointer" title={user?.email ?? '点击更换头像'} onClick={handleAvatarClick}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400/30"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFD54F 0%, #FF7043 100%)',
              color: '#0a0a1a',
            }}
          >
            {avatarChar}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs">换</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
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

      {/* Logout at bottom */}
      <button
        onClick={signOut}
        className="w-full flex flex-col items-center justify-center py-3 px-1 text-gray-500 hover:text-red-400 transition-colors"
        title="退出登录"
      >
        <span className="text-xl leading-none">🚪</span>
        <span className="text-[9px] mt-1 leading-none">退出</span>
      </button>
    </aside>
  );
}
