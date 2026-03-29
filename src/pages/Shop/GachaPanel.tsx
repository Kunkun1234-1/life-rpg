import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGachaStore } from '../../stores/useGachaStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { GachaPrize, GachaPool } from '../../types';
import { GACHA_CONFIG } from '../../lib/constants';

const RARITY_COLORS: Record<number, string> = {
  3: '#9E9E9E',
  4: '#CE93D8',
  5: '#FFD54F',
};

const RARITY_LABELS: Record<number, string> = {
  3: '三星',
  4: '四星',
  5: '五星',
};

interface PoolConfigModalProps {
  onClose: () => void;
  onSave: (data: Omit<GachaPool, 'id' | 'userId' | 'createdAt'>) => void;
}

function PoolConfigModal({ onClose, onSave }: PoolConfigModalProps) {
  const [poolName, setPoolName] = useState('');
  const [fiveStarUpName, setFiveStarUpName] = useState('');
  const [standardNames, setStandardNames] = useState(['', '']);
  const [fourStarNames, setFourStarNames] = useState(['', '', '', '', '']);
  const [threeStarNames, setThreeStarNames] = useState(['', '', '', '', '']);

  const handleSave = () => {
    if (!poolName.trim() || !fiveStarUpName.trim()) return;

    const fiveStarStandard = standardNames
      .filter((n) => n.trim())
      .map((n) => ({ name: n.trim(), rarity: 5 as const }));
    const fourStarItems = fourStarNames
      .filter((n) => n.trim())
      .map((n) => ({ name: n.trim(), rarity: 4 as const }));
    const threeStarItems = threeStarNames
      .filter((n) => n.trim())
      .map((n) => ({ name: n.trim(), rarity: 3 as const }));

    onSave({
      poolName: poolName.trim(),
      fiveStarUp: { name: fiveStarUpName.trim(), rarity: 5, isUp: true },
      fiveStarStandard,
      fourStarItems,
      threeStarItems,
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-[#0f0f2a]/95 p-6 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-lg font-semibold text-[#FFD54F] mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          配置卡池
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">卡池名称</label>
            <input
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD54F]/50"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              placeholder="例：命运的交叉路口"
            />
          </div>

          <div>
            <label className="block text-sm text-[#FFD54F]/80 mb-1">UP 五星名称</label>
            <input
              className="w-full rounded-lg bg-white/5 border border-[#FFD54F]/20 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD54F]/50"
              value={fiveStarUpName}
              onChange={(e) => setFiveStarUpName(e.target.value)}
              placeholder="UP五星物品名称"
            />
          </div>

          <div>
            <label className="block text-sm text-[#FFD54F]/80 mb-1">常驻五星（2个）</label>
            <div className="space-y-2">
              {standardNames.map((name, i) => (
                <input
                  key={i}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD54F]/30"
                  value={name}
                  onChange={(e) => {
                    const next = [...standardNames];
                    next[i] = e.target.value;
                    setStandardNames(next);
                  }}
                  placeholder={`常驻五星 ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#CE93D8]/80 mb-1">四星物品（5个）</label>
            <div className="space-y-2">
              {fourStarNames.map((name, i) => (
                <input
                  key={i}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CE93D8]/30"
                  value={name}
                  onChange={(e) => {
                    const next = [...fourStarNames];
                    next[i] = e.target.value;
                    setFourStarNames(next);
                  }}
                  placeholder={`四星物品 ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">三星物品（5个）</label>
            <div className="space-y-2">
              {threeStarNames.map((name, i) => (
                <input
                  key={i}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                  value={name}
                  onChange={(e) => {
                    const next = [...threeStarNames];
                    next[i] = e.target.value;
                    setThreeStarNames(next);
                  }}
                  placeholder={`三星物品 ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!poolName.trim() || !fiveStarUpName.trim()}
            className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#0a0a1a' }}
          >
            保存卡池
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface PullResultsDisplayProps {
  results: GachaPrize[];
  onClose: () => void;
}

function PullResultsDisplay({ results, onClose }: PullResultsDisplayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-[#0f0f2a]/95 p-6"
      >
        <h3 className="text-center text-[#FFD54F] font-semibold mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          祈愿结果
        </h3>
        <div className={`grid gap-3 ${results.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-5'}`}>
          {results.map((prize, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg p-3 flex flex-col items-center gap-1 border-2"
              style={{
                borderColor: RARITY_COLORS[prize.rarity],
                background: `${RARITY_COLORS[prize.rarity]}15`,
              }}
            >
              <span className="text-xs font-medium" style={{ color: RARITY_COLORS[prize.rarity] }}>
                {RARITY_LABELS[prize.rarity]}
              </span>
              <span className="text-white text-xs text-center leading-tight">{prize.name}</span>
              {prize.isUp && (
                <span className="text-[10px] text-[#FFD54F] bg-[#FFD54F]/20 px-1.5 py-0.5 rounded">UP</span>
              )}
            </motion.div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg py-2 text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
        >
          关闭
        </button>
      </motion.div>
    </div>
  );
}

export default function GachaPanel() {
  const { pools, history, createPool, deletePool, pullSingle, pullTen, getPityInfo } = useGachaStore();
  const stardust = usePlayerStore((s) => s.stardust);
  const [showConfig, setShowConfig] = useState(false);
  const [pullResults, setPullResults] = useState<GachaPrize[] | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  const activePool = selectedPoolId
    ? pools.find((p) => p.id === selectedPoolId)
    : pools[0];

  const pityInfo = activePool ? getPityInfo(activePool.id) : null;
  const poolHistory = activePool ? history.filter((h) => h.poolId === activePool.id) : [];

  const handleSinglePull = () => {
    if (!activePool) return;
    const prize = pullSingle(activePool.id);
    if (prize) setPullResults([prize]);
  };

  const handleTenPull = () => {
    if (!activePool) return;
    const prizes = pullTen(activePool.id);
    if (prizes.length > 0) setPullResults(prizes);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#FFD54F]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          祈愿
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">
            星尘余额：<span className="text-[#FFD54F] font-medium">{stardust}</span>
          </span>
          <button
            onClick={() => setShowConfig(true)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
          >
            配置卡池
          </button>
        </div>
      </div>

      {pools.length === 0 ? (
        /* No pool state */
        <div
          className="rounded-xl border border-white/10 p-10 flex flex-col items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
        >
          <div className="text-4xl">✨</div>
          <p className="text-white/40 text-sm">请先配置卡池</p>
          <button
            onClick={() => setShowConfig(true)}
            className="rounded-lg px-5 py-2 text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#0a0a1a' }}
          >
            配置卡池
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pool selector */}
          {pools.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {pools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => setSelectedPoolId(pool.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors border ${
                    activePool?.id === pool.id
                      ? 'border-[#FFD54F]/50 text-[#FFD54F] bg-[#FFD54F]/10'
                      : 'border-white/10 text-white/50 hover:bg-white/5'
                  }`}
                >
                  {pool.poolName}
                </button>
              ))}
            </div>
          )}

          {activePool && (
            <>
              {/* Pull area */}
              <div
                className="rounded-xl border border-white/10 p-5"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-medium" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                      {activePool.poolName}
                    </h3>
                    <p className="text-sm text-[#FFD54F]/70 mt-0.5">
                      UP ★★★★★ · {activePool.fiveStarUp.name}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePool(activePool.id)}
                    className="text-xs text-white/20 hover:text-red-400/60 transition-colors"
                  >
                    删除
                  </button>
                </div>

                {/* Pity display */}
                {pityInfo && (
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                      距四星：<span className="text-[#CE93D8]">{pityInfo.pullsSinceLast4Star}</span>/{GACHA_CONFIG.FOUR_STAR_GUARANTEE}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                      距五星：<span className="text-[#FFD54F]">{pityInfo.pullsSinceLast5Star}</span>/{GACHA_CONFIG.HARD_PITY}
                    </span>
                    {pityInfo.lost5050 && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFD54F]/10 border border-[#FFD54F]/30 text-[#FFD54F]">
                        大保底
                      </span>
                    )}
                    <span className="text-xs text-white/30">总计：{pityInfo.totalPulls}抽</span>
                  </div>
                )}

                {/* Pull buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSinglePull}
                    disabled={stardust < GACHA_CONFIG.PULL_COST}
                    className="flex-1 rounded-lg py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: stardust >= GACHA_CONFIG.PULL_COST
                        ? 'linear-gradient(135deg, rgba(255,213,79,0.2), rgba(255,213,79,0.1))'
                        : undefined,
                      border: '1px solid rgba(255,213,79,0.3)',
                      color: '#FFD54F',
                    }}
                  >
                    祈愿×1
                    <span className="block text-[11px] text-white/40 mt-0.5">{GACHA_CONFIG.PULL_COST} 星尘</span>
                  </button>
                  <button
                    onClick={handleTenPull}
                    disabled={stardust < GACHA_CONFIG.TEN_PULL_COST}
                    className="flex-1 rounded-lg py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: stardust >= GACHA_CONFIG.TEN_PULL_COST
                        ? 'linear-gradient(135deg, rgba(255,213,79,0.3), rgba(255,179,0,0.2))'
                        : undefined,
                      border: '1px solid rgba(255,213,79,0.5)',
                      color: '#FFD54F',
                    }}
                  >
                    祈愿×10
                    <span className="block text-[11px] text-white/40 mt-0.5">{GACHA_CONFIG.TEN_PULL_COST} 星尘</span>
                  </button>
                </div>
              </div>

              {/* History */}
              {poolHistory.length > 0 && (
                <div
                  className="rounded-xl border border-white/10 p-4"
                  style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}
                >
                  <h4 className="text-sm text-white/50 mb-3">祈愿记录</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {poolHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-sm rounded-lg px-3 py-1.5"
                        style={{ background: `${RARITY_COLORS[entry.prize.rarity]}10` }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium w-8"
                            style={{ color: RARITY_COLORS[entry.prize.rarity] }}
                          >
                            {entry.prize.rarity}★
                          </span>
                          <span className="text-white/80">{entry.prize.name}</span>
                          {entry.prize.isUp && (
                            <span className="text-[10px] text-[#FFD54F] bg-[#FFD54F]/20 px-1 rounded">UP</span>
                          )}
                          {entry.isGuaranteed && (
                            <span className="text-[10px] text-white/40 bg-white/5 px-1 rounded">保底</span>
                          )}
                        </div>
                        <span className="text-white/30 text-xs">第{entry.pullNumber}抽</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showConfig && (
          <PoolConfigModal
            onClose={() => setShowConfig(false)}
            onSave={(data) => createPool(data)}
          />
        )}
        {pullResults && (
          <PullResultsDisplay
            results={pullResults}
            onClose={() => setPullResults(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
