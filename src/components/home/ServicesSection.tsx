import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  children?: { id: number; name: string }[]
}

interface Props {
  categories: Category[]
}

export function ServicesSection({ categories }: Props) {
  if (!categories.length) return null

  return (
    <section className="bg-surface py-24">
      <div className="container">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">What We Do</p>
          <h2 className="section-title">Our Services</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
            Priority Abatement & Remediation provides comprehensive environmental and hazardous material services for residential and commercial clients across Western New York.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services/${cat.slug}`}
              className="group rounded-2xl border border-border bg-white p-7 transition-all duration-200 hover:border-brand hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 transition-colors group-hover:bg-brand">
                <div className="h-5 w-5 rounded-sm bg-brand group-hover:bg-black transition-colors" />
              </div>
              <h3 className="mb-2 text-base font-bold text-black group-hover:text-brand transition-colors">
                {cat.name}
              </h3>
              {cat.children && cat.children.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {cat.children.slice(0, 3).map((child) => (
                    <li key={child.id} className="text-sm text-muted">
                      · {child.name}
                    </li>
                  ))}
                  {cat.children.length > 3 && (
                    <li className="text-sm text-muted">+ {cat.children.length - 3} more</li>
                  )}
                </ul>
              )}
              <span className="flex items-center gap-1 text-sm font-semibold text-black group-hover:text-brand transition-colors">
                Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
