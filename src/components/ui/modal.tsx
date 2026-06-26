"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, children, className, title, size }: {
  open: boolean; onClose?: () => void; children: React.ReactNode;
  className?: string; title?: string; size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const maxW = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" }[size ?? "md"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
            className={cn("fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6", maxW, className)}>
            {(title || onClose) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h3 className="text-headline-sm font-semibold text-on-surface">{title}</h3>}
                {onClose && (
                  <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                    <span className="material-symbols-rounded text-[18px]">close</span>
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
