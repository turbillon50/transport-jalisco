"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";
import { Icon } from "@/components/icon";

export function HomePublic() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{ background: "#091018" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
        className="flex flex-col items-center gap-6 text-center max-w-sm">
        <Image src="/icons/logo.png" alt="MT Empresarial" width={200} height={70} className="h-16 w-auto" priority />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-white/60 text-base tracking-wide">
          Logística de Confianza
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <SignInButton mode="modal">
            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-primary text-on-primary font-semibold px-8 py-3 rounded-xl text-base">
              <Icon name="login" className="text-[18px]" />
              Iniciar sesión
            </motion.button>
          </SignInButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
