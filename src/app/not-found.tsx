import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 bg-background text-center">
      <Icon name="explore_off" className="text-6xl text-primary" />
      <h1 className="text-headline-lg font-bold text-on-surface">Página no encontrada</h1>
      <p className="text-body-lg text-on-surface-variant max-w-sm">La ruta que buscas no existe o fue movida.</p>
      <Link href="/" className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-lg font-semibold">
        <Icon name="home" /> Volver al inicio
      </Link>
    </div>
  );
}
