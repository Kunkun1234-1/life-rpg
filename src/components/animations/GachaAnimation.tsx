import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GachaRarity } from '../../types';

interface GachaPrizeInput {
  name: string;
  rarity: GachaRarity;
}

interface GachaAnimationProps {
  show: boolean;
  prizes: GachaPrizeInput[];
  onDismiss?: () => void;
}

const RARITY_COLORS: Record<GachaRarity, string> = {
  3: '#9E9E9E',
  4: '#CE93D8',
  5: '#FFD54F',
};

const PARTICLE_COUNT = 16;

function getHighestRarity(prizes: GachaPrizeInput[]): GachaRarity {
  return prizes.reduce((max, p) => (p.rarity > max ? p.rarity : max), 3 as GachaRarity);
}

function getDismissDelay(rarity: GachaRarity): number {
  if (rarity === 5) return 5000;
  if (rarity === 4) return 3000;
  return 2000;
}

interface SinglePullProps {
  prize: GachaPrizeInput;
  rarity: GachaRarity;
}

function ThreeStarDisplay({ prize }: SinglePullProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 rounded-2xl px-12 py-8"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${RARITY_COLORS[3]}44`,
        boxShadow: `0 0 30px ${RARITY_COLORS[3]}22`,
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div style={{ color: RARITY_COLORS[3] }} className="text-xs tracking-widest">
        ★★★
      </div>
      <div
        className="text-white text-2xl font-bold"
        style={{ fontFamily: 'Noto Serif SC, serif', textShadow: `0 0 12px ${RARITY_COLORS[3]}` }}
      >
        {prize.name}
      </div>
    </motion.div>
  );
}

function FourStarDisplay({ prize }: SinglePullProps) {
  return (
    <>
      {/* Purple beam from bottom */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 4,
          height: '100%',
          background: 'linear-gradient(to top, rgba(120,80,200,0.8), transparent)',
          transformOrigin: 'bottom',
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Purple particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const distance = 70 + Math.random() * 50;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: '50%', left: '50%', marginTop: -3, marginLeft: -3,
              background: RARITY_COLORS[4],
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * distance,
              y: Math.sin(rad) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.9, delay: 0.3 + i * 0.03, ease: 'easeOut' }}
          />
        );
      })}
      {/* Card with flip */}
      <motion.div
        className="flex flex-col items-center gap-3 rounded-2xl px-12 py-8 relative z-10"
        style={{
          background: 'rgba(120,80,200,0.15)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${RARITY_COLORS[4]}66`,
          boxShadow: `0 0 40px ${RARITY_COLORS[4]}33`,
        }}
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 180, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div style={{ color: RARITY_COLORS[4] }} className="text-xs tracking-widest">
          ★★★★
        </div>
        <div
          className="text-white text-2xl font-bold"
          style={{ fontFamily: 'Noto Serif SC, serif', textShadow: `0 0 16px ${RARITY_COLORS[4]}` }}
        >
          {prize.name}
        </div>
      </motion.div>
    </>
  );
}

function FiveStarDisplay({ prize }: SinglePullProps) {
  return (
    <>
      {/* Gold burst ring */}
      <motion.div
        className="absolute rounded-full border-2 border-yellow-400/50"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: 700, height: 700, opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      {/* Gold particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const distance = 90 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
              background: RARITY_COLORS[5],
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * distance,
              y: Math.sin(rad) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.2, delay: 0.2 + i * 0.04, ease: 'easeOut' }}
          />
        );
      })}
      {/* Card zoom */}
      <motion.div
        className="flex flex-col items-center gap-4 rounded-2xl px-14 py-10 relative z-10"
        style={{
          background: 'rgba(255,213,79,0.08)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${RARITY_COLORS[5]}88`,
          boxShadow: `0 0 60px ${RARITY_COLORS[5]}44`,
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.2, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
      >
        <div style={{ color: RARITY_COLORS[5] }} className="text-xs tracking-widest">
          ★★★★★
        </div>
        <motion.div
          className="text-3xl font-bold"
          style={{
            fontFamily: 'Noto Serif SC, serif',
            color: RARITY_COLORS[5],
            textShadow: `0 0 24px ${RARITY_COLORS[5]}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {prize.name}
        </motion.div>
        <motion.div
          className="text-yellow-400/60 text-xs tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          稀有物品
        </motion.div>
      </motion.div>
    </>
  );
}

function MultiPullGrid({ prizes }: { prizes: GachaPrizeInput[] }) {
  return (
    <motion.div
      className="grid grid-cols-5 gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {prizes.map((prize, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${RARITY_COLORS[prize.rarity]}55`,
            boxShadow: `0 0 12px ${RARITY_COLORS[prize.rarity]}22`,
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div
            className="text-xs font-bold"
            style={{ color: RARITY_COLORS[prize.rarity] }}
          >
            {'★'.repeat(prize.rarity)}
          </div>
          <div
            className="text-white text-xs text-center font-medium leading-tight"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            {prize.name}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function GachaAnimation({ show, prizes, onDismiss }: GachaAnimationProps) {
  const highestRarity = getHighestRarity(prizes);
  const isMultiPull = prizes.length > 1;
  const dismissDelay = getDismissDelay(highestRarity);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDismiss?.(), dismissDelay);
    return () => clearTimeout(timer);
  }, [show, dismissDelay, onDismiss]);

  const getOverlayStyle = () => {
    if (highestRarity === 5) {
      return {
        background: 'radial-gradient(circle at center, rgba(255,213,79,0.2) 0%, rgba(10,10,26,0.97) 70%)',
      };
    }
    if (highestRarity === 4) {
      return { background: 'rgba(120,80,200,0.3)' };
    }
    return { background: 'rgba(10,10,26,0.8)' };
  };

  const topPrize = prizes.reduce((best, p) => (p.rarity >= best.rarity ? p : best), prizes[0]);

  return (
    <AnimatePresence>
      {show && prizes.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={getOverlayStyle()}
          onClick={onDismiss}
        >
          {isMultiPull ? (
            <>
              {/* Show highest rarity animation briefly, then grid */}
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                {highestRarity === 5 && <FiveStarDisplay prize={topPrize} rarity={5} />}
                {highestRarity === 4 && <FourStarDisplay prize={topPrize} rarity={4} />}
                {highestRarity === 3 && <ThreeStarDisplay prize={topPrize} rarity={3} />}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <MultiPullGrid prizes={prizes} />
              </motion.div>
            </>
          ) : (
            <div className="relative flex items-center justify-center">
              {highestRarity === 5 && <FiveStarDisplay prize={topPrize} rarity={5} />}
              {highestRarity === 4 && <FourStarDisplay prize={topPrize} rarity={4} />}
              {highestRarity === 3 && <ThreeStarDisplay prize={topPrize} rarity={3} />}
            </div>
          )}

          <motion.p
            className="text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isMultiPull ? 2.5 : dismissDelay / 1000 - 1 }}
          >
            点击任意处关闭
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
