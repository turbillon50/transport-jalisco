"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/actions";
import { PageHeader } from "@/components/shell/page-header";
import { Icon } from "@/components/icon";
import { Button, Input, Textarea, Alert } from "@/components/ui";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export default function RequestPage() {
  const router = useRouter();
  const [pax, setPax] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("passengers", String(pax));
    startTransition(async () => {
      const res = await createService(fd);
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/app"), 1100);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <PageTransition>
      <PageHeader title="Nuevo traslado" back />
      <main className="max-w-xl mx-auto px-margin-mobile pt-8 pb-32">
        <FadeInOnScroll>
          <form onSubmit={onSubmit} className="space-y-lg">
            {done && <Alert tone="success" title="¡Listo!">Traslado programado correctamente. Redirigiendo…</Alert>}
            {error && <Alert tone="error" title="No se pudo programar">{error}</Alert>}

            <Input name="origin" label="Origen" icon="location_on" placeholder="Selecciona origen" required />
            <Input name="destination" label="Destino" icon="my_location" placeholder="Selecciona destino" required />

            <div className="grid grid-cols-2 gap-gutter">
              <Input name="date" label="Fecha" icon="calendar_today" type="date" />
              <Input name="time" label="Hora" icon="schedule" type="time" />
            </div>

            <div className="space-y-base">
              <span className="font-label-lg text-label-lg text-on-surface-variant block">Pasajeros</span>
              <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-2 max-w-[160px]">
                <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors text-primary">
                  <Icon name="remove" />
                </button>
                <span className="text-headline-sm font-semibold px-4">{pax}</span>
                <button type="button" onClick={() => setPax((p) => Math.min(18, p + 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors text-primary">
                  <Icon name="add" />
                </button>
              </div>
            </div>

            <Textarea name="notes" label="Comentarios (opcional)" rows={3} placeholder="Escribe algún comentario adicional" />

            <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low p-4">
              <p className="text-label-md text-primary">Nuestro compromiso es su seguridad y puntualidad en cada trayecto.</p>
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-surface p-margin-mobile border-t border-outline-variant z-40">
              <div className="max-w-xl mx-auto">
                <Button type="submit" fullWidth size="lg" loading={pending} icon="send">
                  Programar traslado
                </Button>
              </div>
            </div>
          </form>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
