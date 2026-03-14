import Link from 'next/link'
import { CoreValuesSection } from '@/components/home/CoreValuesSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Priority Abatement & Remediation — Buffalo NY\'s trusted asbestos, mold, lead, and demolition experts.',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-black py-20">
        <div className="container max-w-3xl">
          <p className="section-label mb-4">Who We Are</p>
          <h1 className="text-5xl font-black text-white">About Priority Abatement & Remediation</h1>
          <p className="mt-5 text-lg text-white/60">
            Buffalo and Western New York&apos;s trusted environmental remediation company.
          </p>
        </div>
      </div>

      {/* About content */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <p>
              Priority Abatement & Remediation (PAR) is a licensed, bonded, and insured environmental services company serving Buffalo and Western New York. We specialize in asbestos abatement, mold removal, lead remediation, demolition, and disaster cleanup for residential and commercial clients.
            </p>
            <p>
              We employ and train high-quality and competent personnel who provide our clients with the highest quality services, in a reasonable amount of time and at a reasonable price. Our certified technicians handle every project with the professionalism and care your home or business deserves.
            </p>
            <h2>Why Choose PAR?</h2>
            <ul>
              <li>Licensed, bonded, and fully insured</li>
              <li>Certified technicians — lead-safe certified</li>
              <li>Residential and commercial services</li>
              <li>Serving Buffalo and all of Western New York</li>
              <li>Emergency response available</li>
              <li>Transparent pricing and free estimates</li>
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/#quote" className="btn-primary">
              Get a Free Quote
            </Link>
            <a href="tel:7163132844" className="btn-secondary">
              Call (716) 313-2844
            </a>
          </div>
        </div>
      </section>

      <CoreValuesSection />
    </>
  )
}
