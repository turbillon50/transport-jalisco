"use client";

import { useEffect } from "react";
import { Button, Alert } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full space-y-4 text-center">
        <Alert type="error" title="Algo salió mal">
          Ocurrió un error inesperado. Puedes reintentar o volver al inicio.
        </Alert>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} icon="refresh">Reintentar</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>Ir al inicio</Button>
        </div>
      </div>
    </div>
  );
}
