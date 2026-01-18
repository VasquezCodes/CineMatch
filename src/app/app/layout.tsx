import { AppShellWrapper } from "@/components/layout/app-shell-wrapper";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShellWrapper>{children}</AppShellWrapper>;
}
