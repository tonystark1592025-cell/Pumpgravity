import Link from "next/link"
import { Ruler, Scale, Thermometer, Box, Square, Gauge, Zap, Power } from "lucide-react"

const popularConverters = [
  { name: "Length", units: 9, tools: 7, icon: Ruler, href: "/converters#length" },
  { name: "Mass", units: 8, tools: 7, icon: Scale, href: "/converters#mass" },
  { name: "Temperature", units: 5, tools: 6, icon: Thermometer, href: "/converters#temperature" },
  { name: "Volume", units: 8, tools: 7, icon: Box, href: "/converters#volume" },
  { name: "Area", units: 7, tools: 5, icon: Square, href: "/converters#area" },
  { name: "Speed", units: 5, tools: 5, icon: Gauge, href: "/converters#speed" },
  { name: "Energy", units: 6, tools: 6, icon: Zap, href: "/converters#energy" },
  { name: "Power", units: 7, tools: 6, icon: Power, href: "/converters#power" },
]

export function PopularConverters() {
  return (
    <section className="bg-card/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary md:text-3xl">Popular Converters</h2>
          <p className="mt-2 text-muted-foreground">
            Quick access to the most frequently used unit converters
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {popularConverters.map((converter) => {
            const Icon = converter.icon
            return (
              <Link
                key={converter.name}
                href={converter.href}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{converter.name}</h3>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  <span>{converter.units} units</span>
                  <span>{converter.tools} tools</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
