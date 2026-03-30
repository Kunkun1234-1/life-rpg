import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/useAuthStore';

type Tab = 'login' | 'register';

export default function LoginPage() {
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
      }}
    >
      {/* Decorative particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              background: i % 2 === 0 ? '#FFD54F' : '#64B5F6',
              opacity: 0.3,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl font-bold mb-2"
              style={{
                fontFamily: '"Noto Serif SC", serif',
                background: 'linear-gradient(135deg, #FFD54F 0%, #FF7043 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Life RPG
            </motion.h1>
            <p className="text-gray-400 text-sm" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              人生冒险
            </p>
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

          {/* Register success message */}
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
                <InputField
                  label="邮箱"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="your@email.com"
                />
                <InputField
                  label="密码"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="输入密码"
                />
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
                <InputField
                  label="邮箱"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="your@email.com"
                />
                <InputField
                  label="密码"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="至少6个字符"
                />
                <InputField
                  label="确认密码"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="再次输入密码"
                />
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
