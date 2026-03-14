import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('title, meta_title, meta_description, excerpt')
    .eq('slug', slug)
    .single()

  if (!data) return {}
  return {
    title: data.meta_title ?? data.title,
    description: data.meta_description ?? data.excerpt ?? undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 1)
    .is('deleted_at', null)
    .single()

  if (!blog) notFound()

  return (
    <>
      {/* Article header */}
      <div className="bg-black py-20">
        <div className="container max-w-3xl">
          <Link href="/articles" className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light transition-colors">
            <ArrowLeft size={15} /> Back to Articles
          </Link>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            <Calendar size={12} />
            {formatDate(blog.published_at ?? blog.created_at)}
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">{blog.title}</h1>
          {blog.excerpt && (
            <p className="mt-5 text-lg text-white/60">{blog.excerpt}</p>
          )}
        </div>
      </div>

      {/* Article content */}
      <article className="py-16">
        <div className="container max-w-3xl">
          {blog.featured_image && (
            <div className="mb-10 overflow-hidden rounded-2xl">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full object-cover"
              />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-black prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: blog.content ?? '' }}
          />
        </div>
      </article>

      {/* CTA */}
      <section className="bg-brand py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-black text-black">Ready to Get Started?</h2>
          <p className="mb-8 text-base text-black/70">Contact our team for a free quote on your abatement or remediation project.</p>
          <Link href="/#quote" className="btn-secondary">
            Request a Free Quote
          </Link>
        </div>
      </section>
    </>
  )
}
