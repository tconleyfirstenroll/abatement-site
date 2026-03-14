'use client'

import { useState } from 'react'
import { CheckCircle, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildLeadAttribution } from '@/lib/attribution'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  children?: { id: number; name: string; type?: string | null }[]
}

interface Props {
  categories: Category[]
}

interface FormData {
  category_id: string
  category_name: string
  project_type: string
  category_type: string
  material_contain: number[]
  is_material_tested: string
  work_done: string
  details: string
  street: string
  zip_code: string
  city: string
  state: string
  first_name: string
  last_name: string
  phone: string
  email: string
  start_date: string
  start_time: string
  sms_opt_in: boolean
}

const INITIAL: FormData = {
  category_id: '',
  category_name: '',
  project_type: 'Residential',
  category_type: 'Interior',
  material_contain: [],
  is_material_tested: 'Yes',
  work_done: 'Within 2 weeks',
  details: '',
  street: '',
  zip_code: '',
  city: '',
  state: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  start_date: '',
  start_time: '',
  sms_opt_in: false,
}

const TOTAL_STEPS = 10

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < current ? 'bg-brand' : i === current ? 'bg-brand/40' : 'bg-border'
          )}
        />
      ))}
      <span className="ml-2 text-xs font-semibold text-muted whitespace-nowrap">
        {current + 1} / {total}
      </span>
    </div>
  )
}

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-all duration-200',
        selected
          ? 'border-brand bg-brand text-black'
          : 'border-border bg-white text-black hover:border-brand/50'
      )}
    >
      {label}
    </button>
  )
}

export function LeadFormSection({ categories }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [zipLoading, setZipLoading] = useState(false)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const selectedCategory = categories.find((c) => String(c.id) === data.category_id)
  const subcategories = selectedCategory?.children ?? []
  const hasTypeChildren = subcategories.some((c) => c.type)
  const filteredSubs = hasTypeChildren
    ? subcategories.filter((c) => !c.type || c.type === data.category_type.toLowerCase())
    : subcategories

  // Skip step 2 (interior/exterior) if category has no typed children
  const effectiveStep = (s: number) => {
    if (s >= 2 && !hasTypeChildren) return s + 1
    return s
  }

  async function lookupZip(zip: string) {
    if (zip.length !== 5) return
    setZipLoading(true)
    try {
      const supabase = createClient()
      const { data: zd } = await supabase
        .from('zipcodes')
        .select('city, state')
        .eq('zip', zip)
        .single()
      if (zd) {
        setData((prev) => ({ ...prev, city: zd.city, state: zd.state }))
      }
    } finally {
      setZipLoading(false)
    }
  }

  function validateStep(): boolean {
    const newErrors: typeof errors = {}
    const s = effectiveStep(step)

    if (s === 3 && data.material_contain.length === 0) {
      newErrors.material_contain = 'Please select at least one material.'
    }
    if (s === 7) {
      if (!data.street) newErrors.street = 'Required'
      if (!data.zip_code || data.zip_code.length < 5) newErrors.zip_code = 'Enter valid zip'
      if (!data.city) newErrors.city = 'Required'
      if (!data.state) newErrors.state = 'Required'
    }
    if (s === 8) {
      if (!data.first_name) newErrors.first_name = 'Required'
      if (!data.last_name) newErrors.last_name = 'Required'
      if (!data.phone) newErrors.phone = 'Required'
      if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Valid email required'
    }
    if (s === 9) {
      if (!data.start_date) newErrors.start_date = 'Required'
      if (!data.start_time) newErrors.start_time = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function next() {
    if (!validateStep()) return
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const attribution = buildLeadAttribution()

      await supabase.from('leads').insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        project_type: data.project_type,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        category_name: data.category_name,
        category_type: data.category_type,
        material_contain: data.material_contain,
        is_material_tested: data.is_material_tested,
        work_done: data.work_done,
        details: data.details,
        street: data.street,
        zip_code: data.zip_code,
        city: data.city,
        state: data.state,
        start_date: data.start_date || null,
        start_time: data.start_time,
        sms_opt_in: data.sms_opt_in,
        status: 'new',
        ...attribution,
        raw_data: data,
      })

      // Fire GA4 conversion event if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'lead_submitted', {
          event_category: 'lead',
          event_label: data.category_name || 'general',
          value: 1,
        })
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const s = effectiveStep(step)

  return (
    <section id="quote" className="bg-black py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="section-label mb-3">Free Quote</p>
            <h2 className="section-title text-white">Request A Quote</h2>
            <p className="mt-4 text-base text-white/60">
              Tell us about your project and we'll get back to you quickly.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-2xl">
            {submitted ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-black">
                  Thank You!
                </h3>
                <p className="mb-8 text-base text-muted">
                  We look forward to discussing your project soon!
                </p>
                <a
                  href="tel:7163132844"
                  className="btn-primary flex items-center gap-2"
                >
                  <Phone size={16} />
                  (716) 313-2844
                </a>
              </div>
            ) : (
              <>
                <StepIndicator current={step} total={TOTAL_STEPS} />

                {/* Step 1: Project type */}
                {s === 1 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">What type of project is this?</h3>
                    <div className="flex flex-wrap gap-3">
                      {['Residential', 'Commercial'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={data.project_type === opt}
                          onClick={() => set('project_type', opt)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 0: Category */}
                {s === 0 && (
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-black">What service do you need?</h3>
                    <p className="mb-6 text-sm text-muted">Select the category that best fits your project.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            set('category_id', String(cat.id))
                            set('category_name', cat.name)
                          }}
                          className={cn(
                            'rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all duration-200',
                            data.category_id === String(cat.id)
                              ? 'border-brand bg-brand/10 text-black'
                              : 'border-border bg-white text-black hover:border-brand/50'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Interior/Exterior */}
                {s === 2 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">Interior or Exterior project?</h3>
                    <div className="flex flex-wrap gap-3">
                      {['Interior', 'Exterior'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={data.category_type === opt}
                          onClick={() => set('category_type', opt)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Material selection */}
                {s === 3 && (
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-black">Which materials are involved?</h3>
                    <p className="mb-6 text-sm text-muted">Select all that apply.</p>
                    {errors.material_contain && (
                      <p className="mb-4 text-sm font-medium text-red-500">{errors.material_contain}</p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredSubs.map((sub) => {
                        const selected = data.material_contain.includes(sub.id)
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              set(
                                'material_contain',
                                selected
                                  ? data.material_contain.filter((id) => id !== sub.id)
                                  : [...data.material_contain, sub.id]
                              )
                            }}
                            className={cn(
                              'rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all duration-200',
                              selected
                                ? 'border-brand bg-brand/10 text-black'
                                : 'border-border bg-white text-black hover:border-brand/50'
                            )}
                          >
                            {sub.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4: Material testing */}
                {s === 4 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">Has the material been tested?</h3>
                    <div className="flex flex-wrap gap-3">
                      {['Yes', 'No', 'Not Sure'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={data.is_material_tested === opt}
                          onClick={() => set('is_material_tested', opt)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Timeline */}
                {s === 5 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">When do you need the work done?</h3>
                    <div className="flex flex-col gap-3">
                      {[
                        'Immediately/Emergency',
                        'Within 2 weeks',
                        'More than 2 weeks',
                        'Not sure - still planning/budgeting',
                      ].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={data.work_done === opt}
                          onClick={() => set('work_done', opt)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Details */}
                {s === 6 && (
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-black">Any additional details?</h3>
                    <p className="mb-6 text-sm text-muted">
                      Describe your project in more detail — size, location, any concerns, etc.
                    </p>
                    <textarea
                      rows={5}
                      value={data.details}
                      onChange={(e) => set('details', e.target.value)}
                      placeholder="Tell us more about your project..."
                      className="input-field resize-none"
                    />
                  </div>
                )}

                {/* Step 7: Address */}
                {s === 7 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">Where is the project located?</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Street Address *</label>
                        <input
                          type="text"
                          value={data.street}
                          onChange={(e) => set('street', e.target.value)}
                          className={cn('input-field', errors.street && 'border-red-400')}
                          placeholder="123 Main St"
                        />
                        {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street}</p>}
                      </div>
                      <div>
                        <label className="input-label">Zip Code *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={data.zip_code}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '')
                            set('zip_code', v)
                            if (v.length === 5) lookupZip(v)
                          }}
                          className={cn('input-field', errors.zip_code && 'border-red-400')}
                          placeholder="14201"
                        />
                        {zipLoading && <p className="mt-1 text-xs text-muted">Looking up zip code...</p>}
                        {errors.zip_code && <p className="mt-1 text-xs text-red-500">{errors.zip_code}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">City *</label>
                          <input
                            type="text"
                            value={data.city}
                            onChange={(e) => set('city', e.target.value)}
                            className={cn('input-field', errors.city && 'border-red-400')}
                            placeholder="Buffalo"
                          />
                          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="input-label">State *</label>
                          <input
                            type="text"
                            value={data.state}
                            onChange={(e) => set('state', e.target.value)}
                            className={cn('input-field', errors.state && 'border-red-400')}
                            placeholder="NY"
                          />
                          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Contact info */}
                {s === 8 && (
                  <div>
                    <h3 className="mb-6 text-xl font-bold text-black">Your contact information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">First Name *</label>
                          <input
                            type="text"
                            value={data.first_name}
                            onChange={(e) => set('first_name', e.target.value)}
                            className={cn('input-field', errors.first_name && 'border-red-400')}
                            placeholder="Travis"
                          />
                          {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                        </div>
                        <div>
                          <label className="input-label">Last Name *</label>
                          <input
                            type="text"
                            value={data.last_name}
                            onChange={(e) => set('last_name', e.target.value)}
                            className={cn('input-field', errors.last_name && 'border-red-400')}
                            placeholder="Conley"
                          />
                          {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="input-label">Phone Number *</label>
                        <input
                          type="tel"
                          value={data.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          className={cn('input-field', errors.phone && 'border-red-400')}
                          placeholder="(716) 555-0100"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="input-label">Email Address *</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => set('email', e.target.value)}
                          className={cn('input-field', errors.email && 'border-red-400')}
                          placeholder="you@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={data.sms_opt_in}
                          onChange={(e) => set('sms_opt_in', e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                        />
                        <span className="text-muted">
                          Text me project cost guides and updates from Priority Abatement & Remediation.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 9: Scheduling */}
                {s === 9 && (
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-black">When works best for you?</h3>
                    <p className="mb-6 text-sm text-muted">Schedule a time for us to discuss your project.</p>
                    <div className="space-y-5">
                      <div>
                        <label className="input-label">Preferred Date *</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={data.start_date}
                          onChange={(e) => set('start_date', e.target.value)}
                          className={cn('input-field', errors.start_date && 'border-red-400')}
                        />
                        {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                      </div>
                      <div>
                        <label className="input-label">Preferred Time *</label>
                        <div className="flex flex-wrap gap-2">
                          {['ASAP', 'Morning (8–11 AM)', 'Afternoon (12–3 PM)', 'Evening (4–6 PM)', 'Anytime'].map(
                            (t) => (
                              <OptionCard
                                key={t}
                                label={t}
                                selected={data.start_time === t}
                                onClick={() => set('start_time', t)}
                              />
                            )
                          )}
                        </div>
                        {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
                      </div>
                    </div>
                    <p className="mt-6 text-xs text-muted">
                      By clicking Schedule, I agree to PAR&apos;s terms and consent to be contacted about my project.
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={back}
                    className={cn(
                      'flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-black',
                      step === 0 && 'invisible'
                    )}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  {step < TOTAL_STEPS - 1 ? (
                    <button type="button" onClick={next} className="btn-primary">
                      Continue <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || !data.start_date || !data.start_time}
                      className={cn(
                        'btn-primary',
                        (submitting || !data.start_date || !data.start_time) &&
                          'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {submitting ? 'Submitting...' : 'Schedule Now'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
