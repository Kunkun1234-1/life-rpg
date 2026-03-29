import React from 'react';
import { RARITY_MAP } from '../../lib/constants';
import type { TaskRarity } from '../../types';

interface StarRatingProps {
  rarity: TaskRarity;
  size?: 'sm' | 'md';
}

export const StarRating: React.FC<StarRatingProps> = ({ rarity, size = 'sm' }) => {
  const config = RARITY_MAP[rarity];
  const fontSize = size === 'sm' ? '10px' : '14px';
  return (
    <span style={{ color: config.color, fontSize, letterSpacing: '1px' }}>
      {config.stars}
    </span>
  );
};
