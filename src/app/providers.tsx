"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <PwaRegister />
    </ThemeProvider>
  );
}
