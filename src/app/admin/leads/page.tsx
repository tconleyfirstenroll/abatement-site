import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam']
const PAGE_SIZE = 25

const statusStyles: Record<string, string> = {
  new: 'bg-green-50 text-green-700',
  contacted: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-red-50 text-red-700',
  spam: 'bg-gray-100 text-gray-500',
}

export default async function LeadsPage({ searchParams }: Props) {
  const { status, page: pageParam } = await searchParams
  const page = parseInt(pageParam ?? '1') - 1
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select('id, first_name, last_name, email, phone, category_name, status, created_at, lt_utm_source, lt_utm_campaign, ft_utm_source, ft_gclid, device_type, city, state', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (status && STATUSES.includes(status)) {
    query = query.eq('status', status)
  }

  const { data: leads, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Leads</h1>
          <p className="mt-1 text-sm text-muted">{count ?? 0} total leads</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/leads"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${!status ? 'bg-black text-white' : 'bg-white text-muted hover:text-black'}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${status === s ? 'bg-black text-white' : 'bg-white text-muted hover:text-black'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Source (Last Touch)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Device</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-black hover:text-brand transition-colors">
                      {lead.first_name} {lead.last_name}
                    </Link>
                    <div className="text-xs text-muted">{lead.email}</div>
                    <div className="text-xs text-muted">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{lead.category_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {lead.city && lead.state ? `${lead.city}, ${lead.state}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {lead.lt_utm_source ? (
                      <div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {lead.lt_utm_source}
                        </span>
                        {lead.lt_utm_campaign && (
                          <div className="mt-1 text-xs text-muted">{lead.lt_utm_campaign}</div>
                        )}
                        {lead.ft_gclid && (
                          <div className="mt-0.5 text-xs text-muted">GCLID ✓</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Direct / Organic</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs capitalize text-muted">{lead.device_type || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">{formatDate(lead.created_at)}</td>
                </tr>
              ))}
              {!leads?.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 0 && (
                <Link
                  href={`/admin/leads?${status ? `status=${status}&` : ''}page=${page}`}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages - 1 && (
                <Link
                  href={`/admin/leads?${status ? `status=${status}&` : ''}page=${page + 2}`}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
