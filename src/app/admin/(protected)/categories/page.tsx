import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  type: string | null
  status: string
  parent_id: string | null
  sort_order: number | null
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, type, status, parent_id, sort_order')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  const all = (categories ?? []) as Category[]
  const parents = all.filter((c) => !c.parent_id)
  const childrenMap: Record<string, Category[]> = {}
  all.forEach((c) => {
    if (c.parent_id) {
      if (!childrenMap[c.parent_id]) childrenMap[c.parent_id] = []
      childrenMap[c.parent_id].push(c)
    }
  })

  const rows: { cat: Category; depth: number }[] = []
  parents.forEach((p) => {
    rows.push({ cat: p, depth: 0 })
    ;(childrenMap[p.id] ?? []).forEach((child) => {
      rows.push({ cat: child, depth: 1 })
    })
  })
  // Orphaned children (parent deleted)
  all.forEach((c) => {
    if (c.parent_id && !parents.find((p) => p.id === c.parent_id)) {
      if (!rows.find((r) => r.cat.id === c.id)) {
        rows.push({ cat: c, depth: 0 })
      }
    }
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Categories</h1>
          <p className="mt-1 text-sm text-muted">{all.length} total categories</p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary text-sm px-5 py-2.5">
          <Plus size={16} />
          New Category
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Children</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ cat, depth }) => (
                <tr
                  key={cat.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors"
                >
                  <td className="px-6 py-4">
                    <div style={{ paddingLeft: depth * 24 }} className="flex items-center gap-2">
                      {depth > 0 && (
                        <span className="text-border text-sm">↳</span>
                      )}
                      <div>
                        <Link
                          href={`/admin/categories/${cat.id}`}
                          className="font-semibold text-black hover:text-brand transition-colors"
                        >
                          {cat.name}
                        </Link>
                        <div className="text-xs text-muted mt-0.5">/{cat.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize text-muted">
                    {cat.type && cat.type !== 'none' ? cat.type : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {cat.status === 'active' ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-muted">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {depth === 0 ? (childrenMap[cat.id]?.length ?? 0) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    No categories yet.{' '}
                    <Link href="/admin/categories/new" className="font-semibold text-brand hover:underline">
                      Create your first category →
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
