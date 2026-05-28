import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

const UndoToast = ({ message, onUndo, onDismiss, duration = 8000 }) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);
  // useRef prevents the effect from restarting each time onDismiss changes reference
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setVisible(false);
        setTimeout(() => onDismissRef.current(), 300);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUndo = () => {
    setVisible(false);
    setTimeout(() => {
      onUndo();
      onDismiss();
    }, 200);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2"
          style={{ minWidth: 340 }}
        >
          <div
            className="glass rounded-xl overflow-hidden shadow-2xl border border-zinc-200/80"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <div className="h-1 bg-zinc-100 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.03 }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">{message}</p>
              </div>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Deshacer
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UndoToast;
