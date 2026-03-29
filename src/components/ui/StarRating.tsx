import { RARITY_MAP } from '../../lib/constants';
import type { TaskRarity } from '../../types';

interface StarRatingProps {
  rarity: TaskRarity;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rarity, size = 'md' }: StarRatingProps) {
  const config = RARITY_MAP[rarity];
  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <span
      className={`font-bold ${sizeClass}`}
      style={{ color: config.color }}
      title={config.label}
    >
      {config.stars}
    </span>
  );
}
