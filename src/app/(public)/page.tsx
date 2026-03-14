import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/HeroSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { CoreValuesSection } from '@/components/home/CoreValuesSection'
import { ProjectsSection } from '@/components/home/ProjectsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection'
import { LeadFormSection } from '@/components/home/LeadFormSection'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: projects }, { data: blogs }] = await Promise.all([
    supabase
      .from('categories')
      .select('*, children:categories!parent_id(*)')
      .is('parent_id', null)
      .eq('status', 1)
      .is('deleted_at', null)
      .order('sort_order'),
    supabase
      .from('projects')
      .select('*')
      .eq('show_on_home', true)
      .eq('status', 1)
      .is('deleted_at', null)
      .limit(6),
    supabase
      .from('blogs')
      .select('id, title, slug, excerpt, featured_image, published_at, created_at')
      .eq('status', 1)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  return (
    <>
      <HeroSection categories={categories ?? []} />
      <ServicesSection categories={categories ?? []} />
      <CoreValuesSection />
      <ProjectsSection projects={projects ?? []} />
      <TestimonialsSection />
      <BlogPreviewSection blogs={blogs ?? []} />
      <LeadFormSection categories={categories ?? []} />
    </>
  )
}
