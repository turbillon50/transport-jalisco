import { AppShell } from "@/components/shell/app-shell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="user">{children}</AppShell>;
}
