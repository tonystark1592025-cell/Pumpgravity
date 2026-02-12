import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Calculator, Activity, Zap, Power } from "lucide-react"

export default function CalculatorsPage() {
  const calculators = [
    {
      title: "Pump Affinity Laws Calculator",
      description: "Calculate pump performance changes based on speed or diameter variations using affinity laws.",
      icon: Activity,
      href: "/calculators/pump-affinity-calculator",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      features: ["Speed Changes", "Diameter Changes", "Flow, Head & Power"]
    },
    {
      title: "Pump Power Calculator",
      description: "Calculate shaft power required for pumps based on flow rate, head, specific gravity, and efficiency.",
      icon: Power,
      href: "/calculators/pump-power-calculator",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      features: ["Shaft Power", "Flow Rate", "Differential Head"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Engineering Calculators</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Professional engineering calculators for pump systems, fluid dynamics, and more
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc) => {
              const Icon = calc.icon
              return (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${calc.bgColor}`}>
                      <Icon className={`h-6 w-6 ${calc.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {calc.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {calc.description}
                      </p>
                      {calc.features && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {calc.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                </Link>
              )
            })}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Zap className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">More Calculators Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're working on adding more engineering and scientific calculators
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
