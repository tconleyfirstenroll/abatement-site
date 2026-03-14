import { Shield, Star, Users, Lightbulb } from 'lucide-react'

const values = [
  {
    icon: Star,
    title: 'Great Services',
    description: 'At Priority Abatement & Remediation, we strive for excellent customer service at all times.',
  },
  {
    icon: Shield,
    title: 'Highest Standards',
    description: 'Priority Abatement & Remediation never cuts corners, and we perform our work to the highest standards.',
  },
  {
    icon: Users,
    title: 'Professional Team',
    description: 'You can rest assured knowing that all of our technicians are certified, and our work is licensed, bonded, insured and lead-safe.',
  },
  {
    icon: Lightbulb,
    title: 'Creative Solutions',
    description: 'At Priority Abatement & Remediation, we always look for creative solutions to any of your abatement and remediation problems.',
  },
]

export function CoreValuesSection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Values</p>
          <h2 className="section-title">Our Core Values</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">
            We pride ourselves on our high quality customer service, and we know that we can provide the service you need. Choose Priority Abatement & Remediation for all your abatement and remediation needs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div key={value.title} className="card-hover group text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8E8E8] transition-all duration-300 group-hover:bg-brand">
                  <Icon
                    size={36}
                    className="text-muted transition-colors duration-300 group-hover:text-black"
                  />
                </div>
                <h3 className="mb-3 text-base font-bold text-black">{value.title}</h3>
                <p className="text-sm leading-6 text-muted">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
