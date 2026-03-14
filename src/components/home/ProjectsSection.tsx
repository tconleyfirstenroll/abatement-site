interface Project {
  id: number
  title: string
  description: string
  featured_image: string | null
}

interface Props {
  projects: Project[]
}

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null

  return (
    <section className="bg-black py-24">
      <div className="container">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="section-label mb-3">Our Work</p>
            <h2 className="section-title text-white">Latest Projects</h2>
          </div>
          <a href="/projects" className="btn-outline-white text-sm">
            View All Projects
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="group overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all duration-200 hover:border-brand/50 hover:bg-white/10">
              {project.featured_image ? (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.featured_image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-white/10 flex items-center justify-center">
                  <div className="text-4xl font-black text-white/20">PAR</div>
                </div>
              )}
              <div className="p-6">
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-brand transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm leading-6 text-white/50 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
