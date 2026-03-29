import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface GachaPrize {
  name: string;
  rarity: 3 | 4 | 5;
  isUp?: boolean;
}

interface GachaAnimationProps {
  show: boolean;
  prizes: GachaPrize[];
  mode: 'single' | 'multi';
  onDismiss?: () => void;
}

type Phase = 'loading' | 'video' | 'result' | 'done';

const RARITY_COLORS: Record<3 | 4 | 5, string> = {
  3: '#64B5F6',
  4: '#CE93D8',
  5: '#FFD54F',
};

const RARITY_BORDER_CLASS: Record<3 | 4 | 5, string> = {
  3: 'border-[#9E9E9E]/60',
  4: 'border-[#CE93D8]/60',
  5: 'border-[#FFD54F]/60',
};

function getHighestRarity(prizes: GachaPrize[]): 3 | 4 | 5 {
  return prizes.reduce<3 | 4 | 5>((max, p) => (p.rarity > max ? p.rarity : max), 3);
}

function getVideoPath(prizes: GachaPrize[], mode: 'single' | 'multi'): string {
  const highest = getHighestRarity(prizes);
  if (mode === 'single') {
    return `/videos/gacha/${highest}star-single.mp4`;
  }
  // Multi pull
  if (highest === 5) return '/videos/gacha/5star-multi.mp4';
  if (highest === 4) return '/videos/gacha/4star-multi.mp4';
  // All 3-star multi: use 3star-single as fallback
  return '/videos/gacha/3star-single.mp4';
}

function sortPrizes(prizes: GachaPrize[]): GachaPrize[] {
  return [...prizes].sort((a, b) => b.rarity - a.rarity);
}

/* ---------- Single Pull Result Card ---------- */
function SingleResultCard({ prize, onSkip }: { prize: GachaPrize; onSkip: () => void }) {
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [canDismiss, setCanDismiss] = useState(prize.rarity !== 5);
  const stars = '★'.repeat(prize.rarity);

  useEffect(() => {
    // Animate stars in one by one
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < prize.rarity; i++) {
      timers.push(setTimeout(() => setStarsRevealed(i + 1), 150 + i * 150));
    }
    // For 5-star: allow dismiss after all stars + extra time
    if (prize.rarity === 5) {
      timers.push(setTimeout(() => setCanDismiss(true), 150 + prize.rarity * 150 + 500));
    }
    // Auto-dismiss for 3-star
    if (prize.rarity === 3) {
      timers.push(setTimeout(() => onSkip(), 1500));
    }
    // Auto-dismiss for 4-star
    if (prize.rarity === 4) {
      timers.push(setTimeout(() => onSkip(), 2000));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prize.rarity]);

  const glowClass =
    prize.rarity === 5
      ? 'gacha-pulse-gold'
      : prize.rarity === 4
        ? 'gacha-pulse-purple'
        : '';

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={() => canDismiss && onSkip()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative flex flex-col items-center gap-5 rounded-2xl px-16 py-10 border-2 ${RARITY_BORDER_CLASS[prize.rarity]}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          animationName: glowClass,
          animationDuration: '2s',
          animationIterationCount: 'infinite',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stars */}
        <div className="flex gap-1">
          {stars.split('').map((s, i) => (
            <motion.span
              key={i}
              className="text-lg"
              style={{
                color: RARITY_COLORS[prize.rarity],
                textShadow: prize.rarity === 5 ? `0 0 12px ${RARITY_COLORS[5]}` : undefined,
                opacity: i < starsRevealed ? 1 : 0,
                transform: i < starsRevealed ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.2s, transform 0.3s',
              }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        {/* Prize name */}
        <motion.div
          className="text-white text-3xl font-bold text-center"
          style={{
            fontFamily: 'Noto Serif SC, serif',
            textShadow: `0 0 20px ${RARITY_COLORS[prize.rarity]}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {prize.name}
        </motion.div>

        {/* UP badge */}
        {prize.isUp && (
          <motion.span
            className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #FFD54F, #FFB300)',
              color: '#0a0a1a',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            UP
          </motion.span>
        )}

        {/* Hint */}
        {canDismiss && (
          <motion.p
            className="text-white/30 text-xs mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            点击关闭
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- Multi Pull Result Grid ---------- */
function MultiResultGrid({ prizes, onClose }: { prizes: GachaPrize[]; onClose: () => void }) {
  const sorted = sortPrizes(prizes);

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-8"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="grid grid-cols-5 gap-3 max-w-3xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {sorted.map((prize, i) => {
          const is5Star = prize.rarity === 5;
          const glowStyle =
            prize.rarity === 5
              ? 'gacha-pulse-gold'
              : prize.rarity === 4
                ? 'gacha-pulse-purple'
                : '';
          return (
            <motion.div
              key={i}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border-2 ${RARITY_BORDER_CLASS[prize.rarity]} ${is5Star ? 'col-span-2 py-6' : ''}`}
              style={{
                background: `${RARITY_COLORS[prize.rarity]}10`,
                backdropFilter: 'blur(10px)',
                animationName: glowStyle,
                animationDuration: '2s',
                animationIterationCount: 'infinite',
              }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div
                className="text-xs font-bold tracking-wider"
                style={{ color: RARITY_COLORS[prize.rarity] }}
              >
                {'★'.repeat(prize.rarity)}
              </div>
              <div
                className={`text-white text-center font-medium leading-tight ${is5Star ? 'text-lg' : 'text-xs'}`}
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              >
                {prize.name}
              </div>
              {prize.isUp && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: '#FFD54F33', color: '#FFD54F' }}
                >
                  UP
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.button
        className="mt-6 px-8 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + prizes.length * 0.08 }}
        onClick={onClose}
      >
        关闭
      </motion.button>
    </motion.div>
  );
}

/* ---------- Main GachaAnimation Component ---------- */
export function GachaAnimation({ show, prizes, mode, onDismiss }: GachaAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const highestRarity = getHighestRarity(prizes);

  // Reset phase when show changes
  useEffect(() => {
    if (show && prizes.length > 0) {
      setPhase('loading');
      setVideoReady(false);
      setVideoError(false);
    }
  }, [show, prizes]);

  // Start video when ready
  useEffect(() => {
    if (phase === 'loading' && videoReady && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // If autoplay fails, skip to result
        setPhase('result');
      });
      setPhase('video');
    }
  }, [phase, videoReady]);

  // If video fails to load, skip directly to result
  useEffect(() => {
    if (videoError && phase === 'loading') {
      setPhase('result');
    }
  }, [videoError, phase]);

  const handleVideoEnded = useCallback(() => {
    setPhase('result');
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoClick = useCallback(() => {
    // 5-star: cannot skip video
    if (highestRarity === 5) return;
    // Skip video, go to result
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase('result');
  }, [highestRarity]);

  const handleResultDismiss = useCallback(() => {
    setPhase('done');
    onDismiss?.();
  }, [onDismiss]);

  if (!show || prizes.length === 0) return null;

  const videoPath = getVideoPath(prizes, mode);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          style={{ background: '#000' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Video element */}
          {(phase === 'loading' || phase === 'video') && (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={videoPath}
                muted
                playsInline
                onCanPlay={handleVideoCanPlay}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onClick={handleVideoClick}
                style={{ cursor: highestRarity === 5 ? 'default' : 'pointer' }}
              />
              {/* Loading indicator */}
              {phase === 'loading' && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
              {/* Skip hint for non-5-star */}
              {phase === 'video' && highestRarity !== 5 && (
                <motion.p
                  className="absolute bottom-8 right-8 text-white/30 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  点击跳过
                </motion.p>
              )}
            </>
          )}

          {/* Darkened background after video for result display */}
          {phase === 'result' && (
            <div className="absolute inset-0 bg-black/70" />
          )}

          {/* Result overlay */}
          <AnimatePresence>
            {phase === 'result' && mode === 'single' && (
              <SingleResultCard
                prize={prizes[0]}
                onSkip={handleResultDismiss}
              />
            )}
            {phase === 'result' && mode === 'multi' && (
              <MultiResultGrid
                prizes={prizes}
                onClose={handleResultDismiss}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
