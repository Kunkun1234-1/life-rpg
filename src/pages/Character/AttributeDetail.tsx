import React from 'react';
import type { AttributeKey } from '../../types';
import { ATTRIBUTE_MAP } from '../../lib/constants';
import { usePlayerStore } from '../../stores/usePlayerStore';
import ProgressBar from '../../components/ui/ProgressBar';

interface AttributeDetailProps {
  attributeKey: AttributeKey;
}

const AttributeDetail: React.FC<AttributeDetailProps> = ({ attributeKey }) => {
  const getAttributeProgress = usePlayerStore(s => s.getAttributeProgress);
  const info = ATTRIBUTE_MAP[attributeKey];
  const progress = getAttributeProgress(attributeKey);

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{info.emoji}</span>
          <span className="text-sm font-medium text-white/90">{info.name}</span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: info.color, background: `${info.color}20` }}>
            Lv.{progress.level}
          </span>
        </div>
        <span className="text-xs text-white/40">
          {progress.currentLevelExp} / {progress.nextLevelExp}
        </span>
      </div>
      <ProgressBar value={progress.progress} color={info.color} height="h-1.5" />
    </div>
  );
};

export default AttributeDetail;
