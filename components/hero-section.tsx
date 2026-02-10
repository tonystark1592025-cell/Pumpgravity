"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Droplets, Gauge, Thermometer, Scale, Ruler, Beaker } from "lucide-react"

const converterTypes = [
  {
    id: "flow",
    label: "Flow Rate Simulation",
    icon: Droplets,
    color: "from-blue-500 to-cyan-400",
    description: "L/min to GPM conversions"
  },
  {
    id: "pressure",
    label: "Pressure Converter",
    icon: Gauge,
    color: "from-orange-500 to-red-400",
    description: "PSI, Bar, Pascal units"
  },
  {
    id: "temperature",
    label: "Temperature Scale",
    icon: Thermometer,
    color: "from-purple-500 to-pink-400",
    description: "Celsius, Fahrenheit, Kelvin"
  },
  {
    id: "mass",
    label: "Mass Calculator",
    icon: Scale,
    color: "from-green-500 to-emerald-400",
    description: "kg, lb, oz conversions"
  },
  {
    id: "length",
    label: "Length Converter",
    icon: Ruler,
    color: "from-indigo-500 to-violet-400",
    description: "Metric & Imperial units"
  },
  {
    id: "volume",
    label: "Volume Calculator",
    icon: Beaker,
    color: "from-teal-500 to-cyan-400",
    description: "Liters, Gallons, m³"
  },
]

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % converterTypes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const activeConverter = converterTypes[activeIndex]
  const ActiveIcon = activeConverter.icon

  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <Badge variant="outline" className="mb-6 border-accent/50 bg-accent/10 text-accent">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />
              Global Engineering Network
            </Badge>

            <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Smart AI-Powered{" "}
              <span className="text-primary">Unit Conversions</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Advanced calculations for Science, Engineering & Construction.
              Just describe what you need - AI handles the rest.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                STEM Calculations
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Engineering
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                30+ Categories
              </Badge>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/converters">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Choose Your Converter
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button size="lg" variant="outline" className="border-border bg-transparent text-foreground hover:bg-secondary">
                  Ask AI Assistant <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Animated Converter Visualization */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-80 w-full max-w-md sm:h-96">
              {/* Background Glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${activeConverter.color} opacity-20 transition-all duration-1000`} />
              
              {/* Main Animation Container */}
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur">
                {/* Animated Rings */}
                <div className="relative mb-6 h-36 w-36 sm:h-44 sm:w-44">
                  {/* Outer Ring */}
                  <div 
                    className={`absolute inset-0 animate-spin rounded-full border-4 opacity-30`} 
                    style={{ 
                      animationDuration: "8s",
                      borderColor: `var(--primary)`
                    }} 
                  />
                  {/* Middle Ring */}
                  <div 
                    className="absolute inset-4 animate-spin rounded-full border-4 opacity-40" 
                    style={{ 
                      animationDuration: "6s", 
                      animationDirection: "reverse",
                      borderColor: `var(--accent)`
                    }} 
                  />
                  {/* Inner Core */}
                  <div className={`absolute inset-8 flex items-center justify-center rounded-full bg-gradient-to-br ${activeConverter.color} transition-all duration-1000`}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20 sm:h-20 sm:w-20">
                      <ActiveIcon className="h-8 w-8 text-foreground transition-all duration-500 sm:h-10 sm:w-10" />
                    </div>
                  </div>
                  
                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s" }}>
                    <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: "10s", animationDirection: "reverse" }}>
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-lg shadow-accent/50" />
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: "15s" }}>
                    <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                </div>

                {/* Converter Type Indicators */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-1">
                  {converterTypes.map((type, index) => (
                    <div
                      key={type.id}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        index === activeIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-wider text-foreground transition-all duration-500">
                    {activeConverter.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground transition-all duration-500">
                    {activeConverter.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
