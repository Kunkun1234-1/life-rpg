import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BossReward {
  label: string;
  value: number | string;
}

interface BossDefeatAnimationProps {
  show: boolean;
  bossName: string;
  rewards: BossReward[];
  onDismiss?: () => void;
}

export function BossDefeatAnimation({
  show,
  bossName,
  rewards,
  onDismiss,
}: BossDefeatAnimationProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(10,10,26,0.92)' }}
          onClick={onDismiss}
        >
          {/* Boss name with strikethrough */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-red-400/80 text-3xl font-bold"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {bossName}
            </span>
            {/* Animated strikethrough line */}
            <motion.div
              className="absolute h-0.5 bg-red-500 top-1/2"
              style={{ left: 0 }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.4, duration: 0.4 }}
            />
          </motion.div>

          {/* DEFEATED banner */}
          <motion.div
            className="text-yellow-300 text-5xl font-extrabold tracking-widest"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 16 }}
          >
            已击败
          </motion.div>

          {/* Reward items drop in with stagger */}
          <div className="flex flex-col items-center gap-2 mt-2">
            {rewards.map((r, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-white/80 text-base"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.15, type: 'spring', stiffness: 200 }}
              >
                <span className="text-yellow-400 font-bold">+{r.value}</span>
                <span>{r.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-white/30 text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            点击任意处关闭
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
