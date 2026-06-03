"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl",
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-lg border-b border-outline-variant">
                <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="p-2 rounded-full hover:bg-surface-container transition-colors"
                >
                  <Icon name="close" className="text-on-surface-variant" />
                </button>
              </div>
            )}
            <div className="p-lg">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Right-hand drawer used by ops drill-downs (driver detail, etc.). */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "400px",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{ width }}
            className="absolute right-0 top-0 h-full max-w-full bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col"
          >
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface">
              {title && <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="p-2 rounded-full hover:bg-surface-variant transition-colors"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="p-lg overflow-y-auto flex-1">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
