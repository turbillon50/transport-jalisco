"use client";

import { useState, useTransition } from "react";
import { sendCampaign } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Button, Input, Textarea, Alert, Card } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { id: "all", label: "Todos", icon: "groups", count: "1,240" },
  { id: "user", label: "Usuarios", icon: "person", count: "1,150" },
  { id: "driver", label: "Choferes", icon: "directions_car", count: "48" },
  { id: "ops", label: "Operaciones", icon: "space_dashboard", count: "12" },
];

export default function NotificationsAdmin() {
  const [segment, setSegment] = useState("all");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("segment", segment);
    startTransition(async () => setResult(await sendCampaign(fd)));
  }

  return (
    <PageTransition>
      <PageHeader title="Campañas push" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-3xl mx-auto space-y-lg">
        <FadeInOnScroll>
          <Card className="p-lg">
            <form onSubmit={onSubmit} className="space-y-lg">
              {result && <Alert type={result.ok ? "success" : "error"} message={result.message} />}

              <div>
                <span className="font-label-lg text-label-lg text-on-surface-variant block mb-2">Segmento</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SEGMENTS.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSegment(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                        segment === s.id ? "border-primary bg-primary-fixed/40 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary",
                      )}
                    >
                      <Icon name={s.icon} fill={segment === s.id} />
                      <span className="text-label-md font-semibold">{s.label}</span>
                      <span className="text-[10px] opacity-70">{s.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input name="title" label="Título" icon="title" placeholder="Ej. Promoción de temporada" required />
              <Textarea name="body" label="Mensaje" rows={4} placeholder="Escribe el cuerpo de la notificación…" required />
              <ImageUpload label="Imagen (opcional)" />

              <Button type="submit" fullWidth size="lg" loading={pending} icon="send">
                Enviar campaña
              </Button>
            </form>
          </Card>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
