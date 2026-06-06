"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveDriverDocument } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DriverDocRow } from "@/lib/queries";

const STATUS: Record<string, { label: string; cls: string }> = {
  pendiente: { label: "En revisión", cls: "bg-surface-container-high text-on-surface-variant" },
  aprobado: { label: "Verificado", cls: "bg-secondary-container text-on-secondary" },
  rechazado: { label: "Rechazado", cls: "bg-error/10 text-error" },
};

export function DocumentUpload({
  kind,
  label,
  hint,
  current,
}: {
  kind: string;
  label: string;
  hint?: string;
  current: DriverDocRow | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<DriverDocRow | null>(current);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
      if (!res.ok) throw new Error("upload");
      const data = (await res.json()) as { url: string };
      const saved = await saveDriverDocument(kind, data.url, file.name);
      if (!saved.ok) {
        setError(saved.message);
      } else {
        setDoc({ id: "new", kind: kind as DriverDocRow["kind"], url: data.url, fileName: file.name, status: "pendiente", note: null, isPdf: /\.pdf$/i.test(file.name), time: "ahora" });
        router.refresh();
      }
    } catch {
      setError("No se pudo subir. Revisa el archivo (imagen o PDF) e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const st = doc ? STATUS[doc.status] : null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-lg font-semibold text-on-surface">{label}</p>
          {hint && <p className="text-label-md text-on-surface-variant">{hint}</p>}
        </div>
        {st && <span className={cn("text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap", st.cls)}>{st.label}</span>}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full border-2 border-dashed border-outline-variant rounded-xl p-4 flex items-center gap-4 hover:border-primary transition-colors text-on-surface-variant disabled:opacity-60"
      >
        <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
          {loading ? (
            <Spinner />
          ) : doc && !doc.isPdf ? (
            <Image src={doc.url} alt={label} width={64} height={64} className="object-cover w-full h-full" unoptimized />
          ) : doc && doc.isPdf ? (
            <Icon name="picture_as_pdf" className="text-3xl text-error" />
          ) : (
            <Icon name="add_a_photo" className="text-3xl text-primary" />
          )}
        </div>
        <span className="text-body-md text-left flex-1">
          {loading ? "Subiendo…" : doc ? "Toca para reemplazar" : "Toca para subir (foto o PDF)"}
        </span>
        <Icon name="upload" className="text-primary" />
      </button>

      {doc?.status === "rechazado" && doc.note && (
        <p className="text-label-md text-error flex items-start gap-1"><Icon name="report" className="text-[16px]" /> {doc.note}</p>
      )}
      {error && <p className="text-label-md text-error">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}
