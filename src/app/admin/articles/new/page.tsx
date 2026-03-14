import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

export default async function NewArticlePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return <ArticleEditor authorId={user.id} />
}
