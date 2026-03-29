import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  title: string;
  onDismiss?: () => void;
}

export function LevelUpAnimation({ show, level, title, onDismiss }: LevelUpAnimationProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,213,79,0.25) 0%, rgba(10,10,26,0.95) 70%)',
          }}
          onClick={onDismiss}
        >
          {/* Gold burst ring */}
          <motion.div
            className="absolute rounded-full border-2 border-yellow-400/50"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 600, height: 600, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Level label */}
          <motion.p
            className="text-yellow-400/80 text-sm tracking-[0.3em] uppercase mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            冒险等级提升
          </motion.p>

          {/* Level number */}
          <motion.div
            className="text-yellow-300 font-bold"
            style={{ fontSize: '6rem', lineHeight: 1, fontFamily: 'Noto Serif SC, serif' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          >
            {level}
          </motion.div>

          {/* Title */}
          <motion.div
            className="mt-4 text-2xl text-white/90"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {title}
          </motion.div>

          <motion.p
            className="mt-6 text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            点击任意处关闭
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
