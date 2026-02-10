"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Scale,
  Ruler,
  Square,
  Box,
  Thermometer,
  Clock,
  Binary,
  Gauge,
  Barcode,
  Zap,
  Percent,
  Timer,
  Cable,
  Plug,
  Power,
  Activity,
  Wind,
  Lightbulb,
  Waves,
  Compass,
  Weight,
  Rocket,
  Fuel,
  HardDrive,
  Monitor,
  ArrowRight,
  Copy,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const converters = [
  {
    id: "mass",
    name: "Mass Converter",
    baseUnit: "gram",
    icon: Scale,
    tags: ["mg", "g", "kg", "lb"],
    units: 7,
    isNew: true,
  },
  {
    id: "length",
    name: "Length Converter",
    baseUnit: "meter",
    icon: Ruler,
    tags: ["mm", "cm", "m", "km", "mi"],
    units: 9,
  },
  {
    id: "area",
    name: "Area Converter",
    baseUnit: "square meter",
    icon: Square,
    tags: ["m²", "km²", "acre", "ft²"],
    units: 7,
    isNew: true,
  },
  {
    id: "volume",
    name: "Volume Converter",
    baseUnit: "liter",
    icon: Box,
    tags: ["ml", "L", "gal", "m³"],
    units: 8,
  },
  {
    id: "temperature",
    name: "Temperature Converter",
    baseUnit: "celsius",
    icon: Thermometer,
    tags: ["°C", "°F", "K", "°R"],
    units: 5,
    isNew: true,
  },
  {
    id: "time",
    name: "Time Converter",
    baseUnit: "second",
    icon: Clock,
    tags: ["ms", "s", "min", "hr"],
    units: 9,
  },
  {
    id: "digital",
    name: "Digital Converter",
    baseUnit: "byte",
    icon: Binary,
    tags: ["KB", "MB", "GB", "TB"],
    units: 6,
  },
  {
    id: "speed",
    name: "Speed Converter",
    baseUnit: "meter per second",
    icon: Gauge,
    tags: ["m/s", "km/h", "mph", "knot"],
    units: 5,
  },
  {
    id: "pressure",
    name: "Pressure Converter",
    baseUnit: "pascal",
    icon: Barcode,
    tags: ["Pa", "kPa", "bar", "psi"],
    units: 5,
  },
  {
    id: "energy",
    name: "Energy Converter",
    baseUnit: "joule",
    icon: Zap,
    tags: ["J", "kJ", "cal", "kWh"],
    units: 6,
  },
  {
    id: "parts-per",
    name: "Parts Per Converter",
    baseUnit: "parts per million",
    icon: Percent,
    tags: ["ppm", "ppb", "ppt", "%"],
    units: 5,
  },
  {
    id: "pace",
    name: "Pace Converter",
    baseUnit: "minute per kilometer",
    icon: Timer,
    tags: ["min/km", "min/mi", "s/100m", "s/yd"],
    units: 4,
  },
  {
    id: "current",
    name: "Electric Current Converter",
    baseUnit: "ampere",
    icon: Cable,
    tags: ["A", "mA", "μA"],
    units: 4,
  },
  {
    id: "voltage",
    name: "Voltage Converter",
    baseUnit: "volt",
    icon: Plug,
    tags: ["V", "mV", "kV"],
    units: 4,
  },
  {
    id: "power",
    name: "Power Converter",
    baseUnit: "watt",
    icon: Power,
    tags: ["W", "kW", "hp", "MW"],
    units: 7,
  },
  {
    id: "reactive-power",
    name: "Reactive Power Converter",
    baseUnit: "volt-ampere-reactive",
    icon: Activity,
    tags: ["VAR", "kVAR", "MVAR"],
    units: 5,
  },
  {
    id: "apparent-power",
    name: "Apparent Power Converter",
    baseUnit: "volt-ampere",
    icon: Wind,
    tags: ["VA", "kVA", "MVA"],
    units: 5,
  },
  {
    id: "reactive-energy",
    name: "Reactive Energy Converter",
    baseUnit: "volt-ampere-reactive hour",
    icon: Lightbulb,
    tags: ["VARh", "kVARh", "MVARh"],
    units: 5,
  },
  {
    id: "flow-rate",
    name: "Volume Flow Rate Converter",
    baseUnit: "cubic meter per second",
    icon: Waves,
    tags: ["m³/s", "L/s", "gpm", "cfm"],
    units: 8,
  },
  {
    id: "illuminance",
    name: "Illuminance Converter",
    baseUnit: "lux",
    icon: Lightbulb,
    tags: ["lux", "fc", "phot"],
    units: 4,
  },
  {
    id: "frequency",
    name: "Frequency Converter",
    baseUnit: "hertz",
    icon: Activity,
    tags: ["Hz", "kHz", "MHz", "GHz"],
    units: 6,
  },
  {
    id: "angle",
    name: "Angle Converter",
    baseUnit: "degree",
    icon: Compass,
    tags: ["°", "rad", "grad"],
    units: 4,
  },
  {
    id: "force",
    name: "Force Converter",
    baseUnit: "newton",
    icon: Weight,
    tags: ["N", "kN", "lbf"],
    units: 4,
  },
  {
    id: "torque",
    name: "Torque Converter",
    baseUnit: "newton meter",
    icon: Rocket,
    tags: ["N·m", "lb·ft", "kg·cm"],
    units: 4,
  },
  {
    id: "density",
    name: "Density Converter",
    baseUnit: "kilogram per cubic meter",
    icon: Box,
    tags: ["kg/m³", "g/cm³", "lb/ft³"],
    units: 4,
  },
  {
    id: "acceleration",
    name: "Acceleration Converter",
    baseUnit: "meter per second squared",
    icon: Gauge,
    tags: ["m/s²", "g", "ft/s²"],
    units: 4,
  },
  {
    id: "fuel-economy",
    name: "Fuel Economy Converter",
    baseUnit: "kilometers per liter",
    icon: Fuel,
    tags: ["km/L", "mpg", "L/100km"],
    units: 4,
  },
  {
    id: "data-rate",
    name: "Data Transfer Rate Converter",
    baseUnit: "bits per second",
    icon: HardDrive,
    tags: ["bps", "Mbps", "Gbps"],
    units: 6,
  },
  {
    id: "resolution",
    name: "Resolution Converter",
    baseUnit: "dots per inch",
    icon: Monitor,
    tags: ["dpi", "ppi", "lpi"],
    units: 4,
  },
]

export function ConvertersGrid() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/converters#${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary md:text-3xl">Choose Your Converter</h2>
          <p className="mt-2 text-muted-foreground">
            Select from our comprehensive collection of unit converters
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {converters.map((converter) => {
            const Icon = converter.icon
            return (
              <Link
                key={converter.id}
                href={`/converters#${converter.id}`}
                className="group relative block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              >
                {/* Copy Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    copyLink(converter.id)
                  }}
                  className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                  aria-label="Copy link"
                >
                  <Copy className={cn("h-4 w-4", copiedId === converter.id && "text-accent")} />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{converter.name}</h3>
                      {converter.isNew && (
                        <Badge className="bg-accent/20 text-xs text-accent">+1 more</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      base unit: {converter.baseUnit}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {converter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{converter.units} units</span>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
