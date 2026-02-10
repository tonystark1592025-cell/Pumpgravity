import { Metadata } from "next"
import { 
  Zap, 
  Battery, 
  Cpu, 
  Radio, 
  Power, 
  Gauge, 
  Cable, 
  Lightbulb, 
  Shield, 
  Activity, 
  Wifi, 
  Plug 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Electrical Engineering Calculators - Pump Gravity",
  description: "Professional electrical engineering calculators for power systems, electronics, and electrical design",
}

const electricalCalculators = [
  {
    title: "Ohm's Law Calculator",
    description: "Calculate voltage, current, resistance, and power using Ohm's law relationships.",
    icon: Zap,
    href: "/calculators/ohms-law",
    category: "Basic Electronics"
  },
  {
    title: "Power Factor Correction",
    description: "Determine capacitor requirements to improve power factor in AC circuits.",
    icon: Battery,
    href: "/calculators/power-factor-correction",
    category: "Power Systems"
  },
  {
    title: "Transformer Calculations",
    description: "Calculate turns ratio, voltage, current, and power for single and three-phase transformers.",
    icon: Cpu,
    href: "/calculators/transformer-calculations",
    category: "Power Systems"
  },
  {
    title: "Antenna Gain & Range",
    description: "Calculate antenna gain, effective radiated power, and communication range.",
    icon: Radio,
    href: "/calculators/antenna-calculations",
    category: "RF & Communications"
  },
  {
    title: "Motor Starting Current",
    description: "Calculate starting current and voltage drop for AC motor applications.",
    icon: Power,
    href: "/calculators/motor-starting-current",
    category: "Motors & Drives"
  },
  {
    title: "Voltage Divider",
    description: "Calculate output voltage and current in resistive voltage divider circuits.",
    icon: Gauge,
    href: "/calculators/voltage-divider",
    category: "Basic Electronics"
  },
  {
    title: "Cable Sizing & Voltage Drop",
    description: "Determine proper cable size and calculate voltage drop for electrical installations.",
    icon: Cable,
    href: "/calculators/cable-sizing",
    category: "Power Distribution"
  },
  {
    title: "LED Current Limiting",
    description: "Calculate resistor values for LED current limiting in DC and AC circuits.",
    icon: Lightbulb,
    href: "/calculators/led-current-limiting",
    category: "Lighting"
  },
  {
    title: "Short Circuit Analysis",
    description: "Calculate fault currents and protective device coordination for electrical systems.",
    icon: Shield,
    href: "/calculators/short-circuit-analysis",
    category: "Protection"
  },
  {
    title: "Frequency Response",
    description: "Analyze RC, RL, and RLC circuit frequency response and filter characteristics.",
    icon: Activity,
    href: "/calculators/frequency-response",
    category: "Signal Processing"
  },
  {
    title: "Transmission Line",
    description: "Calculate characteristic impedance, propagation delay, and reflection coefficients.",
    icon: Wifi,
    href: "/calculators/transmission-line",
    category: "RF & Communications"
  },
  {
    title: "Load Flow Analysis",
    description: "Perform power flow calculations for electrical distribution networks.",
    icon: Plug,
    href: "/calculators/load-flow-analysis",
    category: "Power Systems"
  }
]

const categories = Array.from(new Set(electricalCalculators.map(calc => calc.category)))

export default function ElectricalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Electrical Engineering Calculators
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Professional-grade calculators for electrical engineers covering power systems, 
            electronics, motor drives, protection systems, and RF communications.
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
          {electricalCalculators.map((calculator) => {
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
            We're continuously adding new electrical engineering calculators. 
            Check back regularly for updates or suggest a calculator you'd like to see.
          </p>
        </div>
      </div>
    </div>
  )
}