import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { LeadStatusUpdater } from '@/components/admin/LeadStatusUpdater'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', parseInt(id))
    .single()

  if (!lead) notFound()

  const attribution = [
    { label: 'First Touch Source', value: lead.ft_utm_source },
    { label: 'First Touch Medium', value: lead.ft_utm_medium },
    { label: 'First Touch Campaign', value: lead.ft_utm_campaign },
    { label: 'First Touch GCLID', value: lead.ft_gclid },
    { label: 'First Touch Landing Page', value: lead.ft_landing_page },
    { label: 'First Touch Referrer', value: lead.ft_referrer },
    { label: 'Last Touch Source', value: lead.lt_utm_source },
    { label: 'Last Touch Medium', value: lead.lt_utm_medium },
    { label: 'Last Touch Campaign', value: lead.lt_utm_campaign },
    { label: 'Last Touch GCLID', value: lead.lt_gclid },
    { label: 'Last Touch Landing Page', value: lead.lt_landing_page },
    { label: 'Last Touch Referrer', value: lead.lt_referrer },
    { label: 'Device', value: lead.device_type },
    { label: 'Browser', value: lead.browser },
    { label: 'IP Address', value: lead.ip_address },
    { label: 'Geo City', value: lead.geo_city },
    { label: 'Geo State', value: lead.geo_state },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/leads" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-black transition-colors">
          <ArrowLeft size={15} /> Leads
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm font-semibold text-black">{lead.first_name} {lead.last_name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">

          {/* Contact */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Contact Information</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Full Name', value: `${lead.first_name} ${lead.last_name}` },
                { label: 'Email', value: lead.email },
                { label: 'Phone', value: lead.phone },
                { label: 'SMS Opt-In', value: lead.sms_opt_in ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-black">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Project details */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Project Details</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Project Type', value: lead.project_type },
                { label: 'Service Category', value: lead.category_name },
                { label: 'Interior / Exterior', value: lead.category_type },
                { label: 'Material Tested', value: lead.is_material_tested },
                { label: 'Timeline', value: lead.work_done },
                { label: 'Preferred Date', value: lead.start_date ? formatDate(lead.start_date) : null },
                { label: 'Preferred Time', value: lead.start_time },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-black">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            {lead.details && (
              <div className="mt-4 border-t border-border pt-4">
                <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Additional Details</dt>
                <p className="text-sm leading-7 text-black">{lead.details}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Project Location</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Street', value: lead.street },
                { label: 'Zip Code', value: lead.zip_code },
                { label: 'City', value: lead.city },
                { label: 'State', value: lead.state },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-black">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Attribution */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Lead Attribution</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {attribution.filter(a => a.value).map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-1 truncate text-sm font-medium text-black" title={value ?? ''}>
                    {value}
                  </dd>
                </div>
              ))}
              {attribution.every(a => !a.value) && (
                <p className="text-sm text-muted col-span-2">No attribution data captured (direct traffic).</p>
              )}
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Lead Status</h2>
            <LeadStatusUpdater leadId={lead.id} currentStatus={lead.status} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-black">Timeline</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Submitted</dt>
                <dd className="mt-1 text-sm font-medium text-black">{formatDate(lead.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Last Updated</dt>
                <dd className="mt-1 text-sm font-medium text-black">{formatDate(lead.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-black p-6">
            <p className="mb-3 text-sm font-semibold text-white">Quick Actions</p>
            <div className="space-y-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  Call {lead.first_name}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="btn-outline-white w-full justify-center text-sm py-2.5"
                >
                  Email {lead.first_name}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
