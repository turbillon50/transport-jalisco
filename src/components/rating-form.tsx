"use client";

import { useState, useTransition } from "react";
import { rateService } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Button, Textarea, Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export function RatingForm({ serviceId }: { serviceId: string }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  if (done) return <Alert type="success" message={done} />;

  return (
    <div className="space-y-3">
      <p className="text-label-lg font-semibold text-on-surface">Califica tu servicio</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              aria-label={`${n} estrellas`}
              className="p-1"
            >
              <Icon name="star" fill={(hover || stars) >= n} className={cn("text-3xl", (hover || stars) >= n ? "text-tertiary-fixed-dim" : "text-outline-variant")} />
            </button>
          );
        })}
      </div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Comentario (opcional)" />
      <Button
        loading={pending}
        disabled={stars === 0}
        icon="send"
        onClick={() =>
          start(async () => {
            const res = await rateService(serviceId, stars, comment);
            if (res.ok) setDone(res.message);
          })
        }
      >
        Enviar calificación
      </Button>
    </div>
  );
}
