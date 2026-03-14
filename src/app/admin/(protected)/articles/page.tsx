import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function ArticlesPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('blogs')
    .select('id, title, slug, status, created_at, published_at, author_id, profiles(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Articles</h1>
          <p className="mt-1 text-sm text-muted">{articles?.length ?? 0} total articles</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary text-sm px-5 py-2.5">
          <Plus size={16} />
          New Article
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Author</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles?.map((article) => {
                const profile = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles
                return (
                  <tr
                    key={article.id}
                    className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="font-semibold text-black hover:text-brand transition-colors"
                      >
                        {article.title}
                      </Link>
                      <div className="text-xs text-muted mt-0.5">/{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {article.status === 1 ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-muted">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {profile?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">
                      {formatDate(article.published_at ?? article.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!articles?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    No articles yet.{' '}
                    <Link href="/admin/articles/new" className="font-semibold text-brand hover:underline">
                      Create your first article →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
