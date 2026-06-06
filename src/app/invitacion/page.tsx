import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageTransition } from "@/components/motion";

export const dynamic = "force-dynamic";

export default function InvitacionErrorPage() {
  return (
    <PageTransition className="min-h-[100dvh] grid place-items-center bg-background px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container grid place-items-center mx-auto mb-4">
          <Icon name="link_off" className="text-3xl text-outline" />
        </div>
        <h1 className="text-headline-sm font-bold text-primary">Invitación no válida o expirada</h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          El enlace que abriste no es válido. Pide a quien te invitó que genere uno nuevo.
        </p>
        <div className="mt-6 flex flex-col gap-3 items-center">
          <Link href="/sign-in" className="text-secondary font-semibold hover:underline">Iniciar sesión</Link>
          <Link href="/" className="text-on-surface-variant hover:underline">Ir al inicio</Link>
        </div>
      </div>
    </PageTransition>
  );
}
