import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Expert articles on asbestos abatement, mold remediation, lead removal, and demolition from Priority Abatement & Remediation.',
}

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, featured_image, published_at, created_at')
    .eq('status', 1)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })

  return (
    <>
      {/* Page header */}
      <div className="bg-black py-20">
        <div className="container">
          <p className="section-label mb-4">Knowledge Base</p>
          <h1 className="text-5xl font-black text-white">Articles</h1>
          <p className="mt-4 max-w-xl text-base text-white/60">
            Expert guidance on abatement, remediation, and hazardous material management from our team.
          </p>
        </div>
      </div>

      {/* Articles grid */}
      <section className="bg-surface py-20">
        <div className="container">
          {!blogs?.length ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/articles/${blog.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-200 hover:shadow-xl"
                >
                  {blog.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-border flex items-center justify-center">
                      <span className="text-3xl font-black text-muted-light">PAR</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      <Calendar size={11} />
                      {formatDate(blog.published_at ?? blog.created_at)}
                    </div>
                    <h2 className="mb-3 flex-1 text-lg font-bold leading-snug text-black group-hover:text-brand transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="mb-4 text-sm leading-6 text-muted line-clamp-3">{blog.excerpt}</p>
                    )}
                    <span className="flex items-center gap-1 text-sm font-semibold text-black group-hover:text-brand transition-colors">
                      Read More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
