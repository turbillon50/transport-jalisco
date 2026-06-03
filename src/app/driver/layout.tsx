import { AppShell } from "@/components/shell/app-shell";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="driver">{children}</AppShell>;
}
