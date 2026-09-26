'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function CountdownOverlay({ count }: { count: number | null }) {
  if (count === null) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white text-7xl font-bold drop-shadow-lg"
        >
          {count === 0 ? '📸' : count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}