import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: article } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, content, featured_image, status, meta_title, meta_description, author_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!article) notFound()

  return (
    <ArticleEditor
      authorId={user.id}
      initialData={{
        id: article.id,
        title: article.title ?? '',
        slug: article.slug ?? '',
        excerpt: article.excerpt ?? '',
        content: article.content ?? '',
        featured_image: article.featured_image ?? '',
        status: article.status ?? 0,
        meta_title: article.meta_title ?? '',
        meta_description: article.meta_description ?? '',
      }}
    />
  )
}
