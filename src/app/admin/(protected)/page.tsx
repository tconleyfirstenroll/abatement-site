import { createClient } from '@/lib/supabase/server'
import { PhoneIncoming, FileText, Briefcase, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: totalBlogs },
    { count: totalProjects },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new').is('deleted_at', null),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('projects').select('*', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, first_name, last_name, email, category_name, status, created_at, lt_utm_source, lt_utm_campaign, device_type')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(8)

  const stats = [
    { label: 'Total Leads', value: totalLeads ?? 0, icon: PhoneIncoming, href: '/admin/leads', color: 'bg-brand' },
    { label: 'New Leads', value: newLeads ?? 0, icon: TrendingUp, href: '/admin/leads?status=new', color: 'bg-green-400' },
    { label: 'Articles', value: totalBlogs ?? 0, icon: FileText, href: '/admin/articles', color: 'bg-blue-400' },
    { label: 'Projects', value: totalProjects ?? 0, icon: Briefcase, href: '/admin/projects', color: 'bg-purple-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of your site activity</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon size={22} className="text-black" />
              </div>
              <div>
                <p className="text-2xl font-black text-black">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent leads */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-black">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Device</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads?.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-black hover:text-brand transition-colors">
                      {lead.first_name} {lead.last_name}
                    </Link>
                    <div className="text-xs text-muted">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-muted">{lead.category_name || '—'}</td>
                  <td className="px-6 py-4">
                    {lead.lt_utm_source ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {lead.lt_utm_source}
                        {lead.lt_utm_campaign ? ` / ${lead.lt_utm_campaign}` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Direct</span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize text-muted text-xs">{lead.device_type || '—'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!recentLeads?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No leads yet. They&apos;ll appear here once your site starts receiving traffic.
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-green-50 text-green-700',
    contacted: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-yellow-50 text-yellow-700',
    won: 'bg-emerald-50 text-emerald-700',
    lost: 'bg-red-50 text-red-700',
    spam: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
