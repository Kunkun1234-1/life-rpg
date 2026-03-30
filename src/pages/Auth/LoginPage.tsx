import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/useAuthStore';

type Tab = 'login' | 'register';
type Phase = 'splash' | 'login';

// Generate star data once outside component to avoid re-renders
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: `${Math.random() * 4}s`,
    duration: `${3 + Math.random() * 3}s`,
  }));
}

// Time-of-day logic for door video
function getDoorVideo(): string {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18)
    ? '/videos/login/morningdoor.webm'
    : '/videos/login/nightdoor.webm';
}

/* ========== Splash: Logo overlaid on door video ========== */
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const stars = useMemo(() => generateStars(25), []);
  const doorVideo = useMemo(() => getDoorVideo(), []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showLogo, setShowLogo] = useState(true);

  // After 1.5s: fade out logo and start playing door video
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      videoRef.current?.play().catch(() => onComplete());
    }, 1500);
    // Fallback: if everything takes too long, skip after 8s
    const maxTimer = setTimeout(onComplete, 8000);
    return () => { clearTimeout(logoTimer); clearTimeout(maxTimer); };
  }, [onComplete, doorVideo]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: '#000' }}
      onClick={onComplete}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Door video - plays behind logo, becomes visible when logo fades */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={onComplete}
        onError={onComplete}
      >
        <source src={doorVideo} type="video/webm" />
      </video>

      {/* Particle stars - visible during logo phase */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {stars.map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  background: '#FFD54F',
                  animation: `login-float-star ${star.duration} ${star.delay} infinite ease-in-out`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo - fades out after 1.5s to reveal door video */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="text-center z-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-7xl font-bold tracking-[0.3em]"
              style={{
                fontFamily: '"Noto Serif SC", serif',
                color: '#FFD54F',
                textShadow: '0 0 40px rgba(255, 213, 79, 0.3)',
              }}
            >
              LIFE RPG
        </h1>
        <p
          className="mt-4 text-base tracking-[0.5em]"
          style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: '"Noto Serif SC", serif' }}
        >
          人生冒险 · 数值系统
        </p>
        {/* Gold decorative line */}
        <div className="flex items-center justify-center mt-3">
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,213,79,0.5), transparent)' }} />
          <div className="mx-2 w-1.5 h-1.5 rotate-45" style={{ background: '#FFD54F', opacity: 0.4 }} />
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,213,79,0.5), transparent)' }} />
        </div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Click to skip hint */}
      <motion.p
        className="absolute bottom-24 text-sm z-30"
        style={{
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: '"Noto Serif SC", serif',
          animation: 'login-pulse 2s infinite ease-in-out',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        点击任意处跳过
      </motion.p>
    </motion.div>
  );
}

/* ========== Login Form ========== */
function LoginFormView() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { signIn, signUp, signInWithGithub, error, loading, clearError } = useAuthStore();

  const switchTab = (t: Tab) => {
    setTab(t);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    setRegisterSuccess(false);
    clearError();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('请填写邮箱和密码');
      return;
    }
    await signIn(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('请填写邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码至少需要6个字符');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }
    const success = await signUp(email, password);
    if (success) {
      setRegisterSuccess(true);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/videos/login/bg.webm" type="video/webm" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.55)', zIndex: 1 }} />

      {/* Form card */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-2">
            <h1
              className="text-3xl font-bold tracking-[0.15em]"
              style={{
                fontFamily: '"Noto Serif SC", serif',
                color: '#FFD54F',
                textShadow: '0 0 20px rgba(255, 213, 79, 0.2)',
              }}
            >
              LIFE RPG
            </h1>
          </div>
          {/* Decorative line */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,213,79,0.4), transparent)' }} />
            <div className="mx-2 w-1.5 h-1.5 rotate-45" style={{ background: '#FFD54F', opacity: 0.5 }} />
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,213,79,0.4), transparent)' }} />
          </div>

          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2.5 text-sm font-medium transition-all duration-200 relative"
                style={{
                  color: tab === t ? '#FFD54F' : 'rgba(255,255,255,0.4)',
                  background: tab === t ? 'rgba(255, 213, 79, 0.08)' : 'transparent',
                }}
              >
                {t === 'login' ? '登录' : '注册'}
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: '#FFD54F' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Error display */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  color: '#FF6B6B',
                }}
              >
                {displayError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register success */}
          <AnimatePresence>
            {registerSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(129, 199, 132, 0.1)',
                  border: '1px solid rgba(129, 199, 132, 0.2)',
                  color: '#81C784',
                }}
              >
                注册成功! 请检查邮箱确认链接，然后登录。
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <InputField label="邮箱" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
                <InputField label="密码" type="password" value={password} onChange={setPassword} placeholder="输入密码" />
                <SubmitButton loading={loading} text="登录" />
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <InputField label="邮箱" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
                <InputField label="密码" type="password" value={password} onChange={setPassword} placeholder="至少6个字符" />
                <InputField label="确认密码" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="再次输入密码" />
                <SubmitButton loading={loading} text="注册" />
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="px-3 text-xs text-gray-500">或</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* GitHub login */}
          <button
            onClick={signInWithGithub}
            className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            使用 GitHub 登录
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ========== Input Field ========== */
function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-1"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 213, 79, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255, 213, 79, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

/* ========== Submit Button ========== */
function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #FFD54F 0%, #FF7043 100%)',
        color: '#0a0a1a',
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          处理中...
        </span>
      ) : (
        text
      )}
    </motion.button>
  );
}

/* ========== Main LoginPage ========== */
export default function LoginPage() {
  const [phase, setPhase] = useState<Phase>('splash');

  const handleSplashComplete = useCallback(() => {
    setPhase('login');
  }, []);

  return (
    <div className="fixed inset-0" style={{ background: '#000' }}>
      {/* Login form always rendered behind splash */}
      {phase === 'login' && <LoginFormView />}

      {/* Splash: logo + door video combined */}
      <AnimatePresence>
        {phase === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
    </div>
  );
}
