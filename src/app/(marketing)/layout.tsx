import { LandingFooter } from '@/features/landing/components'

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <LandingFooter />
    </>
  )
}


