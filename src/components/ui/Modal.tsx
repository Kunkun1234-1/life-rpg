import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`pointer-events-auto w-full max-w-lg rounded-2xl border border-white/10 p-6 ${className}`}
              style={{
                background: 'linear-gradient(135deg, rgba(26,10,46,0.95) 0%, rgba(10,10,26,0.98) 100%)',
                backdropFilter: 'blur(20px)',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/80 transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                >
                  ×
                </button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
