"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/icon";
interface Driver { id: string; name: string; }
export function AssignDriverClient({ serviceId, currentDriverId, drivers }: {
  serviceId: string; currentDriverId?: string | null; drivers: Driver[];
}) {
  const [selected, setSelected] = useState(currentDriverId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  async function assign() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/assign-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, driverId: selected }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      <select value={selected} onChange={(e) => setSelected(e.target.value)}
        className="text-label-sm bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">Sin chofer</option>
        {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
      </select>
      <motion.button whileTap={{ scale: 0.95 }} onClick={assign} disabled={saving || !selected}
        className="h-8 w-8 rounded-lg bg-primary text-on-primary flex items-center justify-center disabled:opacity-50">
        {saving ? (<span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        ) : saved ? (<Icon name="check" className="text-[16px]" />
        ) : (<Icon name="save" className="text-[16px]" />)}
      </motion.button>
    </div>
  );
}
