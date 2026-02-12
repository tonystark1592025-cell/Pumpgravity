"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Check, ChevronUp, ChevronDown, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { categories, converters } from "@/lib/converters-data"

// Rounding function to avoid floating point errors
function newRound(num: number, keta: number = 6): number {
  const shift = Math.pow(10, keta)
  return Math.round(num * shift) / shift
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
    const numericRegex = /^-?(\d+\.?\d*|\.\d+)$/
    
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

export default function CategoryConverterPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const category = params.category as string

  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")
  const [copied, setCopied] = useState(false)
  const [showAllResults, setShowAllResults] = useState(false)
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const filteredConverters = category === "all" 
    ? converters 
    : converters.filter(c => c.category === category)

  const allUnits = filteredConverters.flatMap(c => c.units)
  const uniqueUnits = Array.from(new Map(allUnits.map(u => [u.value, u])).values())

  const currentConverter = filteredConverters.find(c => 
    c.units.some(u => u.value === fromUnit) && c.units.some(u => u.value === toUnit)
  )

  const categoryInfo = categories.find(c => c.id === category)

  // Handle URL hash for pre-selected units (e.g., #mcg-mg) - ONLY ON INITIAL LOAD
  useEffect(() => {
    if (initialized || uniqueUnits.length === 0) return
    
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash && hash.includes('-')) {
        const [from, to] = hash.split('-')
        const fromExists = uniqueUnits.find(u => u.value === from)
        const toExists = uniqueUnits.find(u => u.value === to)
        if (fromExists && toExists) {
          setFromUnit(from)
          setToUnit(to)
          setInitialized(true)
          return
        }
      }
      
      // Initialize with default units
      setFromUnit(uniqueUnits[0].value)
      setToUnit(uniqueUnits[1]?.value || uniqueUnits[0].value)
      setInitialized(true)
    }
  }, [uniqueUnits, initialized])

  // Redirect if category doesn't exist
  if (!categoryInfo) {
    router.push('/converters')
    return null
  }

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number
    switch (from) {
      case "C": celsius = value; break
      case "F": celsius = (value - 32) * (5 / 9); break
      case "K": celsius = value - 273.15; break
      case "R": celsius = (value - 491.67) * (5 / 9); break
      default: celsius = value
    }
    switch (to) {
      case "C": return celsius
      case "F": return celsius * (9 / 5) + 32
      case "K": return celsius + 273.15
      case "R": return (celsius + 273.15) * (9 / 5)
      default: return celsius
    }
  }

  const convert = (): string => {
    const value = parseFloat(fromValue)
    if (isNaN(value)) return "0"

    if (currentConverter?.formula === "special") {
      const result = convertTemperature(value, fromUnit, toUnit)
      return newRound(result, 4).toString()
    }

    const from = allUnits.find((u) => u.value === fromUnit)
    const to = allUnits.find((u) => u.value === toUnit)
    if (!from || !to) return "0"
    const baseValue = value * from.factor
    const result = baseValue / to.factor
    return newRound(result, result < 0.01 ? 6 : 4).toString()
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
    toast({ title: "Copied to clipboard!", description: result })
  }

  const copyUnitResultWithFormat = (value: string, unit: string) => {
    const result = `${fromValue} ${fromUnit} = ${value} ${unit}`
    navigator.clipboard.writeText(result)
    setCopiedUnit(unit)
    setTimeout(() => setCopiedUnit(null), 2000)
    toast({ title: "Copied to clipboard!", description: result })
  }

  const convertToAllUnits = () => {
    const inputValue = parseFloat(fromValue) || 0
    const fromUnitData = allUnits.find((u) => u.value === fromUnit)
    if (!fromUnitData) return []

    return uniqueUnits.map((unit) => {
      let convertedValue: string
      
      if (currentConverter?.formula === "special") {
        const result = convertTemperature(inputValue, fromUnit, unit.value)
        convertedValue = newRound(result, 4).toString()
      } else {
        const baseValue = inputValue * fromUnitData.factor
        const result = baseValue / unit.factor
        convertedValue = newRound(result, result < 0.01 ? 6 : 4).toString()
      }

      return { unit: unit.value, label: unit.label, value: convertedValue }
    })
  }

  const fromUnitLabel = allUnits.find((u) => u.value === fromUnit)?.label
  const toUnitLabel = allUnits.find((u) => u.value === toUnit)?.label

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/converters">
              <Button variant="outline" className="text-sm">
                ← Back to Categories
              </Button>
            </Link>
          </div>

          <section className="bg-background py-12 lg:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 shadow-xl shadow-primary/5 sm:p-8">
                <div className="mb-4 text-left">
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {categoryInfo?.name} Converter
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{categoryInfo?.description}</p>
                </div>

                {/* About Section */}
                {filteredConverters.length === 1 && (
                  <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">About {filteredConverters[0].name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {filteredConverters[0].about}
                    </p>
                  </div>
                )}

                {category === "all" && (
                  <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">About Unit Converter</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Our comprehensive unit converter supports conversions across multiple categories including mass, length, area, volume, temperature, time, speed, pressure, energy, power, digital storage, electrical units, mechanical properties, flow rates, and light measurements. Simply select your units and get instant, accurate conversions.
                    </p>
                  </div>
                )}

                {/* Info Banner */}
                <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                  Select units from the dropdowns to convert between different measurements.
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
                  <div className="flex flex-1 gap-3">
                    <NumberInput value={fromValue} onChange={setFromValue} className="flex-1" />
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger className="!h-14 w-36 border border-border bg-secondary text-lg font-medium text-foreground sm:w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card text-foreground max-h-80">
                        {uniqueUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value} - {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={switchValues}
                      className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="hidden lg:flex justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={switchValues}
                      className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex flex-1 gap-3">
                    <NumberInput value={convert()} onChange={() => {}} readOnly className="flex-[2]" />
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger className="!h-14 w-36 border border-border bg-secondary text-lg font-medium text-foreground sm:w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card text-foreground max-h-80">
                        {uniqueUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value} - {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyResultWithFormat}
                      className="h-14 w-14 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {copied ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
                    </Button>
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
                              <div className="text-xs text-muted-foreground mt-1">{result.label}</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyUnitResultWithFormat(result.value, result.unit)}
                              className="h-8 w-16 text-xs"
                            >
                              {copiedUnit === result.unit ? <Check className="h-3 w-3 text-accent" /> : "Copy"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
