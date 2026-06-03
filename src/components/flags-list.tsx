"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toggleFeatureFlag } from "@/app/actions";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

interface Flag { key: string; value: boolean; description: string }

export function FlagsList({ flags }: { flags: Flag[] }) {
  const [state, setState] = useState(flags);
  const [, startTransition] = useTransition();

  function toggle(key: string) {
    setState((s) => s.map((f) => (f.key === key ? { ...f, value: !f.value } : f)));
    const next = !state.find((f) => f.key === key)?.value;
    startTransition(() => { void toggleFeatureFlag(key, next); });
  }

  return (
    <StaggerContainer className="space-y-sm">
      {state.map((f) => (
        <StaggerItem key={f.key}>
          <div className="flex items-center justify-between p-lg bg-surface-container-lowest border border-outline-variant rounded-xl">
            <div className="pr-4">
              <p className="text-label-lg font-semibold text-on-surface font-mono">{f.key}</p>
              <p className="text-body-md text-on-surface-variant">{f.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={f.value}
              aria-label={f.key}
              onClick={() => toggle(f.key)}
              className={cn("relative w-12 h-7 rounded-full transition-colors shrink-0", f.value ? "bg-primary" : "bg-surface-container-highest")}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow", f.value ? "right-1" : "left-1")}
              />
            </button>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
