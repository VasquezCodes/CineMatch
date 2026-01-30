import { LandingHero } from "@/features/landing/components";
import { Footer } from "@/components/layout";

export default function AppPage() {
  return (
    <>
      <LandingHero />
      <Footer variant="landing" />
    </>
  );
}
