"use client";

import { motion, AnimatePresence } from "framer-motion";

export function CountdownOverlay({ count }: { count: number | null }) {
  if (count === null) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-black/10">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-5xl font-bold text-white drop-shadow-lg sm:text-7xl"
        >
          {count === 0 ? "📸" : count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
