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
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              ${getToastStyles(toast.type)}
              px-4 py-3 rounded-lg shadow-lg max-w-sm
              flex items-center space-x-3 cursor-pointer
            `}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-lg">{getToastIcon(toast.type)}</span>
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-white/80 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
