import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playWishStart, play3StarReveal, play4StarReveal, play5StarReveal, playAmbientDrone } from '../../lib/gachaAudio';

interface GachaPrize {
  name: string;
  rarity: 3 | 4 | 5;
  isUp?: boolean;
  emoji?: string;
  description?: string;
}

interface GachaAnimationProps {
  show: boolean;
  prizes: GachaPrize[];
  mode: 'single' | 'multi';
  onDismiss?: () => void;
}

type Phase = 'loading' | 'video' | 'result' | 'multi-reveal' | 'multi-grid' | 'done';

const RARITY_COLORS: Record<3 | 4 | 5, string> = {
  3: '#64B5F6',
  4: '#CE93D8',
  5: '#FFD54F',
};

const RARITY_ORB_RGBA: Record<3 | 4 | 5, string> = {
  3: 'rgba(99,124,205',
  4: 'rgba(156,71,218',
  5: 'rgba(253,148,48',
};

const RARITY_BG: Record<3 | 4 | 5, string> = {
  3: 'radial-gradient(circle, rgba(99,124,205,0.2) 0%, rgba(0,0,0,0.95) 60%)',
  4: 'radial-gradient(circle, rgba(156,71,218,0.25) 0%, rgba(0,0,0,0.95) 60%)',
  5: 'radial-gradient(circle, rgba(253,148,48,0.3) 0%, rgba(0,0,0,0.95) 60%)',
};

const RARITY_BORDER_CLASS: Record<3 | 4 | 5, string> = {
  3: 'border-[#64B5F6]/40',
  4: 'border-[#CE93D8]/40',
  5: 'border-[#FFD54F]/40',
};

// Dismiss timings per rarity
const AUTO_DISMISS_MS: Record<3 | 4 | 5, number> = { 3: 1200, 4: 1500, 5: 3000 };
const CAN_DISMISS_MS: Record<3 | 4 | 5, number> = { 3: 0, 4: 0, 5: 3000 };
// Multi-reveal auto-advance timings
const MULTI_ADVANCE_MS: Record<3 | 4 | 5, number> = { 3: 800, 4: 1500, 5: 3000 };

function getHighestRarity(prizes: GachaPrize[]): 3 | 4 | 5 {
  return prizes.reduce<3 | 4 | 5>((max, p) => (p.rarity > max ? p.rarity : max), 3);
}

function getVideoPath(prizes: GachaPrize[], mode: 'single' | 'multi'): string {
  const highest = getHighestRarity(prizes);
  if (mode === 'single') {
    return `/videos/gacha/${highest}star-single.mp4`;
  }
  if (highest === 5) return '/videos/gacha/5star-multi.mp4';
  if (highest === 4) return '/videos/gacha/4star-multi.mp4';
  return '/videos/gacha/3star-single.mp4';
}

function sortPrizes(prizes: GachaPrize[]): GachaPrize[] {
  return [...prizes].sort((a, b) => b.rarity - a.rarity);
}

/* ---------- Animated Orbs ---------- */
function SplashOrbs({ rarity }: { rarity: 3 | 4 | 5 }) {
  const orbCount = rarity === 5 ? 5 : rarity === 4 ? 4 : 3;
  const rgba = RARITY_ORB_RGBA[rarity];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: orbCount }).map((_, i) => {
        const size = 120 + i * 80;
        const delay = 0.15 * i;
        const duration = 0.75 + i * 0.12;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, ${rgba},0.4) 0%, ${rgba},0) 70%)`,
              boxShadow: `0 0 ${30 + i * 10}px ${rgba},0.3), inset 0 0 ${20 + i * 8}px ${rgba},0.2)`,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration, delay, ease: 'easeOut' }}
          />
        );
      })}
      {/* Persistent glow orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${rgba},0.15) 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ---------- Single Pull Result Card ---------- */
function SingleResultCard({
  prize,
  onSkip,
}: {
  prize: GachaPrize;
  onSkip: () => void;
}) {
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [canDismiss, setCanDismiss] = useState(prize.rarity === 3);
  const stars = '★'.repeat(prize.rarity);
  const starDelay = prize.rarity === 5 ? 200 : prize.rarity === 4 ? 150 : 0;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Animate stars one by one
    if (starDelay > 0) {
      for (let i = 0; i < prize.rarity; i++) {
        timers.push(setTimeout(() => setStarsRevealed(i + 1), 300 + i * starDelay));
      }
    } else {
      setStarsRevealed(prize.rarity);
    }

    // Set dismissable
    if (CAN_DISMISS_MS[prize.rarity] > 0) {
      timers.push(setTimeout(() => setCanDismiss(true), CAN_DISMISS_MS[prize.rarity]));
    } else {
      setCanDismiss(true);
    }

    // Auto-dismiss for 3-star
    if (prize.rarity === 3) {
      timers.push(setTimeout(() => onSkip(), AUTO_DISMISS_MS[3]));
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prize.rarity]);

  const glowAnim =
    prize.rarity === 5
      ? 'gacha-pulse-gold'
      : prize.rarity === 4
        ? 'gacha-pulse-purple'
        : '';

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ background: RARITY_BG[prize.rarity] }}
      onClick={() => canDismiss && onSkip()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Orbs */}
      <SplashOrbs rarity={prize.rarity} />

      {/* Card */}
      <motion.div
        className={`relative z-10 flex flex-col items-center gap-4 rounded-2xl px-14 py-10 border-2 ${RARITY_BORDER_CLASS[prize.rarity]}`}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          animationName: glowAnim,
          animationDuration: '2s',
          animationIterationCount: 'infinite',
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji icon */}
        {prize.emoji && (
          <motion.div
            className="text-[4rem] leading-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          >
            {prize.emoji}
          </motion.div>
        )}

        {/* Prize name */}
        <motion.div
          className="text-white text-2xl font-bold text-center"
          style={{
            fontFamily: 'Noto Serif SC, serif',
            textShadow: `0 0 20px ${RARITY_COLORS[prize.rarity]}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {prize.name}
        </motion.div>

        {/* Description */}
        {prize.description && (
          <motion.p
            className="text-white/50 text-xs text-center max-w-[240px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {prize.description}
          </motion.p>
        )}

        {/* Stars */}
        <div className="flex gap-1">
          {stars.split('').map((s, i) => (
            <motion.span
              key={i}
              className="text-lg"
              style={{
                color: RARITY_COLORS[prize.rarity],
                textShadow:
                  prize.rarity === 5 ? `0 0 12px ${RARITY_COLORS[5]}` : undefined,
                opacity: i < starsRevealed ? 1 : 0,
                transform: i < starsRevealed ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.2s, transform 0.3s',
              }}
            >
              {s}
            </motion.span>
          ))}
        </div>

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

        {/* Inventory confirmation */}
        <motion.p
          className="text-white/30 text-xs mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          存入背包
        </motion.p>

        {/* Dismiss hint */}
        {canDismiss && (
          <motion.p
            className="text-white/20 text-[10px]"
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

/* ---------- Multi Pull: One-by-one Reveal ---------- */
function MultiReveal({
  prizes,
  onComplete,
}: {
  prizes: GachaPrize[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prize = prizes[currentIndex];

  const advance = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const next = currentIndex + 1;
    if (next >= prizes.length) {
      onComplete();
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, prizes.length, onComplete]);

  useEffect(() => {
    const ms = MULTI_ADVANCE_MS[prize.rarity];
    timerRef.current = setTimeout(advance, ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, prize.rarity, advance]);

  // Can click to advance (except during 5-star)
  const handleClick = () => {
    if (prize.rarity === 5) return;
    advance();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex items-center justify-center cursor-pointer"
      style={{ background: RARITY_BG[prize.rarity] }}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={currentIndex}
    >
      <SplashOrbs rarity={prize.rarity} />

      <motion.div
        className={`relative z-10 flex flex-col items-center gap-3 rounded-2xl px-12 py-8 border-2 ${RARITY_BORDER_CLASS[prize.rarity]}`}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          animationName: prize.rarity === 5 ? 'gacha-pulse-gold' : prize.rarity === 4 ? 'gacha-pulse-purple' : '',
          animationDuration: '2s',
          animationIterationCount: 'infinite',
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {prize.emoji && (
          <motion.div
            className="text-[3.5rem] leading-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {prize.emoji}
          </motion.div>
        )}
        <div
          className="text-white text-xl font-bold text-center"
          style={{ fontFamily: 'Noto Serif SC, serif', textShadow: `0 0 16px ${RARITY_COLORS[prize.rarity]}` }}
        >
          {prize.name}
        </div>
        {prize.description && (
          <p className="text-white/50 text-[11px] text-center max-w-[200px]">{prize.description}</p>
        )}
        <div className="flex gap-0.5">
          {Array.from({ length: prize.rarity }).map((_, i) => (
            <span key={i} style={{ color: RARITY_COLORS[prize.rarity], fontSize: '14px' }}>★</span>
          ))}
        </div>
        {prize.isUp && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#0a0a1a' }}
          >
            UP
          </span>
        )}
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
        {prizes.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{ background: i <= currentIndex ? RARITY_COLORS[prizes[i].rarity] : 'rgba(255,255,255,0.15)' }}
          />
        ))}
      </div>

      {/* Skip button (not during 5-star) */}
      {prize.rarity !== 5 && (
        <motion.button
          className="absolute top-6 right-6 text-white/30 text-xs hover:text-white/50 transition-colors z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
        >
          跳过 &gt;&gt;
        </motion.button>
      )}
    </motion.div>
  );
}

/* ---------- Multi Pull Result Grid ---------- */
function MultiResultGrid({ prizes, onClose }: { prizes: GachaPrize[]; onClose: () => void }) {
  const sorted = sortPrizes(prizes);

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-8"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="grid grid-cols-5 gap-3 max-w-3xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
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
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 border-2 ${RARITY_BORDER_CLASS[prize.rarity]} ${is5Star ? 'col-span-2 py-5' : ''}`}
              style={{
                background: `${RARITY_COLORS[prize.rarity]}10`,
                backdropFilter: 'blur(10px)',
                animationName: glowStyle,
                animationDuration: '2s',
                animationIterationCount: 'infinite',
              }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            >
              {prize.emoji && (
                <span className={is5Star ? 'text-3xl' : 'text-xl'}>{prize.emoji}</span>
              )}
              <div
                className="text-xs font-bold tracking-wider"
                style={{ color: RARITY_COLORS[prize.rarity] }}
              >
                {'★'.repeat(prize.rarity)}
              </div>
              <div
                className={`text-white text-center font-medium leading-tight ${is5Star ? 'text-base' : 'text-[11px]'}`}
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

      <motion.p
        className="text-white/30 text-xs mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        已全部存入背包
      </motion.p>

      <motion.button
        className="mt-4 px-8 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 + prizes.length * 0.06 }}
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

  const stopDroneRef = useRef<(() => void) | null>(null);

  // Reset phase when show changes
  useEffect(() => {
    if (show && prizes.length > 0) {
      setPhase('loading');
      setVideoReady(false);
      setVideoError(false);
      playWishStart();
    }
    return () => {
      stopDroneRef.current?.();
      stopDroneRef.current = null;
    };
  }, [show, prizes]);

  // Start video when ready
  useEffect(() => {
    if (phase === 'loading' && videoReady && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setPhase(mode === 'multi' ? 'multi-reveal' : 'result');
      });
      setPhase('video');
      // Start ambient drone during video
      stopDroneRef.current?.();
      stopDroneRef.current = playAmbientDrone();
    }
  }, [phase, videoReady, mode]);

  // Play reveal sound when entering result/multi-reveal phase
  useEffect(() => {
    if (phase === 'result' || phase === 'multi-reveal') {
      stopDroneRef.current?.();
      stopDroneRef.current = null;
      if (highestRarity === 5) play5StarReveal();
      else if (highestRarity === 4) play4StarReveal();
      else play3StarReveal();
    }
  }, [phase, highestRarity]);

  // If video fails to load, skip directly to result
  useEffect(() => {
    if (videoError && phase === 'loading') {
      setPhase(mode === 'multi' ? 'multi-reveal' : 'result');
    }
  }, [videoError, phase, mode]);

  const handleVideoEnded = useCallback(() => {
    setPhase(mode === 'multi' ? 'multi-reveal' : 'result');
  }, [mode]);

  const handleVideoCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoClick = useCallback(() => {
    if (highestRarity === 5) return;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    stopDroneRef.current?.();
    stopDroneRef.current = null;
    setPhase(mode === 'multi' ? 'multi-reveal' : 'result');
  }, [highestRarity, mode]);

  const handleResultDismiss = useCallback(() => {
    setPhase('done');
    onDismiss?.();
  }, [onDismiss]);

  const handleMultiRevealComplete = useCallback(() => {
    setPhase('multi-grid');
  }, []);

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
              {phase === 'loading' && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
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

          {/* Single pull result */}
          <AnimatePresence>
            {phase === 'result' && mode === 'single' && (
              <SingleResultCard
                prize={prizes[0]}
                onSkip={handleResultDismiss}
              />
            )}
          </AnimatePresence>

          {/* Multi pull: one-by-one reveal */}
          {phase === 'multi-reveal' && mode === 'multi' && (
            <MultiReveal
              prizes={prizes}
              onComplete={handleMultiRevealComplete}
            />
          )}

          {/* Multi pull: summary grid */}
          <AnimatePresence>
            {phase === 'multi-grid' && mode === 'multi' && (
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
