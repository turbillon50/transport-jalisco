"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#091018" }}>
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            className="flex flex-col items-center gap-4">
            <Image src="/icons/logo.png" alt="MT Empresarial" width={180} height={60} className="h-16 w-auto" priority />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm text-white/50 tracking-widest uppercase">
              Logística de Confianza
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-0.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
