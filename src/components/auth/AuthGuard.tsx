import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/useAuthStore';
import LoginPage from '../../pages/Auth/LoginPage';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Loading state: cinematic splash-style loader
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#000' }}>
        {/* Optional background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/videos/login/loading.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold tracking-[0.2em]"
            style={{
              fontFamily: '"Noto Serif SC", serif',
              color: '#FFD54F',
              textShadow: '0 0 30px rgba(255, 213, 79, 0.3)',
            }}
          >
            LIFE RPG
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: '#FFD54F',
                borderRightColor: 'rgba(255, 213, 79, 0.3)',
              }}
            />
            <p
              className="text-xs"
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                fontFamily: '"Noto Serif SC", serif',
              }}
            >
              正在加载...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Not logged in: show login page with splash experience
  if (!user) {
    return <LoginPage />;
  }

  // Logged in: render app immediately, no splash
  return <>{children}</>;
}
