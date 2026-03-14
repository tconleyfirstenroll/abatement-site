import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  created_at: string
}

interface Props {
  blogs: Blog[]
}

export function BlogPreviewSection({ blogs }: Props) {
  if (!blogs.length) return null

  const [featured, ...rest] = blogs

  return (
    <section className="bg-surface py-24">
      <div className="container">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="section-label mb-3">Knowledge Base</p>
            <h2 className="section-title">Latest Articles</h2>
          </div>
          <Link href="/articles" className="btn-secondary text-sm">
            View All Articles
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured article */}
          <div className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-200 hover:shadow-xl">
            {featured.featured_image ? (
              <div className="aspect-video overflow-hidden">
                <img
                  src={featured.featured_image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-video bg-border flex items-center justify-center">
                <div className="text-4xl font-black text-muted-light">PAR</div>
              </div>
            )}
            <div className="flex flex-1 flex-col p-7">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <Calendar size={12} />
                {formatDate(featured.published_at ?? featured.created_at)}
              </div>
              <h3 className="mb-3 text-xl font-bold leading-snug text-black group-hover:text-brand transition-colors">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="mb-5 flex-1 text-sm leading-7 text-muted line-clamp-3">{featured.excerpt}</p>
              )}
              <Link
                href={`/articles/${featured.slug}`}
                className="btn-primary self-start text-sm"
              >
                Read More
              </Link>
            </div>
          </div>

          {/* Secondary articles */}
          <div className="flex flex-col gap-6">
            {rest.map((blog) => (
              <Link
                key={blog.id}
                href={`/articles/${blog.slug}`}
                className="group flex overflow-hidden rounded-2xl bg-card transition-all duration-200 hover:shadow-xl"
              >
                {blog.featured_image ? (
                  <div className="w-40 flex-shrink-0 overflow-hidden">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-40 flex-shrink-0 bg-border flex items-center justify-center">
                    <div className="text-xl font-black text-muted-light">PAR</div>
                  </div>
                )}
                <div className="flex flex-col justify-center p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Calendar size={11} />
                    {formatDate(blog.published_at ?? blog.created_at)}
                  </div>
                  <h3 className="mb-2 text-base font-bold leading-snug text-black group-hover:text-brand transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <span className="flex items-center gap-1 text-sm font-semibold text-muted group-hover:text-brand transition-colors">
                    Read More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
