"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { NAV, ROLE_LABEL, type Role } from "@/lib/roles";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const items = NAV[role];
  const isActive = (href: string) =>
    href === `/${role === "user" ? "app" : role}` ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-[100dvh] bg-background text-on-background md:pl-64">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface-container-lowest border-r border-outline-variant z-40">
        <div className="px-5 pt-6 pb-3">
          <Image src="/icons/logo.png" alt="MT Empresarial" width={188} height={64} className="w-full max-w-[180px] h-auto" priority />
          <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{ROLE_LABEL[role]}</p>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-colors",
                  active ? "text-primary" : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`nav-pill-${role}`}
                    className="absolute inset-0 rounded-xl bg-primary-fixed"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-3.5">
                  <span className="relative">
                    <Icon name={it.icon} fill={active} />
                    {it.badge && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-error" />}
                  </span>
                  <span className="text-label-lg font-label-lg">{it.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between">
          <UserButton afterSignOutUrl="/" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/role" aria-label="Cambiar perfil" className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
              <Icon name="switch_account" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 h-16 flex items-center justify-between px-margin-mobile bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Image src="/icons/logo.png" alt="MT Empresarial" width={120} height={40} className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="pb-24 md:pb-0 min-h-[calc(100dvh-4rem)] md:min-h-[100dvh]">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_24px_rgba(0,40,99,0.06)]" style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        <div className="flex items-center justify-around px-1 py-2">
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-0 flex-1 transition-colors",
                  active ? "text-primary" : "text-on-surface-variant",
                )}
              >
                <span className={cn("relative flex items-center justify-center h-7 px-3.5 rounded-full transition-colors", active && "bg-primary-fixed")}>
                  <Icon name={it.icon} fill={active} />
                  {it.badge && <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-error border-2 border-surface-container-lowest" />}
                </span>
                <span className="text-[11px] font-semibold">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
