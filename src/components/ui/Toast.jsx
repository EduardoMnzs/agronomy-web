import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

const Toast = ({ show, onClose, title, message, type = 'success', duration = 3000 }) => {
  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const iconMap = {
    success: <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />,
    error: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
    info: <Info size={20} className="text-blue-600 dark:text-blue-400" />
  };

  const borderMap = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20'
  };

  const accentMap = {
    success: 'bg-green-600/20',
    error: 'bg-red-600/20',
    info: 'bg-blue-600/20'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 350, damping: 25 }
          }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed z-[999] w-full max-w-sm px-4 
                     top-6 left-1/2 -translate-x-1/2 
                     sm:top-auto sm:bottom-8 sm:right-8 sm:left-auto sm:translate-x-0"
        >
          <div className={`relative bg-white dark:bg-[#323639] border ${borderMap[type]} shadow-[0_10px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.4)] rounded-2xl p-4 flex items-center gap-3 overflow-hidden`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${accentMap[type]}`}>
              {iconMap[type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#131E29] dark:text-white mb-0.5">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
            >
              <X size={16} />
            </button>

            {duration && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
