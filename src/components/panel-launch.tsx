"use client";
import { useEffect } from "react";

/** Si la app está instalada como panel (flag mt_panel) y se abre en modo app,
 *  salta directo a /admin sin pasar por la home. Mata el parpadeo de "inicio". */
export function PanelLaunch() {
  useEffect(() => {
    try {
      const standalone =
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        (window.navigator as any).standalone === true;
      const isPanel = localStorage.getItem("mt_panel") === "1";
      if (standalone && isPanel && !location.pathname.startsWith("/admin")) {
        location.replace("/admin");
      }
    } catch {}
  }, []);
  return null;
}
