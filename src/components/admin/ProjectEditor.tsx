'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProjectData {
  id?: string
  title?: string
  description?: string
  featured_image?: string
  status?: string
  show_on_home?: boolean
}

interface Props {
  initialData?: ProjectData
}

export function ProjectEditor({ initialData }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image ?? '')
  const [status, setStatus] = useState(initialData?.status ?? 'active')
  const [showOnHome, setShowOnHome] = useState(initialData?.show_on_home ?? false)

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      featured_image: featuredImage.trim() || null,
      status,
      show_on_home: showOnHome,
    }

    if (initialData?.id) {
      payload.id = initialData.id
    }

    const { error: dbError } = await supabase.from('projects').upsert(payload)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/projects')
    router.refresh()
  }

  async function handleDelete() {
    if (!initialData?.id) return
    if (!confirm('Are you sure you want to delete this project?')) return

    setSaving(true)
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', initialData.id)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/projects')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {initialData?.id ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {initialData?.id ? 'Update project details.' : 'Add a new project to your portfolio.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {initialData?.id && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => router.push('/admin/projects')}
            className="btn-secondary text-sm px-5 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter project title…"
              />
            </div>

            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="input-field resize-y"
                placeholder="Describe the project…"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-black">Settings</h2>

            {/* Status toggle */}
            <div>
              <label className="input-label mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </label>
              <div className="flex rounded-xl overflow-hidden border border-border">
                <button
                  onClick={() => setStatus('inactive')}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    status === 'inactive' ? 'bg-black text-white' : 'bg-white text-muted hover:text-black'
                  }`}
                >
                  Inactive
                </button>
                <button
                  onClick={() => setStatus('active')}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    status === 'active' ? 'bg-brand text-black' : 'bg-white text-muted hover:text-black'
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

            {/* Show on Home */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand"
                />
                <span className="text-sm font-semibold text-black">Show on Homepage</span>
              </label>
              <p className="mt-1 text-xs text-muted pl-7">Feature this project on the home page.</p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Featured Image URL
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="input-field"
                placeholder="https://…"
              />
              {featuredImage && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage}
                    alt="Featured image preview"
                    className="w-full object-cover"
                    style={{ maxHeight: 180 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
