import { Sparkles, CheckCircle, Clock, Zap, Cpu, Beaker } from "lucide-react"
import Link from "next/link"

export default function RoadmapPage() {
  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Calculators and Conversions",
      status: "completed",
      icon: CheckCircle,
      description: "Comprehensive unit conversion tools and engineering calculators",
      features: [
        "Mass, Length, Area, Volume conversions",
        "Temperature, Pressure, Energy calculators",
        "Time, Flow Rate, Speed conversions",
        "Interactive calculator interface",
        "Real-time conversion results"
      ]
    },
    {
      phase: "Phase 2",
      title: "AI and Advanced Derivations",
      status: "in-progress",
      icon: Zap,
      description: "AI-powered calculation assistance and advanced mathematical derivations",
      features: [
        "AI chat widget for calculation help",
        "Step-by-step derivation explanations",
        "Formula recommendations",
        "Error detection and suggestions",
        "Natural language calculation input"
      ]
    },
    {
      phase: "Phase 3",
      title: "Simulations and Modeling",
      status: "planned",
      icon: Cpu,
      description: "Advanced simulation tools and engineering modeling capabilities",
      features: [
        "Fluid dynamics simulations",
        "Structural analysis tools",
        "Thermodynamic modeling",
        "Interactive 3D visualizations",
        "Custom simulation parameters"
      ]
    },
    {
      phase: "Phase 4",
      title: "Advanced Engineering Tools",
      status: "planned",
      icon: Beaker,
      description: "Specialized tools for complex engineering calculations",
      features: [
        "Material property databases",
        "Design optimization algorithms",
        "Multi-physics simulations",
        "CAD integration capabilities",
        "Professional reporting tools"
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "in-progress":
        return "text-blue-600 dark:text-blue-400"
      case "planned":
        return "text-gray-600 dark:text-gray-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "in-progress":
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      case "planned":
        return "bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
      default:
        return "bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Roadmap</h1>
              <p className="text-muted-foreground">Our journey to build the world's most comprehensive engineering platform</p>
            </div>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-8">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className={`rounded-lg border p-6 ${getStatusBg(item.status)}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getStatusColor(item.status)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{item.phase}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === "completed" && <CheckCircle className="h-3 w-3" />}
                        {item.status === "in-progress" && <Clock className="h-3 w-3" />}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("-", " ")}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {item.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${item.status === "completed" ? "bg-green-500" : item.status === "in-progress" ? "bg-blue-500" : "bg-gray-400"}`} />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Timeline Summary */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Development Timeline</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">Q4 2025</div>
              <div className="text-sm text-muted-foreground">Phase 1 Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Q2 2026</div>
              <div className="text-sm text-muted-foreground">Phase 2 Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">Q4 2026</div>
              <div className="text-sm text-muted-foreground">Phase 3 Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">Q2 2027</div>
              <div className="text-sm text-muted-foreground">Phase 4 Target</div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Help Shape Our Roadmap</h3>
          <p className="text-muted-foreground mb-4">
            Your feedback is crucial in prioritizing features and improvements. Let us know what tools and capabilities would be most valuable for your engineering work.
          </p>
          <Link 
            href="#" 
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Share Feedback
          </Link>
        </div>
      </div>
    </div>
  )
}