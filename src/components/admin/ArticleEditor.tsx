'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

interface ArticleData {
  id?: string
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  featured_image?: string
  status?: number
  meta_title?: string
  meta_description?: string
}

interface Props {
  initialData?: ArticleData
  authorId: string
}

export function ArticleEditor({ initialData, authorId }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image ?? '')
  const [status, setStatus] = useState<number>(initialData?.status ?? 0)
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.id)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited])

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!slug.trim()) {
      setError('Slug is required.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const now = new Date().toISOString()

    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim() || null,
      featured_image: featuredImage.trim() || null,
      status,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      author_id: authorId,
    }

    if (initialData?.id) {
      payload.id = initialData.id
      if (status === 1 && initialData.status !== 1) {
        payload.published_at = now
      }
    } else {
      if (status === 1) {
        payload.published_at = now
      }
    }

    const { error: dbError } = await supabase.from('blogs').upsert(payload)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/articles')
    router.refresh()
  }

  async function handleDelete() {
    if (!initialData?.id) return
    if (!confirm('Are you sure you want to delete this article?')) return

    setSaving(true)
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('blogs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', initialData.id)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin/articles')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {initialData?.id ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {initialData?.id ? 'Update article content and settings.' : 'Create a new blog article.'}
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
            onClick={() => router.push('/admin/articles')}
            className="btn-secondary text-sm px-5 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Article'}
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
                placeholder="Enter article title…"
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
                placeholder="article-slug"
              />
            </div>

            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="input-field resize-none"
                placeholder="Short summary of the article…"
              />
            </div>

            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="input-field resize-y"
                placeholder="Write your article content here…"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-black">SEO</h2>
            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="input-field"
                placeholder="Meta title (defaults to article title if blank)"
              />
            </div>
            <div>
              <label className="input-label mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Meta description for search engines…"
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
                  onClick={() => setStatus(0)}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    status === 0 ? 'bg-black text-white' : 'bg-white text-muted hover:text-black'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setStatus(1)}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    status === 1 ? 'bg-brand text-black' : 'bg-white text-muted hover:text-black'
                  }`}
                >
                  Published
                </button>
              </div>
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
