import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { ATTRIBUTES, BREAKTHROUGHS } from '../../lib/constants';
import { getAdventureLevelProgress, getAttributeLevelProgress, getAttributeLevel } from '../../lib/gameFormulas';
import { GlassCard } from '../../components/ui/GlassCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import AttributeDetail from './AttributeDetail';
import EquipmentSlots from './EquipmentSlots';

const BreakthroughPanel: React.FC<{ adventureLevel: number; attributeExp: Record<string, number> }> = ({ adventureLevel, attributeExp }) => {
  const tasks = useTaskStore((s) => s.tasks);
  const completedEpic = tasks.filter(t => t.status === 'completed' && t.rarity >= 4).length;
  const completedLegend = tasks.filter(t => t.status === 'completed' && t.rarity >= 5).length;
  const attrLevels = Object.values(attributeExp).map(exp => getAttributeLevel(exp));
  const minAttrLevel = Math.min(...attrLevels);
  const attrAbove = (lvl: number) => attrLevels.filter(l => l >= lvl).length;

  // Find current breakthrough
  const nextBreakthrough = BREAKTHROUGHS.find(b => adventureLevel < b.level || adventureLevel === b.level);
  if (!nextBreakthrough) return null;

  const isAtBreakthrough = adventureLevel >= nextBreakthrough.level;
  let conditionMet = false;
  if (nextBreakthrough.level === 10) conditionMet = attrAbove(3) >= 3;
  else if (nextBreakthrough.level === 20) conditionMet = completedEpic >= 1 && attrAbove(5) >= 4;
  else if (nextBreakthrough.level === 30) conditionMet = minAttrLevel >= 7 && completedEpic >= 3;
  else if (nextBreakthrough.level === 40) conditionMet = completedLegend >= 1 && minAttrLevel >= 10;

  return (
    <GlassCard className="p-5" style={{ border: isAtBreakthrough ? '1px solid rgba(255,213,79,0.3)' : undefined }}>
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">突破任务</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Lv.{nextBreakthrough.level} 突破</span>
          {isAtBreakthrough && conditionMet && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,213,79,0.2)', color: '#FFD54F' }}>
              可突破
            </span>
          )}
          {isAtBreakthrough && !conditionMet && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
              条件未满足
            </span>
          )}
          {!isAtBreakthrough && (
            <span className="text-xs text-white/30">Lv.{nextBreakthrough.level} 时解锁</span>
          )}
        </div>
        <p className="text-xs text-white/50">{nextBreakthrough.condition}</p>
        <p className="text-xs text-white/30">{nextBreakthrough.description}</p>
      </div>
    </GlassCard>
  );
};

const CharacterPage: React.FC = () => {
  const playerName = usePlayerStore(s => s.playerName);
  const getCurrentTitle = usePlayerStore(s => s.getCurrentTitle);
  const totalExp = usePlayerStore(s => s.totalExp);
  const attributeExp = usePlayerStore(s => s.attributeExp);

  const adventureProgress = getAdventureLevelProgress(totalExp);

  const radarData = ATTRIBUTES.map(attr => {
    const prog = getAttributeLevelProgress(attributeExp[attr.key]);
    return {
      subject: `${attr.emoji} ${attr.name}\nLv.${prog.level}`,
      value: prog.level,
      fullMark: 20,
      color: attr.color,
    };
  });

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)' }}
    >
      <motion.h1
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: 'Noto Serif SC, serif' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        角色面板
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-6 h-full flex flex-col">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">属性雷达</h2>
            <div className="flex-1 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                  />
                  <Radar
                    name="属性"
                    dataKey="value"
                    stroke="#FFD54F"
                    fill="#FFD54F"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    animationBegin={200}
                    animationDuration={1000}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26,10,46,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                    formatter={(value) => [`Lv.${value}`, '等级']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* RIGHT: Player info + Attributes + Equipment */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Player Card */}
          <GlassCard className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                >
                  {playerName}
                </h2>
                <span className="text-sm font-medium" style={{ color: '#FFD54F' }}>
                  {getCurrentTitle()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">Lv.{adventureProgress.level}</div>
                <div className="text-xs text-white/40">冒险等级</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/40">
                <span>总经验值 {totalExp}</span>
                <span>{adventureProgress.currentLevelExp} / {adventureProgress.nextLevelExp}</span>
              </div>
              <ProgressBar value={adventureProgress.progress} color="#FFD54F" />
            </div>
          </GlassCard>

          {/* Attribute Details */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">属性详情</h3>
            <div className="divide-y divide-white/5">
              {ATTRIBUTES.map(attr => (
                <AttributeDetail key={attr.key} attributeKey={attr.key} />
              ))}
            </div>
          </GlassCard>

          {/* Equipment Slots */}
          <GlassCard className="p-5">
            <EquipmentSlots />
          </GlassCard>

          {/* Breakthrough Status */}
          <BreakthroughPanel
            adventureLevel={adventureProgress.level}
            attributeExp={attributeExp}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CharacterPage;
