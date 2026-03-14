import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Tiffany W.',
    service: 'Disaster Cleanup Customer',
    review:
      'It was a pleasure working with Priority Abatement and Remediation (PAR). He was very patient with all our questions, responsive and very professional. We called PAR initially and they quickly responded to us and did a thorough inspection of our house and the water damage we had. He answered all our questions and concerns and proceeded to immediately set up a day and time for the work to be done. The whole experience was great, and I will definitely refer Priority Abatement and Remediation!',
    rating: 5,
  },
  {
    name: 'Mike S.',
    service: 'Asbestos Abatement Customer',
    review:
      'It was a pleasure working with Priority Abatement and Remediation (PAR). He was very patient with all our questions, responsive and very professional. We called PAR initially and they quickly responded to us and did a thorough inspection of our house and the water damage we had. He answered all our questions and concerns and proceeded to immediately set up a day and time for the work to be done. The whole experience was great, and I will definitely refer Priority Abatement and Remediation!',
    rating: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={16} fill="#FFC527" className="text-brand" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="bg-brand py-24">
      <div className="container">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/50">
              Testimonials
            </p>
            <h2 className="text-4xl font-black tracking-tight text-black md:text-5xl">
              Our Customer Reviews
            </h2>
          </div>
          <div className="max-w-sm border-l-2 border-black/20 pl-6 text-sm leading-7 text-black/70">
            Reviews from our satisfied customers feature feedback that highlight positive experiences, helping us build trust and credibility for our business.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.name} className="relative rounded-2xl bg-white p-8 pt-12 shadow-lg">
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-xl bg-black">
                <Quote size={18} fill="white" className="text-white" />
              </div>
              <p className="mb-6 text-sm leading-7 text-muted">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black">{t.name}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-light">
                    {t.service}
                  </p>
                </div>
                <StarRating count={t.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
