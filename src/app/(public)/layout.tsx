import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AttributionCapture } from '@/components/AttributionCapture'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AttributionCapture />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
