import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CategoryEditor } from '@/components/admin/CategoryEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: category }, { data: parentCategories }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, parent_id, type, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('categories')
      .select('id, name')
      .is('deleted_at', null)
      .is('parent_id', null)
      .order('name', { ascending: true }),
  ])

  if (!category) notFound()

  return (
    <CategoryEditor
      initialData={{
        id: category.id,
        name: category.name ?? '',
        slug: category.slug ?? '',
        parent_id: category.parent_id ?? null,
        type: category.type ?? 'none',
        status: category.status ?? 'active',
      }}
      parentCategories={parentCategories ?? []}
    />
  )
}
