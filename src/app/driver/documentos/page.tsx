import type { Metadata } from "next";
import { getMyDriverDocuments, type DriverDocRow, type DocKind } from "@/lib/queries";
import { DocumentUpload } from "@/components/document-upload";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Mis documentos" };
export const dynamic = "force-dynamic";

const SLOTS: { kind: DocKind; label: string; hint: string }[] = [
  { kind: "foto_chofer", label: "Foto del chofer", hint: "Rostro visible, buena luz." },
  { kind: "foto_unidad", label: "Foto de la unidad", hint: "Vehículo completo con placas visibles." },
  { kind: "licencia", label: "Licencia de conducir", hint: "Vigente. Foto o PDF." },
  { kind: "tarjeta_circulacion", label: "Tarjeta de circulación", hint: "Foto o PDF legible." },
];

export default async function DriverDocuments() {
  const docs = await getMyDriverDocuments();
  const byKind = new Map<string, DriverDocRow>();
  for (const d of docs) byKind.set(d.kind, d);

  const approved = docs.filter((d) => d.status === "aprobado").length;
  const total = SLOTS.length;

  return (
    <PageTransition className="flex flex-col min-h-[100dvh]">
      <PageHeader title="Mis documentos" back />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-2xl mx-auto w-full space-y-lg">
        <FadeInOnScroll>
          <div className="bg-primary-container text-white rounded-xl p-lg flex items-center gap-4">
            <Icon name="verified_user" fill className="text-4xl opacity-90" />
            <div>
              <h2 className="text-headline-sm font-semibold">Verificación · {approved}/{total}</h2>
              <p className="text-body-md opacity-85">Sube tus documentos para que operaciones te verifique y puedas recibir traslados.</p>
            </div>
          </div>
        </FadeInOnScroll>

        <div className="space-y-3">
          {SLOTS.map((s, i) => (
            <FadeInOnScroll key={s.kind} delay={0.04 * i}>
              <DocumentUpload kind={s.kind} label={s.label} hint={s.hint} current={byKind.get(s.kind) ?? null} />
            </FadeInOnScroll>
          ))}
        </div>
      </main>
    </PageTransition>
  );
}
