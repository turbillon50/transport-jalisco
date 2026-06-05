import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { PageTransition } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <PageTransition className="min-h-[100dvh] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative gradient-mesh text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 road-pattern animate-subtle-drift pointer-events-none" />
        <Image src="/icons/logo.png" alt="MT Empresarial" width={200} height={64} className="relative w-44 h-auto bg-white rounded-2xl p-4 shadow-2xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold mb-3">Tu destino, nuestra ruta</h2>
          <p className="text-white/80 max-w-sm">Crea tu cuenta y empieza a gestionar traslados empresariales en minutos.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 bg-background">
        <SignUp
          appearance={{
            variables: { colorPrimary: "#002863" },
            elements: { card: "shadow-lg border border-outline-variant", formButtonPrimary: "bg-primary hover:brightness-110" },
          }}
        />
      </div>
    </PageTransition>
  );
}
