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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#FFD54F',
              borderRightColor: '#FFD54F',
            }}
          />
          <p
            className="text-sm"
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            正在加载...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
