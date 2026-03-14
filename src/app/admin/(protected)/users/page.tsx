import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserPlus, Info } from 'lucide-react'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, role')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Users</h1>
          <p className="mt-1 text-sm text-muted">{profiles?.length ?? 0} registered users</p>
        </div>
        <button
          type="button"
          className="btn-primary text-sm px-5 py-2.5 cursor-default"
          title="User invitation is managed via Supabase dashboard"
        >
          <UserPlus size={16} />
          Invite User
        </button>
      </div>

      {/* Invite note */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-brand" />
        <p className="text-sm text-muted">
          <span className="font-semibold text-black">User invitations</span> are managed via the{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline hover:text-brand-dark"
          >
            Supabase Dashboard
          </a>
          . Go to Authentication → Users → Invite user. After they sign up, their profile will appear here and you can update their role.
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-black">
                    {p.name || '—'}
                    {p.id === user.id && (
                      <span className="ml-2 rounded-full bg-brand/20 px-2 py-0.5 text-xs font-semibold text-brand">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">{p.id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        p.role === 'admin'
                          ? 'bg-brand/20 text-brand-dark'
                          : 'bg-gray-100 text-muted'
                      }`}
                    >
                      {p.role ?? 'editor'}
                    </span>
                  </td>
                </tr>
              ))}
              {!profiles?.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-muted">
                    No users found.
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
