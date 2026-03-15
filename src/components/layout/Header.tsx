'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact Us', href: '/contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand py-2">
        <div className="container flex items-center justify-between">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-black hover:opacity-70 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21" fill="currentColor">
              <path d="M20.751 10.564C20.751 4.798 16.106.124 10.376.124 4.644.125 0 4.798 0 10.565c0 5.21 3.793 9.528 8.752 10.312v-7.295H6.12V10.565h2.636V8.263c0-2.615 1.55-4.06 3.919-4.06 1.136 0 2.323.203 2.323.203v2.568h-1.308c-1.288 0-1.69.805-1.69 1.631v1.958h2.876l-.459 3.017H11.997v7.295c4.96-.782 8.754-5.102 8.754-10.311Z"/>
            </svg>
          </a>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-black">
            <MapPin size={14} />
            <span>Buffalo and Western New York Area</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-black transition-shadow duration-200',
          scrolled && 'shadow-2xl'
        )}
      >
        <div className="container">
          <nav className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/brand/admin-logo.png"
                alt="Priority Abatement & Remediation"
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/80 transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 lg:flex">
              <a
                href="tel:7163132844"
                className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand transition-colors"
              >
                <Phone size={15} />
                (716) 313-2844
              </a>
              <Link href="/#quote" className="btn-primary py-2 px-5 text-sm">
                Get A Quote
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="flex items-center justify-center rounded-lg p-2 text-white lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-black lg:hidden">
            <div className="container py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-sm font-medium text-white/80 hover:text-brand transition-colors border-b border-white/5 last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="tel:7163132844"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-semibold text-white"
                >
                  <Phone size={15} />
                  (716) 313-2844
                </a>
                <Link
                  href="/#quote"
                  className="btn-primary justify-center text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Get A Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
