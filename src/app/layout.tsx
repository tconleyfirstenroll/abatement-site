import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { TrackingScripts } from '@/components/TrackingScripts'
import { createClient } from '@/lib/supabase/server'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Priority Abatement & Remediation | Buffalo, NY',
    template: '%s | Priority Abatement & Remediation',
  },
  description:
    'Professional asbestos abatement, mold removal, lead remediation, and demolition services in Buffalo and Western New York. Licensed, bonded, and insured.',
  keywords: [
    'asbestos abatement Buffalo NY',
    'mold removal Buffalo',
    'lead remediation',
    'demolition Buffalo NY',
    'abatement contractor',
    'Priority Abatement Remediation',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Priority Abatement & Remediation',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let settings: Record<string, string> = {}
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('key, value')
    if (data) {
      settings = Object.fromEntries(data.map((r) => [r.key, r.value]))
    }
  } catch {}

  return (
    <html lang="en" className={poppins.className}>
      <head />
      <body className="antialiased">
        <TrackingScripts settings={settings} />
        {children}
      </body>
    </html>
  )
}
