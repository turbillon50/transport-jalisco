"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateProfilePhoto } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Spinner } from "@/components/ui";

export function AvatarUpload({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // La foto se guarda en Clerk (sin necesidad de Vercel Blob).
        await user.setProfileImage({ file });
        await user.reload();
        const newUrl = user.imageUrl;
        if (newUrl) {
          setUrl(newUrl);
          await updateProfilePhoto(newUrl); // sincroniza a la DB
        }
      } else {
        // Fallback: Vercel Blob (requiere BLOB_READ_WRITE_TOKEN).
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
        if (!res.ok) throw new Error("upload");
        const data = (await res.json()) as { url: string };
        await updateProfilePhoto(data.url);
        setUrl(data.url);
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      setError("No se pudo actualizar la foto. Intenta con otra imagen.");
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
          <Image src={url} alt={name} fill className="object-cover" sizes="112px" unoptimized />
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
