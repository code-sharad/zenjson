'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <Check size={18} />;
      case 'error': return <X size={18} />;
      case 'warning': return <AlertCircle size={18} />;
      case 'info': return <Info size={18} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': 
        return 'bg-success/20 border-success/50 text-success';
      case 'error': 
        return 'bg-error/20 border-error/50 text-error';
      case 'warning': 
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'info': 
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl ${getStyles()}`}>
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

