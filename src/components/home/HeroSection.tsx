'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
}

interface Props {
  categories: Category[]
}

export function HeroSection({ categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid 5-digit zip code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('zipcodes')
        .select('city, state')
        .eq('zip', zipCode)
        .single()

      if (data) {
        setLocation(data)
        const el = document.getElementById('quote')
        el?.scrollIntoView({ behavior: 'smooth' })
      } else {
        setError('Zip code not found in our service area.')
      }
    } catch {
      setError('Unable to verify zip code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-[580px] bg-black">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />

      <div className="container relative z-10 py-28 lg:py-36">
        <div className="max-w-xl">
          <p className="section-label mb-4 text-brand">
            Professional Solutions for Your Home and Business
          </p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-tight text-white lg:text-6xl">
            Abatement &<br />Remediation
          </h1>
          <p className="mb-10 text-lg font-medium text-white/70">
            Do You Have An Abatement or Remediation Project We Can Help With?
          </p>

          {/* Search bar */}
          <div className="rounded-2xl bg-white p-2 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Category select */}
              <div className="relative flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-transparent py-3 pl-4 pr-10 text-sm font-medium text-black focus:outline-none"
                >
                  <option value="">Choose Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>

              <div className="h-px bg-border sm:h-10 sm:w-px" />

              {/* Zip code */}
              <div className="flex items-center gap-2 px-3">
                <Search size={16} className="text-muted-light flex-shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Zip Code"
                  className="w-28 bg-transparent py-3 text-sm font-medium text-black placeholder:text-muted-light focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className={cn(
                  'btn-primary py-3 text-sm whitespace-nowrap',
                  loading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {loading ? 'Checking...' : 'Get Started'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
          )}
          {location && (
            <p className="mt-3 text-sm font-medium text-brand">
              Serving {location.city}, {location.state} — scroll down to request a quote!
            </p>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={28} className="text-white/40" />
      </div>
    </section>
  )
}
