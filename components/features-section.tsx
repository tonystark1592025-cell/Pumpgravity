import { Rocket, FlaskConical, Smartphone, Monitor, Zap, Globe, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const comingSoon = [
  {
    title: "Advanced STEM",
    description: "Chemistry, physics & biology calculators (coming soon)",
    icon: FlaskConical,
    color: "bg-primary/20 text-primary",
  },
  {
    title: "Engineer Suite",
    description: "Construction & structural calculations",
    icon: Rocket,
    color: "bg-accent/20 text-accent",
  },
  {
    title: "Mobile Apps",
    description: "iOS & Android with offline mode",
    icon: Smartphone,
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    title: "Desktop Apps",
    description: "Windows, Mac & Linux applications",
    icon: Monitor,
    color: "bg-chart-4/20 text-chart-4",
  },
]

const features = [
  {
    title: "Instant Calculations",
    description: "Get immediate results as you type. No delays, no waiting.",
    icon: Zap,
  },
  {
    title: "Comprehensive Coverage",
    description: "From basic units to specialized measurements across 32 categories.",
    icon: Globe,
  },
  {
    title: "Accurate Results",
    description: "Based on international standards with scientific precision.",
    icon: CheckCircle,
  },
]

export function FeaturesSection() {
  return (
    <>
      {/* Coming in 2025 Section */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-chart-4/10 px-4 py-1.5 text-sm font-medium text-chart-4">
              <Rocket className="h-4 w-4" />
              Coming in 2025
            </div>
            <p className="text-muted-foreground">
              Exciting new features focused on STEM calculations and advanced tools
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {comingSoon.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30"
                >
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="#">
              <Button variant="outline" className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary">
                View Full Roadmap
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="bg-card/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
