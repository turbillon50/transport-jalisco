import type { Metadata } from "next";
import { PageTransition } from "@/components/motion";
export const metadata: Metadata = { title: "Politica de Cancelacion" };
export default function Page() {
  return (
    <PageTransition>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-headline-lg font-bold text-on-surface mb-8">Politica de Cancelacion</h1>
        <div className="space-y-6 text-on-surface-variant text-body-md">
          <p>MT Empresarial - Logistica de Confianza. Jalisco, Mexico.</p>
          <p>Este documento aplica al uso de la plataforma MT Empresarial.</p>
          <p>Contacto: soporte@mtempresarial.life</p>
        </div>
      </main>
    </PageTransition>
  );
}
