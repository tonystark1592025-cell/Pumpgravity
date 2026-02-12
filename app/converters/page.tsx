"use client"

import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, Copy, Check, Search, Sparkles, ChevronUp, ChevronDown, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "All Categories" },
  { id: "mass", name: "Mass" },
  { id: "length", name: "Length" },
  { id: "area", name: "Area" },
  { id: "volume", name: "Volume" },
  { id: "temperature", name: "Temperature" },
  { id: "time", name: "Time" },
  { id: "speed", name: "Speed" },
  { id: "pressure", name: "Pressure" },
  { id: "energy", name: "Energy" },
  { id: "power", name: "Power" },
  { id: "digital", name: "Digital" },
  { id: "electrical", name: "Electrical" },
  { id: "mechanics", name: "Mechanics" },
  { id: "flow", name: "Flow & Rate" },
  { id: "light", name: "Light & Optics" },
  { id: "other", name: "Other" },
]

interface UnitConfig {
  value: string
  label: string
  factor: number
}

interface ConverterConfig {
  id: string
  name: string
  category: string
  units: UnitConfig[]
  baseUnit: string
  formula?: string
  tags?: string[]
  keywords?: string[]
}

interface NumberInputProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
}

function NumberInput({ value, onChange, readOnly = false, className }: NumberInputProps) {
  const increment = () => {
    const num = parseFloat(value) || 0
    onChange((num + 1).toString())
  }

  const decrement = () => {
    const num = parseFloat(value) || 0
    onChange(Math.max(0, num - 1).toString())
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="h-10 w-full rounded-md border border-border bg-secondary px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {!readOnly && (
        <div className="absolute right-1 flex flex-col">
          <button
            type="button"
            onClick={increment}
            className="flex h-4 w-7 items-center justify-center rounded-t border border-border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="flex h-4 w-7 items-center justify-center rounded-b border border-t-0 border-border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

const converters: ConverterConfig[] = [
  {
    id: "mass",
    name: "Mass Converter",
    category: "mass",
    baseUnit: "gram",
    tags: ["mg", "g", "kg", "lb", "oz", "ton"],
    keywords: ["weight", "mass", "kilogram", "pound", "gram", "ounce", "metric", "imperial"],
    units: [
      { value: "mcg", label: "Microgram", factor: 0.000001 },
      { value: "mg", label: "Milligram", factor: 0.001 },
      { value: "g", label: "Gram", factor: 1 },
      { value: "kg", label: "Kilogram", factor: 1000 },
      { value: "lb", label: "Pound", factor: 453.592 },
      { value: "oz", label: "Ounce", factor: 28.3495 },
      { value: "ton", label: "Metric Ton", factor: 1000000 },
    ],
  },
  {
    id: "length",
    name: "Length Converter",
    category: "length",
    baseUnit: "meter",
    tags: ["mm", "cm", "m", "km", "in", "ft", "mi"],
    keywords: ["distance", "length", "height", "width", "meter", "foot", "inch", "mile", "kilometer"],
    units: [
      { value: "mm", label: "Millimeter", factor: 0.001 },
      { value: "cm", label: "Centimeter", factor: 0.01 },
      { value: "m", label: "Meter", factor: 1 },
      { value: "km", label: "Kilometer", factor: 1000 },
      { value: "in", label: "Inch", factor: 0.0254 },
      { value: "ft", label: "Foot", factor: 0.3048 },
      { value: "yd", label: "Yard", factor: 0.9144 },
      { value: "mi", label: "Mile", factor: 1609.34 },
      { value: "nmi", label: "Nautical Mile", factor: 1852 },
    ],
  },
  {
    id: "area",
    name: "Area Converter",
    category: "area",
    baseUnit: "square meter",
    tags: ["m²", "km²", "acre", "ft²", "ha"],
    keywords: ["area", "surface", "square", "acre", "hectare", "land", "property"],
    units: [
      { value: "mm²", label: "Square Millimeter", factor: 0.000001 },
      { value: "cm²", label: "Square Centimeter", factor: 0.0001 },
      { value: "m²", label: "Square Meter", factor: 1 },
      { value: "km²", label: "Square Kilometer", factor: 1000000 },
      { value: "acre", label: "Acre", factor: 4046.86 },
      { value: "ha", label: "Hectare", factor: 10000 },
      { value: "ft²", label: "Square Foot", factor: 0.092903 },
    ],
  },
  {
    id: "volume",
    name: "Volume Converter",
    category: "volume",
    baseUnit: "liter",
    tags: ["ml", "L", "gal", "m³", "cup", "qt"],
    keywords: ["volume", "capacity", "liquid", "fluid", "liter", "gallon", "cup", "quart"],
    units: [
      { value: "ml", label: "Milliliter", factor: 0.001 },
      { value: "L", label: "Liter", factor: 1 },
      { value: "m³", label: "Cubic Meter", factor: 1000 },
      { value: "gal", label: "Gallon (US)", factor: 3.78541 },
      { value: "qt", label: "Quart", factor: 0.946353 },
      { value: "pt", label: "Pint", factor: 0.473176 },
      { value: "cup", label: "Cup", factor: 0.236588 },
      { value: "fl oz", label: "Fluid Ounce", factor: 0.0295735 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature Converter",
    category: "temperature",
    baseUnit: "celsius",
    formula: "special",
    tags: ["°C", "°F", "K", "°R"],
    keywords: ["temperature", "heat", "cold", "celsius", "fahrenheit", "kelvin", "rankine", "weather"],
    units: [
      { value: "C", label: "Celsius", factor: 1 },
      { value: "F", label: "Fahrenheit", factor: 1 },
      { value: "K", label: "Kelvin", factor: 1 },
      { value: "R", label: "Rankine", factor: 1 },
    ],
  },
  {
    id: "time",
    name: "Time Converter",
    category: "time",
    baseUnit: "second",
    tags: ["ms", "s", "min", "hr", "day", "week", "year"],
    keywords: ["time", "duration", "period", "second", "minute", "hour", "day", "week", "month", "year"],
    units: [
      { value: "ms", label: "Millisecond", factor: 0.001 },
      { value: "s", label: "Second", factor: 1 },
      { value: "min", label: "Minute", factor: 60 },
      { value: "hr", label: "Hour", factor: 3600 },
      { value: "day", label: "Day", factor: 86400 },
      { value: "week", label: "Week", factor: 604800 },
      { value: "month", label: "Month", factor: 2628000 },
      { value: "year", label: "Year", factor: 31536000 },
      { value: "decade", label: "Decade", factor: 315360000 },
    ],
  },
  {
    id: "digital",
    name: "Digital Converter",
    category: "digital",
    baseUnit: "byte",
    tags: ["KB", "MB", "GB", "TB", "bit", "byte"],
    keywords: ["digital", "storage", "memory", "data", "file", "size", "computer", "byte", "bit"],
    units: [
      { value: "bit", label: "Bit", factor: 0.125 },
      { value: "B", label: "Byte", factor: 1 },
      { value: "KB", label: "Kilobyte", factor: 1024 },
      { value: "MB", label: "Megabyte", factor: 1048576 },
      { value: "GB", label: "Gigabyte", factor: 1073741824 },
      { value: "TB", label: "Terabyte", factor: 1099511627776 },
    ],
  },
  {
    id: "speed",
    name: "Speed Converter",
    category: "speed",
    baseUnit: "meter per second",
    tags: ["m/s", "km/h", "mph", "knot"],
    keywords: ["speed", "velocity", "fast", "slow", "car", "vehicle", "wind", "travel"],
    units: [
      { value: "m/s", label: "Meters per Second", factor: 1 },
      { value: "km/h", label: "Kilometers per Hour", factor: 0.277778 },
      { value: "mph", label: "Miles per Hour", factor: 0.44704 },
      { value: "knot", label: "Knot", factor: 0.514444 },
      { value: "ft/s", label: "Feet per Second", factor: 0.3048 },
    ],
  },
  {
    id: "pressure",
    name: "Pressure Converter",
    category: "pressure",
    baseUnit: "pascal",
    tags: ["Pa", "kPa", "bar", "psi", "atm"],
    keywords: ["pressure", "force", "atmospheric", "tire", "weather", "pascal", "bar"],
    units: [
      { value: "Pa", label: "Pascal", factor: 1 },
      { value: "kPa", label: "Kilopascal", factor: 1000 },
      { value: "bar", label: "Bar", factor: 100000 },
      { value: "psi", label: "PSI", factor: 6894.76 },
      { value: "atm", label: "Atmosphere", factor: 101325 },
    ],
  },
  {
    id: "energy",
    name: "Energy Converter",
    category: "energy",
    baseUnit: "joule",
    tags: ["J", "kJ", "cal", "kWh", "Wh"],
    keywords: ["energy", "power", "electricity", "calorie", "joule", "watt", "battery"],
    units: [
      { value: "J", label: "Joule", factor: 1 },
      { value: "kJ", label: "Kilojoule", factor: 1000 },
      { value: "cal", label: "Calorie", factor: 4.184 },
      { value: "kcal", label: "Kilocalorie", factor: 4184 },
      { value: "Wh", label: "Watt Hour", factor: 3600 },
      { value: "kWh", label: "Kilowatt Hour", factor: 3600000 },
    ],
  },
  {
    id: "power",
    name: "Power Converter",
    category: "power",
    baseUnit: "watt",
    tags: ["W", "kW", "MW", "hp", "BTU/h"],
    keywords: ["power", "electricity", "watt", "horsepower", "engine", "motor", "electrical"],
    units: [
      { value: "W", label: "Watt", factor: 1 },
      { value: "kW", label: "Kilowatt", factor: 1000 },
      { value: "MW", label: "Megawatt", factor: 1000000 },
      { value: "hp", label: "Horsepower", factor: 745.7 },
      { value: "BTU/h", label: "BTU per Hour", factor: 0.293071 },
    ],
  },
  {
    id: "parts-per",
    name: "Parts Per Converter",
    category: "other",
    baseUnit: "parts per million",
    tags: ["ppm", "ppb", "ppt", "%", "‰"],
    keywords: ["concentration", "ratio", "percentage", "parts", "million", "billion", "pollution"],
    units: [
      { value: "%", label: "Percent", factor: 10000 },
      { value: "‰", label: "Per Mille", factor: 1000 },
      { value: "ppm", label: "Parts per Million", factor: 1 },
      { value: "ppb", label: "Parts per Billion", factor: 0.001 },
      { value: "ppt", label: "Parts per Trillion", factor: 0.000001 },
    ],
  },
  {
    id: "pace",
    name: "Pace Converter",
    category: "speed",
    baseUnit: "minute per kilometer",
    tags: ["min/km", "min/mi", "s/100m"],
    keywords: ["pace", "running", "jogging", "marathon", "race", "athletics", "sports"],
    units: [
      { value: "min/km", label: "Minutes per Kilometer", factor: 1 },
      { value: "min/mi", label: "Minutes per Mile", factor: 0.621371 },
      { value: "s/100m", label: "Seconds per 100 Meters", factor: 0.1 },
      { value: "s/yd", label: "Seconds per Yard", factor: 0.0009144 },
    ],
  },
  {
    id: "current",
    name: "Electric Current Converter",
    category: "electrical",
    baseUnit: "ampere",
    tags: ["A", "mA", "μA", "kA"],
    keywords: ["current", "electricity", "ampere", "amp", "electrical", "circuit", "wire"],
    units: [
      { value: "μA", label: "Microampere", factor: 0.000001 },
      { value: "mA", label: "Milliampere", factor: 0.001 },
      { value: "A", label: "Ampere", factor: 1 },
      { value: "kA", label: "Kiloampere", factor: 1000 },
    ],
  },
  {
    id: "voltage",
    name: "Voltage Converter",
    category: "electrical",
    baseUnit: "volt",
    tags: ["V", "mV", "kV", "μV"],
    keywords: ["voltage", "volt", "electricity", "electrical", "potential", "battery", "power"],
    units: [
      { value: "μV", label: "Microvolt", factor: 0.000001 },
      { value: "mV", label: "Millivolt", factor: 0.001 },
      { value: "V", label: "Volt", factor: 1 },
      { value: "kV", label: "Kilovolt", factor: 1000 },
    ],
  },
  {
    id: "reactive-power",
    name: "Reactive Power Converter",
    category: "electrical",
    baseUnit: "volt-ampere-reactive",
    tags: ["VAR", "kVAR", "MVAR"],
    keywords: ["reactive", "power", "electrical", "AC", "alternating", "current"],
    units: [
      { value: "VAR", label: "Volt-Ampere Reactive", factor: 1 },
      { value: "kVAR", label: "Kilovolt-Ampere Reactive", factor: 1000 },
      { value: "MVAR", label: "Megavolt-Ampere Reactive", factor: 1000000 },
    ],
  },
  {
    id: "apparent-power",
    name: "Apparent Power Converter",
    category: "electrical",
    baseUnit: "volt-ampere",
    tags: ["VA", "kVA", "MVA"],
    keywords: ["apparent", "power", "electrical", "AC", "alternating", "current"],
    units: [
      { value: "VA", label: "Volt-Ampere", factor: 1 },
      { value: "kVA", label: "Kilovolt-Ampere", factor: 1000 },
      { value: "MVA", label: "Megavolt-Ampere", factor: 1000000 },
    ],
  },
  {
    id: "reactive-energy",
    name: "Reactive Energy Converter",
    category: "electrical",
    baseUnit: "volt-ampere-reactive hour",
    tags: ["VARh", "kVARh", "MVARh"],
    keywords: ["reactive", "energy", "electrical", "AC", "alternating", "current"],
    units: [
      { value: "VARh", label: "Volt-Ampere Reactive Hour", factor: 1 },
      { value: "kVARh", label: "Kilovolt-Ampere Reactive Hour", factor: 1000 },
      { value: "MVARh", label: "Megavolt-Ampere Reactive Hour", factor: 1000000 },
    ],
  },
  {
    id: "flow-rate",
    name: "Volume Flow Rate Converter",
    category: "flow",
    baseUnit: "cubic meter per second",
    tags: ["m³/s", "L/s", "gpm", "cfm"],
    keywords: ["flow", "rate", "volume", "liquid", "gas", "pipe", "pump", "water"],
    units: [
      { value: "m³/s", label: "Cubic Meters per Second", factor: 1 },
      { value: "L/s", label: "Liters per Second", factor: 0.001 },
      { value: "L/min", label: "Liters per Minute", factor: 0.0000166667 },
      { value: "gpm", label: "Gallons per Minute", factor: 0.0000630902 },
      { value: "cfm", label: "Cubic Feet per Minute", factor: 0.000471947 },
    ],
  },
  {
    id: "illuminance",
    name: "Illuminance Converter",
    category: "light",
    baseUnit: "lux",
    tags: ["lux", "fc", "phot"],
    keywords: ["light", "illuminance", "brightness", "lux", "foot-candle", "lighting"],
    units: [
      { value: "lux", label: "Lux", factor: 1 },
      { value: "fc", label: "Foot-candle", factor: 10.764 },
      { value: "phot", label: "Phot", factor: 10000 },
    ],
  },
  {
    id: "frequency",
    name: "Frequency Converter",
    category: "other",
    baseUnit: "hertz",
    tags: ["Hz", "kHz", "MHz", "GHz"],
    keywords: ["frequency", "hertz", "radio", "sound", "wave", "oscillation", "vibration"],
    units: [
      { value: "Hz", label: "Hertz", factor: 1 },
      { value: "kHz", label: "Kilohertz", factor: 1000 },
      { value: "MHz", label: "Megahertz", factor: 1000000 },
      { value: "GHz", label: "Gigahertz", factor: 1000000000 },
    ],
  },
  {
    id: "angle",
    name: "Angle Converter",
    category: "other",
    baseUnit: "degree",
    tags: ["°", "rad", "grad", "turn"],
    keywords: ["angle", "degree", "radian", "rotation", "circle", "geometry", "math"],
    units: [
      { value: "°", label: "Degree", factor: 1 },
      { value: "rad", label: "Radian", factor: 57.2958 },
      { value: "grad", label: "Gradian", factor: 0.9 },
      { value: "turn", label: "Turn", factor: 0.00277778 },
    ],
  },
  {
    id: "force",
    name: "Force Converter",
    category: "mechanics",
    baseUnit: "newton",
    tags: ["N", "kN", "lbf", "kgf"],
    keywords: ["force", "newton", "pound", "push", "pull", "physics", "mechanics"],
    units: [
      { value: "N", label: "Newton", factor: 1 },
      { value: "kN", label: "Kilonewton", factor: 1000 },
      { value: "lbf", label: "Pound-force", factor: 4.44822 },
      { value: "kgf", label: "Kilogram-force", factor: 9.80665 },
    ],
  },
  {
    id: "torque",
    name: "Torque Converter",
    category: "mechanics",
    baseUnit: "newton meter",
    tags: ["N·m", "lb·ft", "kg·cm"],
    keywords: ["torque", "twist", "rotation", "wrench", "bolt", "engine", "mechanics"],
    units: [
      { value: "N·m", label: "Newton Meter", factor: 1 },
      { value: "lb·ft", label: "Pound-foot", factor: 1.35582 },
      { value: "kg·cm", label: "Kilogram Centimeter", factor: 0.0980665 },
      { value: "oz·in", label: "Ounce-inch", factor: 0.00706155 },
    ],
  },
  {
    id: "density",
    name: "Density Converter",
    category: "mechanics",
    baseUnit: "kilogram per cubic meter",
    tags: ["kg/m³", "g/cm³", "lb/ft³"],
    keywords: ["density", "mass", "volume", "material", "weight", "heavy", "light"],
    units: [
      { value: "kg/m³", label: "Kilogram per Cubic Meter", factor: 1 },
      { value: "g/cm³", label: "Gram per Cubic Centimeter", factor: 1000 },
      { value: "lb/ft³", label: "Pound per Cubic Foot", factor: 16.0185 },
      { value: "lb/in³", label: "Pound per Cubic Inch", factor: 27679.9 },
    ],
  },
  {
    id: "acceleration",
    name: "Acceleration Converter",
    category: "mechanics",
    baseUnit: "meter per second squared",
    tags: ["m/s²", "g", "ft/s²"],
    keywords: ["acceleration", "gravity", "speed", "change", "physics", "motion"],
    units: [
      { value: "m/s²", label: "Meter per Second Squared", factor: 1 },
      { value: "g", label: "Standard Gravity", factor: 9.80665 },
      { value: "ft/s²", label: "Foot per Second Squared", factor: 0.3048 },
      { value: "gal", label: "Gal", factor: 0.01 },
    ],
  },
  {
    id: "fuel-economy",
    name: "Fuel Economy Converter",
    category: "other",
    baseUnit: "kilometers per liter",
    tags: ["km/L", "mpg", "L/100km"],
    keywords: ["fuel", "economy", "gas", "mileage", "car", "vehicle", "efficiency"],
    units: [
      { value: "km/L", label: "Kilometers per Liter", factor: 1 },
      { value: "mpg", label: "Miles per Gallon (US)", factor: 2.35215 },
      { value: "L/100km", label: "Liters per 100 Kilometers", factor: -100 }, // Special case
      { value: "mpg-imp", label: "Miles per Gallon (Imperial)", factor: 2.82481 },
    ],
  },
  {
    id: "data-rate",
    name: "Data Transfer Rate Converter",
    category: "digital",
    baseUnit: "bits per second",
    tags: ["bps", "Mbps", "Gbps", "KBps"],
    keywords: ["data", "transfer", "speed", "internet", "network", "bandwidth", "download"],
    units: [
      { value: "bps", label: "Bits per Second", factor: 1 },
      { value: "kbps", label: "Kilobits per Second", factor: 1000 },
      { value: "Mbps", label: "Megabits per Second", factor: 1000000 },
      { value: "Gbps", label: "Gigabits per Second", factor: 1000000000 },
      { value: "Bps", label: "Bytes per Second", factor: 8 },
      { value: "KBps", label: "Kilobytes per Second", factor: 8000 },
    ],
  },
  {
    id: "resolution",
    name: "Resolution Converter",
    category: "light",
    baseUnit: "dots per inch",
    tags: ["dpi", "ppi", "lpi", "dpcm"],
    keywords: ["resolution", "print", "screen", "pixel", "dot", "image", "quality"],
    units: [
      { value: "dpi", label: "Dots per Inch", factor: 1 },
      { value: "ppi", label: "Pixels per Inch", factor: 1 },
      { value: "lpi", label: "Lines per Inch", factor: 1 },
      { value: "dpcm", label: "Dots per Centimeter", factor: 0.393701 },
    ],
  },
]

function ConverterCard({ converter }: { converter: ConverterConfig }) {
  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState(converter.units[0].value)
  const [toUnit, setToUnit] = useState(converter.units[1].value)
  const [copied, setCopied] = useState(false)

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number

    switch (from) {
      case "C":
        celsius = value
        break
      case "F":
        celsius = (value - 32) * (5 / 9)
        break
      case "K":
        celsius = value - 273.15
        break
      case "R":
        celsius = (value - 491.67) * (5 / 9)
        break
      default:
        celsius = value
    }

    switch (to) {
      case "C":
        return celsius
      case "F":
        return celsius * (9 / 5) + 32
      case "K":
        return celsius + 273.15
      case "R":
        return (celsius + 273.15) * (9 / 5)
      default:
        return celsius
    }
  }

  const convert = (): string => {
    const value = parseFloat(fromValue)
    if (isNaN(value)) return "0"

    if (converter.formula === "special") {
      const result = convertTemperature(value, fromUnit, toUnit)
      return result.toFixed(2)
    }

    // Special handling for fuel economy
    if (converter.id === "fuel-economy") {
      return convertFuelEconomy(value, fromUnit, toUnit)
    }

    const from = converter.units.find((u) => u.value === fromUnit)
    const to = converter.units.find((u) => u.value === toUnit)
    if (!from || !to) return "0"
    const baseValue = value * from.factor
    const result = baseValue / to.factor
    return result < 0.01 ? result.toExponential(4) : result.toFixed(4)
  }

  const convertFuelEconomy = (value: number, from: string, to: string): string => {
    let kmPerLiter: number

    // Convert to km/L first
    switch (from) {
      case "km/L":
        kmPerLiter = value
        break
      case "mpg":
        kmPerLiter = value / 2.35215
        break
      case "L/100km":
        kmPerLiter = value === 0 ? 0 : 100 / value
        break
      case "mpg-imp":
        kmPerLiter = value / 2.82481
        break
      default:
        kmPerLiter = value
    }

    // Convert from km/L to target unit
    let result: number
    switch (to) {
      case "km/L":
        result = kmPerLiter
        break
      case "mpg":
        result = kmPerLiter * 2.35215
        break
      case "L/100km":
        result = kmPerLiter === 0 ? 0 : 100 / kmPerLiter
        break
      case "mpg-imp":
        result = kmPerLiter * 2.82481
        break
      default:
        result = kmPerLiter
    }

    return result < 0.01 ? result.toExponential(4) : result.toFixed(4)
  }

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  const copyResult = () => {
    navigator.clipboard.writeText(convert())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      id={converter.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">{converter.name}</h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <NumberInput
            value={fromValue}
            onChange={setFromValue}
            className="flex-1"
          />
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="w-36 border-border bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              {converter.units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            className="border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyResult}
            className="border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <NumberInput
            value={convert()}
            onChange={() => {}}
            readOnly
            className="flex-1"
          />
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="w-36 border-border bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              {converter.units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Base unit: {converter.baseUnit}</p>
    </div>
  )
}

export default function CalculatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)

  // Handle URL search parameters and hash
  useEffect(() => {
    const handleUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const searchParam = urlParams.get('search')
      const hash = window.location.hash.replace('#', '')
      
      if (searchParam) {
        setSearchQuery(searchParam)
      }
      
      if (hash) {
        const converter = converters.find(c => c.id === hash)
        if (converter) {
          setSelectedCategory(converter.category)
        }
      }
    }

    handleUrlParams()
    window.addEventListener('hashchange', handleUrlParams)
    
    return () => {
      window.removeEventListener('hashchange', handleUrlParams)
    }
  }, [])

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(converters, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'category', weight: 0.2 },
        { name: 'baseUnit', weight: 0.1 },
        { name: 'tags', weight: 0.2 },
        { name: 'keywords', weight: 0.1 },
        { name: 'units.value', weight: 0.1 },
        { name: 'units.label', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
    })
  }, [])

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []
    
    const searchResults = fuse.search(searchQuery.trim()).slice(0, 8)
    const suggestionSet = new Set<string>()
    const results: Array<{type: string, text: string, converter?: ConverterConfig}> = []

    // Add converter names
    searchResults.forEach(result => {
      const converter = result.item
      if (!suggestionSet.has(converter.name)) {
        suggestionSet.add(converter.name)
        results.push({
          type: 'converter',
          text: converter.name,
          converter
        })
      }
    })

    // Add matching tags and units
    searchResults.forEach(result => {
      const converter = result.item
      
      // Check tags
      converter.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchQuery.toLowerCase()) && !suggestionSet.has(tag)) {
          suggestionSet.add(tag)
          results.push({
            type: 'tag',
            text: `${tag} (${converter.name})`,
            converter
          })
        }
      })

      // Check units
      converter.units.forEach(unit => {
        if ((unit.value.toLowerCase().includes(searchQuery.toLowerCase()) || 
             unit.label.toLowerCase().includes(searchQuery.toLowerCase())) && 
            !suggestionSet.has(unit.value)) {
          suggestionSet.add(unit.value)
          results.push({
            type: 'unit',
            text: `${unit.value} - ${unit.label}`,
            converter
          })
        }
      })
    })

    return results.slice(0, 6)
  }, [searchQuery, fuse])

  const filteredConverters = useMemo(() => {
    let results = converters

    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery.trim())
      results = searchResults.map(result => result.item)
    }

    if (selectedCategory !== "all") {
      results = results.filter(converter => converter.category === selectedCategory)
    }

    return results
  }, [searchQuery, selectedCategory, fuse])

  const clearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: {type: string, text: string, converter?: ConverterConfig}) => {
    if (suggestion.converter) {
      setSearchQuery(suggestion.converter.name)
      setSelectedCategory(suggestion.converter.category)
      setShowSuggestions(false)
      
      // Scroll to the converter
      setTimeout(() => {
        const element = document.getElementById(suggestion.converter!.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedSuggestion >= 0 && focusedSuggestion < suggestions.length) {
          handleSuggestionClick(suggestions[focusedSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedSuggestion(-1)
        break
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Unit Converters</h1>
            <p className="mt-2 text-muted-foreground">
              Browse our collection of unit converters
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar - Full Width and Prominent */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, tags, or units (e.g., 'kg', 'temperature', 'dpi')..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                    setFocusedSuggestion(-1)
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicks
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-lg border-border bg-secondary pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-border bg-card shadow-xl">
                    <div className="max-h-64 overflow-y-auto py-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.text}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-secondary",
                            index === focusedSuggestion && "bg-secondary"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">{suggestion.text}</span>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              suggestion.type === 'converter' && "bg-primary/20 text-primary",
                              suggestion.type === 'tag' && "bg-accent/20 text-accent",
                              suggestion.type === 'unit' && "bg-muted text-muted-foreground"
                            )}>
                              {suggestion.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground bg-muted/30">
                      Use ↑↓ to navigate, Enter to select, Esc to close
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filteredConverters.length} converter{filteredConverters.length !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </div>
          )}

          {/* AI Suggestion Banner */}
          {/* <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Need a complex conversion?</p>
                  <p className="text-sm text-muted-foreground">
                    Try our AI-powered converter for natural language queries
                  </p>
                </div>
              </div>
              <Link href="/ai-chat">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Try AI Converter
                </Button>
              </Link>
            </div>
          </div> */}

          {/* Converters Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConverters.map((converter) => (
              <ConverterCard key={converter.id} converter={converter} />
            ))}
          </div>

          {filteredConverters.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                {searchQuery 
                  ? `No converters found matching "${searchQuery}"` 
                  : "No converters found matching your criteria"
                }
              </p>
              {searchQuery && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Try searching for:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="rounded bg-secondary px-2 py-1">Unit names (kg, mph, °C)</span>
                    <span className="rounded bg-secondary px-2 py-1">Categories (mass, speed, temperature)</span>
                    <span className="rounded bg-secondary px-2 py-1">Keywords (weight, car, heat)</span>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Clear search and show all converters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
