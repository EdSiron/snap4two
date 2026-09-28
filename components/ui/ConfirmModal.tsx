"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Leave",
  cancelLabel = "Stay",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 text-center shadow-xl"
          >
            <h3 className="text-lg font-bold text-[#6c233d]">{title}</h3>
            <p className="text-sm text-[#a86b80]">{message}</p>

            <div className="mt-2 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-full border border-[#d88fa9] bg-white px-4 py-2.5 font-semibold text-[#d88fa9] transition hover:bg-[#fff0f5]"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-full bg-[#d88fa9] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
