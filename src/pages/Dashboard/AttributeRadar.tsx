import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { ATTRIBUTES } from '../../lib/constants';
import { getAttributeLevel } from '../../lib/gameFormulas';
import { GlassCard } from '../../components/ui/GlassCard';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; level: number; color: string; emoji: string } }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(10,10,26,0.9)', border: `1px solid ${d.color}44` }}>
        <span style={{ color: d.color }}>{d.emoji} {d.name}</span>
        <span className="ml-2" style={{ color: '#FFD54F' }}>Lv.{d.level}</span>
      </div>
    );
  }
  return null;
};

export const AttributeRadar: React.FC = () => {
  const attributeExp = usePlayerStore((s) => s.attributeExp);

  const data = ATTRIBUTES.map((attr) => ({
    name: attr.name,
    emoji: attr.emoji,
    color: attr.color,
    level: getAttributeLevel(attributeExp[attr.key]),
    fullMark: 20,
  }));

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
        属性雷达
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="name"
            tick={({ x, y, payload, index }) => {
              const attr = ATTRIBUTES[index];
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={attr?.color ?? '#fff'}
                  fontSize={12}
                >
                  {attr?.emoji} {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 20]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Radar
            name="属性等级"
            dataKey="level"
            stroke="#FFD54F"
            fill="#FFD54F"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1 text-xs">
            <span>{d.emoji}</span>
            <span style={{ color: d.color }}>{d.name}</span>
            <span style={{ color: '#FFD54F' }} className="ml-auto font-bold">Lv.{d.level}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
