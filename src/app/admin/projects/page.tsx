import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, show_on_home, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Projects</h1>
          <p className="mt-1 text-sm text-muted">{projects?.length ?? 0} total projects</p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary text-sm px-5 py-2.5">
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Show on Home</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-semibold text-black hover:text-brand transition-colors"
                    >
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {project.status === 'active' ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-muted">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block h-4 w-4 rounded ${
                        project.show_on_home ? 'bg-brand' : 'bg-border'
                      }`}
                      aria-label={project.show_on_home ? 'Yes' : 'No'}
                    />
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!projects?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    No projects yet.{' '}
                    <Link href="/admin/projects/new" className="font-semibold text-brand hover:underline">
                      Add your first project →
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
