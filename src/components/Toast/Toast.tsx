'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, type = 'info' } = event.detail;
      const id = crypto.randomUUID();
      
      const newToast: ToastMessage = {
        id,
        message,
        type
      };

      setToasts(prev => [...prev, newToast]);

      // 3초 후 자동 제거
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    };

    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400/30';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400/30';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-400/30';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/30';
    }
  };

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 400, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, x: 400, scale: 0.9, rotateY: -90 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className={`
              ${getToastStyles(toast.type)}
              px-5 py-4 rounded-2xl shadow-2xl max-w-sm backdrop-blur-sm
              flex items-center space-x-4 cursor-pointer group
              hover:scale-105 transition-transform duration-200
            `}
            onClick={() => removeToast(toast.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
            >
              {getToastIcon(toast.type)}
            </motion.span>
            <motion.span
              className="flex-1 text-sm font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {toast.message}
            </motion.span>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-white/70 hover:text-white text-xl leading-none p-1 rounded-full hover:bg-white/20 transition-all duration-200"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
