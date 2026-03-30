import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGachaStore } from '../../stores/useGachaStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { GachaAnimation } from '../../components/animations/GachaAnimation';
import type { GachaPrize, GachaPool } from '../../types';
import { GACHA_CONFIG, DEFAULT_GACHA_POOLS } from '../../lib/constants';

const RARITY_COLORS: Record<number, string> = {
  3: '#9E9E9E',
  4: '#CE93D8',
  5: '#FFD54F',
};

interface PrizeInput {
  name: string;
  emoji: string;
  description: string;
}

interface PoolConfigModalProps {
  onClose: () => void;
  onSave: (data: Omit<GachaPool, 'id' | 'userId' | 'createdAt'>) => void;
}

function PoolConfigModal({ onClose, onSave }: PoolConfigModalProps) {
  const [poolName, setPoolName] = useState('');
  const [fiveStarUp, setFiveStarUp] = useState<PrizeInput>({ name: '', emoji: '', description: '' });
  const [standardItems, setStandardItems] = useState<PrizeInput[]>([
    { name: '', emoji: '', description: '' },
    { name: '', emoji: '', description: '' },
  ]);
  const [fourStarItems, setFourStarItems] = useState<PrizeInput[]>(
    Array.from({ length: 5 }, () => ({ name: '', emoji: '', description: '' }))
  );
  const [threeStarItems, setThreeStarItems] = useState<PrizeInput[]>(
    Array.from({ length: 5 }, () => ({ name: '', emoji: '', description: '' }))
  );

  const applyTemplate = (templateIndex: number) => {
    const pool = DEFAULT_GACHA_POOLS[templateIndex];
    if (!pool) return;
    setPoolName(pool.poolName);
    setFiveStarUp({
      name: pool.fiveStarUp.name,
      emoji: pool.fiveStarUp.emoji || '',
      description: pool.fiveStarUp.description || '',
    });
    setStandardItems(
      pool.fiveStarStandard.map((p) => ({
        name: p.name,
        emoji: p.emoji || '',
        description: p.description || '',
      }))
    );
    setFourStarItems(
      pool.fourStarItems.map((p) => ({
        name: p.name,
        emoji: p.emoji || '',
        description: p.description || '',
      }))
    );
    setThreeStarItems(
      pool.threeStarItems.map((p) => ({
        name: p.name,
        emoji: p.emoji || '',
        description: p.description || '',
      }))
    );
  };

  const handleSave = () => {
    if (!poolName.trim() || !fiveStarUp.name.trim()) return;

    const fiveStarStandard = standardItems
      .filter((n) => n.name.trim())
      .map((n) => ({ name: n.name.trim(), rarity: 5 as const, emoji: n.emoji.trim() || undefined, description: n.description.trim() || undefined }));
    const fourStars = fourStarItems
      .filter((n) => n.name.trim())
      .map((n) => ({ name: n.name.trim(), rarity: 4 as const, emoji: n.emoji.trim() || undefined, description: n.description.trim() || undefined }));
    const threeStars = threeStarItems
      .filter((n) => n.name.trim())
      .map((n) => ({ name: n.name.trim(), rarity: 3 as const, emoji: n.emoji.trim() || undefined, description: n.description.trim() || undefined }));

    onSave({
      poolName: poolName.trim(),
      fiveStarUp: {
        name: fiveStarUp.name.trim(),
        rarity: 5,
        isUp: true,
        emoji: fiveStarUp.emoji.trim() || undefined,
        description: fiveStarUp.description.trim() || undefined,
      },
      fiveStarStandard,
      fourStarItems: fourStars,
      threeStarItems: threeStars,
      isActive: true,
    });
    onClose();
  };

  const updateItem = (
    setter: React.Dispatch<React.SetStateAction<PrizeInput[]>>,
    index: number,
    field: keyof PrizeInput,
    value: string
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const renderPrizeInputs = (
    items: PrizeInput[],
    setter: React.Dispatch<React.SetStateAction<PrizeInput[]>>,
    label: string,
    borderColor: string,
  ) => (
    <div>
      <label className="block text-sm mb-1" style={{ color: `${borderColor}CC` }}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="w-12 rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-white/30"
              value={item.emoji}
              onChange={(e) => updateItem(setter, i, 'emoji', e.target.value)}
              placeholder="😊"
              title="表情"
            />
            <input
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none"
              style={{ borderColor: `${borderColor}30` }}
              value={item.name}
              onChange={(e) => updateItem(setter, i, 'name', e.target.value)}
              placeholder={`名称 ${i + 1}`}
            />
            <input
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none"
              value={item.description}
              onChange={(e) => updateItem(setter, i, 'description', e.target.value)}
              placeholder="描述"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-[#0f0f2a]/95 p-6 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-lg font-semibold text-[#FFD54F] mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          配置卡池
        </h2>

        {/* Template buttons */}
        <div className="flex gap-2 mb-4">
          <span className="text-xs text-white/40 self-center">使用推荐卡池：</span>
          {DEFAULT_GACHA_POOLS.map((pool, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(i)}
              className="rounded-lg border border-[#FFD54F]/20 px-3 py-1 text-xs text-[#FFD54F]/70 hover:bg-[#FFD54F]/10 transition-colors"
            >
              {pool.poolName}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">卡池名称</label>
            <input
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD54F]/50"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              placeholder="例：命运的馈赠"
            />
          </div>

          {/* UP 5-star */}
          <div>
            <label className="block text-sm text-[#FFD54F]/80 mb-1">UP 五星</label>
            <div className="flex gap-2">
              <input
                className="w-12 rounded-lg bg-white/5 border border-[#FFD54F]/20 px-2 py-2 text-white text-sm text-center focus:outline-none"
                value={fiveStarUp.emoji}
                onChange={(e) => setFiveStarUp((p) => ({ ...p, emoji: e.target.value }))}
                placeholder="🏖️"
                title="表情"
              />
              <input
                className="flex-1 rounded-lg bg-white/5 border border-[#FFD54F]/20 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD54F]/50"
                value={fiveStarUp.name}
                onChange={(e) => setFiveStarUp((p) => ({ ...p, name: e.target.value }))}
                placeholder="UP五星名称"
              />
              <input
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none"
                value={fiveStarUp.description}
                onChange={(e) => setFiveStarUp((p) => ({ ...p, description: e.target.value }))}
                placeholder="描述"
              />
            </div>
          </div>

          {renderPrizeInputs(standardItems, setStandardItems, '常驻五星（2个）', '#FFD54F')}
          {renderPrizeInputs(fourStarItems, setFourStarItems, '四星物品（5个）', '#CE93D8')}
          {renderPrizeInputs(threeStarItems, setThreeStarItems, '三星物品（5个）', '#9E9E9E')}
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
            disabled={!poolName.trim() || !fiveStarUp.name.trim()}
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

export default function GachaPanel() {
  const { pools, history, createPool, deletePool, pullSingle, pullTen, getPityInfo } = useGachaStore();
  const stardust = usePlayerStore((s) => s.stardust);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [showInventoryToast, setShowInventoryToast] = useState(false);

  // Animation state
  const [animState, setAnimState] = useState<{
    show: boolean;
    prizes: GachaPrize[];
    mode: 'single' | 'multi';
  }>({ show: false, prizes: [], mode: 'single' });

  // Auto-create default pools on first load if none exist
  useEffect(() => {
    if (pools.length === 0) {
      for (const pool of DEFAULT_GACHA_POOLS) {
        createPool(pool);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePool = selectedPoolId
    ? pools.find((p) => p.id === selectedPoolId)
    : pools[0];

  const pityInfo = activePool ? getPityInfo(activePool.id) : null;
  const poolHistory = activePool ? history.filter((h) => h.poolId === activePool.id) : [];

  const handleSinglePull = () => {
    if (!activePool) return;
    const prize = pullSingle(activePool.id);
    if (prize) {
      setAnimState({ show: true, prizes: [prize], mode: 'single' });
    }
  };

  const handleTenPull = () => {
    if (!activePool) return;
    const prizes = pullTen(activePool.id);
    if (prizes.length > 0) {
      setAnimState({ show: true, prizes, mode: 'multi' });
    }
  };

  const handleAnimDismiss = () => {
    setAnimState({ show: false, prizes: [], mode: 'single' });
    // Show inventory toast
    setShowInventoryToast(true);
    setTimeout(() => setShowInventoryToast(false), 2000);
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
                      {activePool.fiveStarUp.emoji && `${activePool.fiveStarUp.emoji} `}
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
                          {entry.prize.emoji && (
                            <span className="text-sm">{entry.prize.emoji}</span>
                          )}
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

      {/* Config Modal */}
      <AnimatePresence>
        {showConfig && (
          <PoolConfigModal
            onClose={() => setShowConfig(false)}
            onSave={(data) => createPool(data)}
          />
        )}
      </AnimatePresence>

      {/* Gacha Animation Overlay */}
      <GachaAnimation
        show={animState.show}
        prizes={animState.prizes}
        mode={animState.mode}
        onDismiss={handleAnimDismiss}
      />

      {/* Inventory toast */}
      <AnimatePresence>
        {showInventoryToast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10002] px-5 py-2.5 rounded-xl border border-[#FFD54F]/30 text-sm text-[#FFD54F]"
            style={{ background: 'rgba(15,15,42,0.95)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            已存入背包
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
