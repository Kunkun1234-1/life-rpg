import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Achievement } from '../../types';

interface AchievementUnlockAnimationProps {
  show: boolean;
  achievement: Achievement | null;
  onDismiss?: () => void;
}

const PARTICLE_COUNT = 16;

export function AchievementUnlockAnimation({
  show,
  achievement,
  onDismiss,
}: AchievementUnlockAnimationProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(10,10,26,0.75)' }}
          onClick={onDismiss}
        >
          {/* Gold particles */}
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = (i / PARTICLE_COUNT) * 360;
            const distance = 80 + Math.random() * 60;
            const rad = (angle * Math.PI) / 180;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(rad) * distance,
                  y: Math.sin(rad) * distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.02, ease: 'easeOut' }}
              />
            );
          })}

          {/* Badge popup */}
          <motion.div
            className="relative flex flex-col items-center gap-3 rounded-2xl px-10 py-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,213,79,0.4)',
              boxShadow: '0 0 40px rgba(255,213,79,0.15)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <div className="text-yellow-400 text-xs tracking-widest uppercase">成就解锁</div>

            <div className="text-4xl">🏆</div>

            <div
              className="text-white text-xl font-bold"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {achievement.name}
            </div>

            <motion.div
              className="text-white/60 text-sm text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.description}
            </motion.div>

            <div className="text-yellow-400/70 text-xs mt-1">+{achievement.points} 成就点</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
