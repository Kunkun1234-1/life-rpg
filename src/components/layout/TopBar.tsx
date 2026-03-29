import { usePlayerStore } from '../../stores/usePlayerStore';
import { ProgressBar } from '../ui/ProgressBar';

export function TopBar() {
  const player = usePlayerStore((s) => s.player);
  const staminaRatio = player.stamina / player.maxStamina;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-6 px-6 py-2"
      style={{
        left: '64px',
        height: '52px',
        background: 'rgba(10, 10, 26, 0.75)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Adventure Level */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-400">冒险等级</span>
        <span
          className="text-base font-bold"
          style={{ color: '#FFD54F' }}
        >
          Lv.{player.adventureLevel}
        </span>
      </div>

      {/* Stamina */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-xs text-gray-400 shrink-0">体力</span>
        <div className="flex-1">
          <ProgressBar value={staminaRatio} color="#FF6B6B" />
        </div>
        <span className="text-xs text-gray-300 shrink-0">
          {player.stamina}/{player.maxStamina}
        </span>
      </div>

      {/* Stardust */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs" style={{ color: '#64B5F6' }}>✦</span>
        <span className="text-sm font-semibold" style={{ color: '#64B5F6' }}>
          {player.stardust}
        </span>
        <span className="text-xs text-gray-400">星尘</span>
      </div>

      {/* Player name / title */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-400">{player.currentTitle}</span>
        <span className="text-sm text-gray-200">{player.playerName}</span>
      </div>
    </header>
  );
}
