import Link from 'next/link'
import { Phone, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Priority Abatement & Remediation for asbestos, mold, lead, and demolition services in Buffalo, NY.',
}

export default function ContactPage() {
  return (
    <>
      <div className="bg-black py-20">
        <div className="container">
          <p className="section-label mb-4">Get In Touch</p>
          <h1 className="text-5xl font-black text-white">Contact Us</h1>
          <p className="mt-4 max-w-xl text-base text-white/60">
            Ready to discuss your project? Reach out and we&apos;ll get back to you promptly.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Contact info */}
            <div>
              <h2 className="mb-8 text-2xl font-bold text-black">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand">
                    <Phone size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Phone</p>
                    <a href="tel:7163132844" className="text-xl font-bold text-black hover:text-brand transition-colors">
                      (716) 313-2844
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand">
                    <MapPin size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Service Area</p>
                    <p className="text-lg font-semibold text-black">Buffalo and Western New York Area</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand">
                    <Clock size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Availability</p>
                    <p className="text-lg font-semibold text-black">Emergency response available</p>
                    <p className="text-sm text-muted">We respond quickly to all inquiries</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote form CTA */}
            <div className="rounded-3xl bg-black p-10 text-white">
              <h2 className="mb-4 text-2xl font-bold">Request a Free Quote</h2>
              <p className="mb-8 text-white/60">
                Use our quick quote form to tell us about your project — we&apos;ll follow up within 24 hours.
              </p>
              <Link href="/#quote" className="btn-primary w-full justify-center">
                Start Your Quote
              </Link>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm text-white/40">or call us directly</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <a href="tel:7163132844" className="mt-6 btn-outline-white w-full justify-center">
                (716) 313-2844
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
