import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Facebook } from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact Us', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Image
                src="/brand/admin-logo.png"
                alt="Priority Abatement & Remediation"
                width={160}
                height={48}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm leading-7 text-white/60">
              We employ and train high-quality and competent personnel who provide our clients with the highest quality services, in a reasonable amount of time and at a reasonable price.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-5 text-base font-bold text-brand">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-base font-bold text-brand">Contact</h4>
            <div className="space-y-4">
              <a
                href="tel:7163132844"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-brand transition-colors"
              >
                <Phone size={16} className="text-brand flex-shrink-0" />
                (716) 313-2844
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={16} className="text-brand flex-shrink-0 mt-0.5" />
                <span>Buffalo and Western<br />New York Area</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-2 text-base font-bold text-brand">Free Project Cost Info</h4>
            <p className="mb-4 text-xs text-white/50">Sign up to receive free project cost information and tips.</p>
            <form className="space-y-2.5">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <input
                type="text"
                placeholder="Zip Code"
                maxLength={5}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <button
                type="submit"
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container flex items-center justify-between py-5">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Priority Abatement and Remediation. All Rights Reserved.
          </p>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white/40 hover:text-brand transition-colors"
          >
            <Facebook size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
