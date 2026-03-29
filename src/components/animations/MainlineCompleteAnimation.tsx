import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LinkedAchievement {
  name: string;
  description: string;
  points: number;
}

interface MainlineCompleteAnimationProps {
  show: boolean;
  mainlineTitle: string;
  linkedAchievement?: LinkedAchievement | null;
  onDismiss?: () => void;
}

export function MainlineCompleteAnimation({
  show,
  mainlineTitle,
  linkedAchievement,
  onDismiss,
}: MainlineCompleteAnimationProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDismiss?.(), 6000);
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
          {/* Mainline title */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div
              className="text-white text-4xl font-bold text-center px-8"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {mainlineTitle}
            </div>

            {/* Gold strikethrough line */}
            <motion.div
              className="h-0.5 rounded-full"
              style={{
                background: '#FFD54F',
                boxShadow: '0 0 8px rgba(255,213,79,0.6)',
                width: '100%',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.5, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* 主线完结 label */}
          <motion.div
            className="text-xl tracking-widest font-medium"
            style={{ color: '#FFD54F', fontFamily: 'Noto Serif SC, serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            主线完结
          </motion.div>

          {/* Linked achievement badge */}
          {linkedAchievement && (
            <motion.div
              className="flex flex-col items-center gap-2 rounded-2xl px-8 py-5 mx-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,213,79,0.5)',
                boxShadow: '0 0 30px rgba(255,213,79,0.15)',
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 3 }}
            >
              <div className="text-yellow-400 text-xs tracking-widest">成就解锁</div>
              <div
                className="text-white text-lg font-bold"
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              >
                {linkedAchievement.name}
              </div>
              <div className="text-white/60 text-sm text-center max-w-xs">
                {linkedAchievement.description}
              </div>
              <div className="text-yellow-400/70 text-xs">+{linkedAchievement.points} 成就点</div>
            </motion.div>
          )}

          {/* Dismiss hint */}
          <motion.p
            className="text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
          >
            点击任意处关闭
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
