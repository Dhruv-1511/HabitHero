'use client';

import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2 } from 'lucide-react';

interface UndoToastProps {
  message: string;
  isVisible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  autoDismissDelay?: number;
}

export const UndoToast = memo(function UndoToast({
  message,
  isVisible,
  onUndo,
  onDismiss,
  autoDismissDelay = 5000,
}: UndoToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [isVisible, autoDismissDelay, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md"
        >
          <div className="glass-dark rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
            <p className="text-white text-sm font-medium flex-1">{message}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </motion.button>
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-b-2xl"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: autoDismissDelay / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
