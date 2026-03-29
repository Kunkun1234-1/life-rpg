import { AnimatePresence, motion } from 'framer-motion';

interface TaskCompleteAnimationProps {
  show: boolean;
  exp: number;
  stardust: number;
  position?: { x: number; y: number };
}

export function TaskCompleteAnimation({
  show,
  exp,
  stardust,
  position,
}: TaskCompleteAnimationProps) {
  const style: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y }
    : { position: 'fixed', right: 24, bottom: 80 };

  return (
    <AnimatePresence>
      {show && (
        <div style={style} className="pointer-events-none z-40 flex flex-col items-end gap-1">
          {/* EXP float */}
          <motion.div
            className="text-yellow-300 font-bold text-base drop-shadow"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -48 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            +{exp} EXP
          </motion.div>

          {/* Stardust float */}
          {stardust > 0 && (
            <motion.div
              className="text-blue-300 font-bold text-sm drop-shadow"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
            >
              +{stardust} ✦
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
