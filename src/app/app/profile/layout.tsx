import { Container } from '@/components/layout';
import { ProfileSidebar } from '@/features/profile/components/ProfileSidebar';
import { ProfileMobileNav } from '@/features/profile/components/ProfileMobileNav';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="py-8 md:py-10 lg:py-12">
      <div className="flex gap-8">
        {/* Sidebar - IZQUIERDA (solo desktop) */}
        <ProfileSidebar className="hidden lg:block" />

        {/* Main content - DERECHA */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile Nav - FAB con Sheet overlay */}
      <ProfileMobileNav className="lg:hidden" />
    </Container>
  );
}
