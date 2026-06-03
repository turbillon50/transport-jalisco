"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProfilePhoto } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Spinner } from "@/components/ui";

export function AvatarUpload({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
      if (!res.ok) throw new Error("upload");
      const data = (await res.json()) as { url: string };
      const saved = await updateProfilePhoto(data.url);
      if (!saved.ok) throw new Error(saved.message);
      setUrl(data.url);
      router.refresh();
    } catch {
      setError("No se pudo subir la foto (revisa BLOB_READ_WRITE_TOKEN en Vercel).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-28 h-28 rounded-full overflow-hidden bg-primary-fixed border-4 border-surface-container-lowest shadow-lg group"
        aria-label="Cambiar foto"
      >
        {url ? (
          <Image src={url} alt={name} fill className="object-cover" sizes="112px" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-primary"><Icon name="person" fill className="text-5xl" /></span>
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : <Icon name="photo_camera" />}
        </span>
      </button>
      <button type="button" onClick={() => inputRef.current?.click()} className="text-label-md font-semibold text-secondary hover:underline">
        {loading ? "Subiendo…" : "Cambiar foto"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {error && <p className="text-label-md text-error text-center max-w-xs">{error}</p>}
    </div>
  );
}
