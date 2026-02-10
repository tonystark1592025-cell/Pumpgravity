"use client"

import { useState, useEffect } from "react"
import { Copy, Check, ChevronUp, ChevronDown, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Rounding function to avoid floating point errors
function newRound(num: number, keta: number = 6): number {
  const shift = Math.pow(10, keta)
  return Math.round(num * shift) / shift
}

const presets = [
  { id: "all", label: "All" },
  { id: "flow", label: "Flow" },
  { id: "gas", label: "Gas" },
  { id: "pressure", label: "Pressure" },
  { id: "temperature", label: "Temperature" },
  { id: "mass", label: "Mass" },
  { id: "length", label: "Length" },
  { id: "volume", label: "Volume" },
]

const unitsByPreset: Record<string, { value: string; label: string; factor: number }[]> = {
  all: [
    { value: "mcg", label: "Microgram", factor: 0.000001 },
    { value: "mg", label: "Milligram", factor: 0.001 },
    { value: "g", label: "Gram", factor: 1 },
    { value: "kg", label: "Kilogram", factor: 1000 },
    { value: "lb", label: "Pound", factor: 453.592 },
    { value: "oz", label: "Ounce", factor: 28.3495 },
  ],
  flow: [
    { value: "m3h", label: "m³/hour", factor: 1 },
    { value: "lh", label: "L/h", factor: 0.001 },
    { value: "lmin", label: "L/min", factor: 0.06 },
    { value: "bblh", label: "BBL/h (US Barrel/h)", factor: 0.158987 },
    { value: "gph", label: "GPH (US Gallon/h)", factor: 0.00378541 },
    { value: "gpm", label: "GPM (US Gallon/min)", factor: 0.227125 },
  ],
  gas: [
    { value: "nm3h", label: "Nm³/h (Normal)", factor: 1 },
    { value: "nm3min", label: "Nm³/min", factor: 60 },
    { value: "m3h_std", label: "m³/h (Standard)", factor: 1.0549 },
    { value: "m3min_std", label: "m³/min", factor: 63.294 },
    { value: "scfh", label: "SCFH", factor: 0.0268391 },
    { value: "scfm", label: "SCFM", factor: 1.61035 },
  ],
  pressure: [
    { value: "mpa", label: "MPa", factor: 1000000 },
    { value: "kpa", label: "kPa", factor: 1000 },
    { value: "pa", label: "Pa", factor: 1 },
    { value: "bar", label: "bar", factor: 100000 },
    { value: "mbar", label: "mbar", factor: 100 },
    { value: "atm", label: "atm", factor: 101325 },
    { value: "kgcm2", label: "kg/cm²", factor: 98066.5 },
    { value: "mmh2o", label: "mmH2O", factor: 9.80665 },
    { value: "mmhg", label: "mmHg", factor: 133.322 },
    { value: "psi", label: "psi", factor: 6894.76 },
  ],
  temperature: [
    { value: "c", label: "Celsius (°C)", factor: 1 },
    { value: "f", label: "Fahrenheit (°F)", factor: 1 },
    { value: "k", label: "Kelvin (K)", factor: 1 },
  ],
  mass: [
    { value: "mcg", label: "Microgram", factor: 0.000001 },
    { value: "mg", label: "Milligram", factor: 0.001 },
    { value: "g", label: "Gram", factor: 1 },
    { value: "kg", label: "Kilogram", factor: 1000 },
    { value: "lb", label: "Pound", factor: 453.592 },
    { value: "oz", label: "Ounce", factor: 28.3495 },
  ],
  length: [
    { value: "mm", label: "Millimeter", factor: 0.001 },
    { value: "cm", label: "Centimeter", factor: 0.01 },
    { value: "m", label: "Meter", factor: 1 },
    { value: "km", label: "Kilometer", factor: 1000 },
    { value: "in", label: "Inch", factor: 0.0254 },
    { value: "ft", label: "Foot", factor: 0.3048 },
  ],
  volume: [
    { value: "ml", label: "Milliliter", factor: 0.001 },
    { value: "l", label: "Liter", factor: 1 },
    { value: "m3", label: "Cubic meter", factor: 1000 },
    { value: "gal", label: "Gallon", factor: 3.78541 },
  ],
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow only numbers, decimal point, and negative sign
    const numericRegex = /^-?(\d+\.?\d*|\.\d+)$/
    
    // Allow empty string or valid numeric input
    if (inputValue === '' || numericRegex.test(inputValue)) {
      onChange(inputValue)
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        readOnly={readOnly}
        className={cn(
          "h-14 w-full rounded-lg border border-border bg-secondary px-4 text-lg font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary",
          readOnly ? "pr-4" : "pr-12"
        )}
      />
      {!readOnly && (
        <div className="absolute right-2 flex flex-col">
          <button
            type="button"
            onClick={increment}
            className="flex h-5 w-8 items-center justify-center rounded-t border border-border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="flex h-5 w-8 items-center justify-center rounded-b border border-t-0 border-border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ConverterWidget() {
  const [activePreset, setActivePreset] = useState("all")
  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("g")
  const [toUnit, setToUnit] = useState("kg")
  const [copied, setCopied] = useState(false)
  const [showAllResults, setShowAllResults] = useState(false)
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null)
  const { toast } = useToast()

  const units = unitsByPreset[activePreset] || unitsByPreset.all

  const convert = () => {
    if (activePreset === "temperature") {
      return convertTemperature()
    }
    const from = units.find((u) => u.value === fromUnit)
    const to = units.find((u) => u.value === toUnit)
    if (!from || !to) return "0"
    const baseValue = parseFloat(fromValue) * from.factor
    const result = baseValue / to.factor
    return newRound(result, result < 0.01 ? 6 : 4).toString()
  }

  const convertTemperature = () => {
    const val = parseFloat(fromValue)
    if (isNaN(val)) return "0"
    
    let celsius: number
    if (fromUnit === "c") celsius = val
    else if (fromUnit === "f") celsius = (val - 32) / 1.8
    else celsius = val - 273.15

    let result: number
    if (toUnit === "c") result = celsius
    else if (toUnit === "f") result = (celsius * 1.8) + 32
    else result = celsius + 273.15

    return newRound(result, 4).toString()
  }

  const switchValues = () => {
    const convertedValue = convert()
    setFromValue(convertedValue)
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (convertedValue && parseFloat(convertedValue) > 0) {
      setShowAllResults(true)
    }
  }

  const copyResultWithFormat = () => {
    const result = `${fromValue} ${fromUnit} = ${convert()} ${toUnit}`
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    toast({
      title: "Copied to clipboard!",
      description: result,
    })
  }

  const copyUnitResultWithFormat = (value: string, unit: string, unitLabel: string) => {
    const result = `${fromValue} ${fromUnit} = ${value} ${unit}`
    navigator.clipboard.writeText(result)
    setCopiedUnit(unit)
    setTimeout(() => setCopiedUnit(null), 2000)
    
    toast({
      title: "Copied to clipboard!",
      description: result,
    })
  }

  const convertToAllUnits = () => {
    const inputValue = parseFloat(fromValue) || 0
    const fromUnitData = units.find((u) => u.value === fromUnit)
    if (!fromUnitData) return []

    return units.map((unit) => {
      let convertedValue: string
      
      if (activePreset === "temperature") {
        let celsius: number
        if (fromUnit === "c") celsius = inputValue
        else if (fromUnit === "f") celsius = (inputValue - 32) / 1.8
        else celsius = inputValue - 273.15

        let result: number
        if (unit.value === "c") result = celsius
        else if (unit.value === "f") result = (celsius * 1.8) + 32
        else result = celsius + 273.15
        
        convertedValue = newRound(result, 4).toString()
      } else {
        const baseValue = inputValue * fromUnitData.factor
        const result = baseValue / unit.factor
        convertedValue = newRound(result, result < 0.01 ? 6 : 4).toString()
      }

      return {
        unit: unit.value,
        label: unit.label,
        value: convertedValue
      }
    })
  }

  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId)
    const newUnits = unitsByPreset[presetId] || unitsByPreset.all
    if (presetId === "flow") {
      setFromUnit("m3h")
      setToUnit("lh")
    } else if (presetId === "gas") {
      setFromUnit("nm3h")
      setToUnit("scfh")
    } else if (presetId === "pressure") {
      setFromUnit("bar")
      setToUnit("psi")
    } else if (presetId === "temperature") {
      setFromUnit("c")
      setToUnit("f")
    } else {
      setFromUnit(newUnits[0]?.value || "")
      setToUnit(newUnits[1]?.value || newUnits[0]?.value || "")
    }
  }

  const fromUnitLabel = units.find((u) => u.value === fromUnit)?.label
  const toUnitLabel = units.find((u) => u.value === toUnit)?.label

  // Auto-expand results when conversion parameters change
  useEffect(() => {
    if (fromValue && parseFloat(fromValue) > 0) {
      setShowAllResults(true)
    }
  }, [fromValue, fromUnit, toUnit, activePreset])

  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 shadow-xl shadow-primary/5 sm:p-8">
          {/* Title */}
          <div className="mb-4 text-left">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Quick Converter</h2>
            <p className="mt-1 text-sm text-muted-foreground">Convert between different units instantly</p>
          </div>

          {/* Preset Selector */}
          <div className="mb-6 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activePreset === preset.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            You can also press the arrow so you can select other units that you could convert.
          </div>

          {/* Result Display */}
          <div className="mb-8 rounded-lg border-l-4 border-primary bg-primary/10 p-4">
            <p className="text-lg text-foreground">
              {fromValue} ({fromUnit}) {fromUnitLabel} =
            </p>
            <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
              {convert()}{" "}
              <span className="text-lg font-normal text-primary/80 sm:text-xl">
                ({toUnit}) {toUnitLabel}
              </span>
            </p>
          </div>

          {/* Converter Inputs */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Left Input Group */}
            <div className="flex flex-1 gap-3">
              <NumberInput
                value={fromValue}
                onChange={(value) => {
                  setFromValue(value)
                  if (value && parseFloat(value) > 0) {
                    setShowAllResults(true)
                  }
                }}
                className="flex-1"
              />
              <Select value={fromUnit} onValueChange={(value) => {
                setFromUnit(value)
                if (fromValue && parseFloat(fromValue) > 0) {
                  setShowAllResults(true)
                }
              }}>
                <SelectTrigger className="!h-14 w-36 border border-border bg-secondary text-lg font-medium text-foreground sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.value} - {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Switch values button - shows on mobile after left selector */}
              <Button
                variant="outline"
                size="icon"
                onClick={switchValues}
                className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
                title="Switch values"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop Switch Values Button */}
            <div className="hidden lg:flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={switchValues}
                className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Switch values"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Input Group */}
            <div className="flex flex-1 gap-3">
              <NumberInput
                value={convert()}
                onChange={() => {}}
                readOnly
                className="flex-[2]"
              />
              <Select value={toUnit} onValueChange={(value) => {
                setToUnit(value)
                if (fromValue && parseFloat(fromValue) > 0) {
                  setShowAllResults(true)
                }
              }}>
                <SelectTrigger className="!h-14 w-36 border border-border bg-secondary text-lg font-medium text-foreground sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.value} - {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Copy button - always at the end */}
              <Button
                variant="outline"
                size="icon"
                onClick={copyResultWithFormat}
                className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Copy result"
              >
                {copied ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Input Value Hints - Shows full values when they overflow */}
          <div className="mt-2 flex flex-col gap-1 lg:flex-row lg:gap-4">
            <div className="flex-1">
              {fromValue && fromValue.length > 8 && (
                <p className="text-xs text-muted-foreground truncate">
                  Input: {fromValue} {fromUnit}
                </p>
              )}
            </div>
            <div className="hidden lg:block lg:w-14"></div> {/* Spacer for desktop button */}
            <div className="flex-1">
              {convert() && convert().length > 8 && (
                <p className="text-xs text-muted-foreground truncate">
                  Result: {convert()} {toUnit}
                </p>
              )}
            </div>
          </div>

          {/* Expandable All Results Section */}
          <div className="mt-8">
            <button
              onClick={() => setShowAllResults(!showAllResults)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary"
            >
              <div>
                <h3 className="font-semibold text-foreground">All Conversion Results</h3>
                <p className="text-sm text-muted-foreground">
                  View {fromValue} {fromUnit} converted to all available units
                </p>
              </div>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showAllResults && "rotate-180")} />
            </button>

            {showAllResults && (
              <div className="mt-4 rounded-lg border border-border bg-card">
                <div className="border-b border-border bg-muted/50 px-4 py-3">
                  <h4 className="font-medium text-foreground">Conversion Results</h4>
                  <p className="text-sm text-muted-foreground">
                    {fromValue} {fromUnitLabel} ({fromUnit}) equals:
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {convertToAllUnits().map((result, index) => (
                    <div
                      key={result.unit}
                      className={cn(
                        "flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <div className="flex-1">
                        <div className="text-sm text-foreground">
                          <span className="font-medium">{fromValue} {fromUnit}</span>
                          <span className="text-muted-foreground mx-2">=</span>
                          <span className="font-mono font-semibold text-primary">{result.value}</span>
                          <span className="ml-1 font-medium">{result.unit}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyUnitResultWithFormat(result.value, result.unit, result.label)}
                          className="h-8 w-16 text-xs"
                        >
                          {copiedUnit === result.unit ? (
                            <Check className="h-3 w-3 text-accent" />
                          ) : (
                            "Copy"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-muted/50 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {convertToAllUnits().length} units available
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllResults(false)}
                      className="h-6 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Collapse
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
