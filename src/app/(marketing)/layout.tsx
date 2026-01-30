import { Footer } from '@/components/layout'

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Footer variant="landing" />
    </>
  )
}


