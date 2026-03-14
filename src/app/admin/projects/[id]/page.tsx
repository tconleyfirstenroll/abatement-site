import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectEditor } from '@/components/admin/ProjectEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, description, featured_image, status, show_on_home')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!project) notFound()

  return (
    <ProjectEditor
      initialData={{
        id: project.id,
        title: project.title ?? '',
        description: project.description ?? '',
        featured_image: project.featured_image ?? '',
        status: project.status ?? 'active',
        show_on_home: project.show_on_home ?? false,
      }}
    />
  )
}
