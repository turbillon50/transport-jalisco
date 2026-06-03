"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function PageHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-16 md:top-0 z-30 h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop bg-surface/95 backdrop-blur border-b border-outline-variant">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Volver"
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <Icon name="arrow_back" className="text-primary" />
          </button>
        )}
        <h1 className="text-headline-md font-bold text-primary">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
