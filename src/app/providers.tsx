"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { PwaRegister } from "@/components/pwa-register";
import { PanelLaunch } from "@/components/panel-launch";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <PanelLaunch />
      {children}
      <PwaRegister />
    </ThemeProvider>
  );
}
