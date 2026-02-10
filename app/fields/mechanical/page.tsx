import { Metadata } from "next"
import { 
  Wind, 
  Shield, 
  Package, 
  BarChart3, 
  Settings, 
  Cog, 
  Waves, 
  Flame, 
  Wrench, 
  Snowflake, 
  Zap, 
  Thermometer 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Mechanical Engineering Calculators - Pump Gravity",
  description: "Professional mechanical engineering calculators for HVAC, fluid dynamics, thermodynamics, and structural analysis",
}

const mechanicalCalculators = [
  {
    title: "Air Flow Duct Sizing",
    description: "Calculate duct dimensions and friction losses for HVAC systems using the Equal Friction method.",
    icon: Wind,
    href: "/calculators/air-flow-duct-sizing",
    category: "HVAC"
  },
  {
    title: "Allowable Stress",
    description: "Determine the maximum safe working stress based on material yield strength and Factor of Safety.",
    icon: Shield,
    href: "/calculators/allowable-stress",
    category: "Structural"
  },
  {
    title: "ASME Vessel Design",
    description: "Calculate required shell and head thickness for pressure vessels per ASME Section VIII Div 1.",
    icon: Package,
    href: "/calculators/asme-vessel-design",
    category: "Pressure Vessels"
  },
  {
    title: "Beam Deflection",
    description: "Compute slope and deflection for simply supported, cantilever, and fixed beams under various loads.",
    icon: BarChart3,
    href: "/calculators/beam-deflection",
    category: "Structural"
  },
  {
    title: "Bearing Life Calculator",
    description: "Estimate the L10 rating life of ball and roller bearings based on dynamic load ratings.",
    icon: Settings,
    href: "/calculators/bearing-life",
    category: "Mechanical Components"
  },
  {
    title: "Belt & Pulley",
    description: "Calculate belt length, speed ratio, and center distance for power transmission systems.",
    icon: Cog,
    href: "/calculators/belt-pulley",
    category: "Power Transmission"
  },
  {
    title: "Bernoulli Equation",
    description: "Analyze fluid dynamics conservation of energy across two points in a streamline.",
    icon: Waves,
    href: "/calculators/bernoulli-equation",
    category: "Fluid Dynamics"
  },
  {
    title: "Boiler Efficiency",
    description: "Calculate thermal efficiency using the Direct Method (Input-Output) for steam boilers.",
    icon: Flame,
    href: "/calculators/boiler-efficiency",
    category: "Thermodynamics"
  },
  {
    title: "Bolt Torque",
    description: "Determine the required tightening torque to achieve desired preload tension in bolts.",
    icon: Wrench,
    href: "/calculators/bolt-torque",
    category: "Fasteners"
  },
  {
    title: "Chiller Capacity",
    description: "Calculate the cooling capacity (TR) required based on flow rate and temperature differential.",
    icon: Snowflake,
    href: "/calculators/chiller-capacity",
    category: "HVAC"
  },
  {
    title: "Compressor Power",
    description: "Estimate brake horsepower (BHP) required for adiabatic compression of gases.",
    icon: Zap,
    href: "/calculators/compressor-power",
    category: "Thermodynamics"
  },
  {
    title: "Heat Transfer Modes",
    description: "Solve fundamental heat transfer problems for conduction, convection, and radiation.",
    icon: Thermometer,
    href: "/calculators/heat-transfer-modes",
    category: "Heat Transfer"
  }
]

const categories = Array.from(new Set(mechanicalCalculators.map(calc => calc.category)))

export default function MechanicalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Mechanical Engineering Calculators
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Professional-grade calculators for mechanical engineers covering HVAC, fluid dynamics, 
            thermodynamics, structural analysis, and mechanical components design.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Calculators Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mechanicalCalculators.map((calculator) => {
            const IconComponent = calculator.icon
            return (
              <Card 
                key={calculator.title}
                className="group cursor-pointer border-border bg-card transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
              >
                <CardHeader className="pb-4">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {calculator.title}
                  </CardTitle>
                  <div className="text-xs font-medium text-primary">
                    {calculator.category}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    {calculator.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            More Calculators Coming Soon
          </h3>
          <p className="text-muted-foreground">
            We're continuously adding new mechanical engineering calculators. 
            Check back regularly for updates or suggest a calculator you'd like to see.
          </p>
        </div>
      </div>
    </div>
  )
}