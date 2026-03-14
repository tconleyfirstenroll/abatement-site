'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

interface CategoryData {
  id?: string
  name?: string
  slug?: string
  parent_id?: string | null
  type?: string
  status?: string
}

interface ParentCategory {
  id: string
  name: string
}

interface Props {
  initialData?: CategoryData
  parentCategories: ParentCategory[]
}

export function CategoryEditor({ initialData, parentCategories }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [parentId, setParentId] = useState<string>(initialData?.parent_id ?? '')
  const [type, setType] = useState(initialData?.type ?? 'none')
  const [status, setStatus] = useState(initialData?.status ?? 'active')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.id)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!slug.trim()) {
      setError('Slug is required.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const payload: Record<string, unknown> = {
      name: name.trim(),
      slug: slug.trim(),
      parent_id: parentId || null,
      type: type || null,
      status,
    }

    if (initialData?.id) {
      payload.id = initialData.id
    }

    const { error: dbError } = await supabase.from('categories').upsert(payload)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/categories')
    router.refresh()
  }

  async function handleDelete() {
    if (!initialData?.id) return
    if (!confirm('Are you sure you want to delete this category?')) return

    setSaving(true)
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', initialData.id)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {initialData?.id ? 'Edit Category' : 'New Category'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {initialData?.id ? 'Update category details.' : 'Create a new service category.'}
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
            onClick={() => router.push('/admin/categories')}
            className="btn-secondary text-sm px-5 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Category'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="max-w-xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <div>
            <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Category name…"
            />
          </div>

          <div>
            <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              className="input-field font-mono text-xs"
              placeholder="category-slug"
            />
          </div>

          <div>
            <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Parent Category
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="input-field"
            >
              <option value="">— None (top-level) —</option>
              {parentCategories
                .filter((c) => c.id !== initialData?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option value="none">None</option>
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>

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
        </div>
      </div>
    </div>
  )
}
