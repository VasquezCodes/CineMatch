import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Footer variant="app" />
    </>
  );
}
