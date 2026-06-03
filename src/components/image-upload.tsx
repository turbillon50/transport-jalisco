"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { Spinner } from "@/components/ui";

export function ImageUpload({ name = "image", label = "Imagen" }: { name?: string; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error("upload failed");
      const data = (await res.json()) as { url: string };
      setUrl(data.url);
    } catch {
      setError("No se pudo subir la imagen (configura BLOB_READ_WRITE_TOKEN).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-base">
      <span className="font-label-lg text-label-lg text-on-surface-variant block">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary transition-colors text-on-surface-variant"
      >
        {loading ? (
          <Spinner />
        ) : url ? (
          <Image src={url} alt="Subida" width={120} height={80} className="rounded-lg object-cover" />
        ) : (
          <>
            <Icon name="cloud_upload" className="text-3xl text-primary" />
            <span className="text-body-md">Click para subir imagen</span>
          </>
        )}
      </button>
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
}
