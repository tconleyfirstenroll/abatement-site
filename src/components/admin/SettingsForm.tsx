'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Setting {
  key: string
  value: string
}

interface Props {
  initialSettings: Setting[]
}

const SETTING_FIELDS = [
  { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Priority Abatement & Restoration' },
  { key: 'site_tagline', label: 'Site Tagline', type: 'text', placeholder: 'Your trusted abatement experts' },
  { key: 'site_phone', label: 'Site Phone', type: 'text', placeholder: '(555) 555-5555' },
  { key: 'site_email', label: 'Site Email', type: 'email', placeholder: 'info@example.com' },
  { key: 'site_location', label: 'Site Location', type: 'text', placeholder: 'City, State' },
  { key: 'gtm_id', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
  { key: 'ga4_measurement_id', label: 'Google Analytics 4 ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
  { key: 'google_ads_id', label: 'Google Ads ID', type: 'text', placeholder: 'AW-XXXXXXXXX' },
  { key: 'microsoft_clarity_id', label: 'Microsoft Clarity ID', type: 'text', placeholder: 'xxxxxxxxxx' },
]

export function SettingsForm({ initialSettings }: Props) {
  const initialMap = Object.fromEntries(initialSettings.map((s) => [s.key, s.value]))
  const [values, setValues] = useState<Record<string, string>>(initialMap)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const upserts = SETTING_FIELDS.map((field) => ({
      key: field.key,
      value: values[field.key] ?? '',
    }))

    const { error: dbError } = await supabase
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' })

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Settings</h1>
          <p className="mt-1 text-sm text-muted">Manage site-wide configuration and tracking IDs.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold">
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-black">Site Information</h2>
          {SETTING_FIELDS.slice(0, 5).map((field) => (
            <div key={field.key}>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                {field.label}
              </label>
              <input
                type={field.type}
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="input-field"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Analytics & Tracking */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-black">Analytics &amp; Tracking</h2>
          {SETTING_FIELDS.slice(5).map((field) => (
            <div key={field.key}>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                {field.label}
              </label>
              <input
                type={field.type}
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="input-field font-mono text-xs"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
