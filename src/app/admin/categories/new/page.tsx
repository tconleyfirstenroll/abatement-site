import { createClient } from '@/lib/supabase/server'
import { CategoryEditor } from '@/components/admin/CategoryEditor'

export default async function NewCategoryPage() {
  const supabase = await createClient()

  const { data: parentCategories } = await supabase
    .from('categories')
    .select('id, name')
    .is('deleted_at', null)
    .is('parent_id', null)
    .order('name', { ascending: true })

  return (
    <CategoryEditor parentCategories={parentCategories ?? []} />
  )
}
