"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { formatDisplayNumber } from "@/lib/number-formatter"

// Local constants for units
const massUnits = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lb", label: "lb" },
  { value: "oz", label: "oz" },
]

const volumeUnits = [
  { value: "m3", label: "m³" },
  { value: "cm3", label: "cm³" },
  { value: "l", label: "L" },
  { value: "ft3", label: "ft³" },
  { value: "gal", label: "gal" },
]

const densityUnits = [
  { value: "kgm3", label: "kg/m³" },
  { value: "gcm3", label: "g/cm³" },
  { value: "lbft3", label: "lb/ft³" },
  { value: "kgl", label: "kg/L" },
]

export default function DensityCalculator() {
  const { toast } = useToast()
  const [showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  // Inputs
  const [mass, setMass] = useState<string>("")
  const [massUnit, setMassUnit] = useState<string>("kg")

  const [volume, setVolume] = useState<string>("")
  const [volumeUnit, setVolumeUnit] = useState<string>("m3")
  
  const [resultUnit, setResultUnit] = useState<string>("kgm3")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [massError, setMassError] = useState<string>("")
  const [volumeError, setVolumeError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string // kg/m³
    fullValue: string
    massSI: string // kg
    volumeSI: string // m³
    calculated: boolean
    steps: string[]
  }>({
    value: "",
    valueSI: "",
    fullValue: "",
    massSI: "",
    volumeSI: "",
    calculated: false,
    steps: []
  })

  // Validators
  const validateInput = (value: string, setErr: (msg: string) => void, allowZero: boolean = false) => {
    if (value === "") {
      setErr("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setErr("Invalid number")
    } else if (!allowZero && num === 0) {
      setErr("Cannot be zero")
      if (!allowZero) {
        toast({
          title: "Invalid Input",
          description: "Value cannot be zero.",
          variant: "destructive",
        })
      }
    } else if (num < 0) {
      setErr("Must be positive")
    } else {
      setErr("")
    }
  }

  const handleMassChange = (value: string) => {
    setMass(value)
    validateInput(value, setMassError, true) // Mass can theoretically be 0 (empty space)
    resetCalculation()
  }

  const handleVolumeChange = (value: string) => {
    setVolume(value)
    validateInput(value, setVolumeError, false) // Volume cannot be 0 for density calc
    resetCalculation()
  }

  const copyResult = () => {
    const displayValue = parseFloat(result.fullValue).toFixed(4)
    const resultText = `${displayValue} ${densityUnits.find(u => u.value === resultUnit)?.label}`
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: resultText,
    })
  }

  const resetCalculation = () => {
    if (result.calculated) {
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        massSI: "",
        volumeSI: "",
        calculated: false,
        steps: []
      })
      toast({
        title: "Input Modified",
        description: "Please click Calculate again to see updated results.",
        variant: "default",
      })
    }
  }

  // --- CONVERSION LOGIC ---
  
  // Convert Mass to kg (SI Base)
  const toKg = (val: number, unit: string) => {
    switch (unit) {
      case "g": return val / 1000
      case "lb": return val * 0.453592
      case "oz": return val * 0.0283495
      case "kg": return val
      default: return val
    }
  }

  // Convert Volume to m³ (SI Base)
  const toM3 = (val: number, unit: string) => {
    switch (unit) {
      case "cm3": return val / 1000000
      case "l": return val / 1000
      case "ft3": return val * 0.0283168
      case "gal": return val * 0.00378541
      case "m3": return val
      default: return val
    }
  }

  // Convert Density from kg/m³ (SI Base) to Target Unit
  const fromKgM3 = (val: number, unit: string) => {
    switch (unit) {
      case "gcm3": return val / 1000
      case "lbft3": return val * 0.062428
      case "kgl": return val / 1000
      case "kgm3": return val
      default: return val
    }
  }

  const handleCalculate = () => {
    const massInput = mass ? parseFloat(mass) : null
    const volInput = volume ? parseFloat(volume) : null

    if (massError || volumeError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors.",
        variant: "destructive",
      })
      return
    }

    if (massInput === null || volInput === null) {
      setResult({ ...result, calculated: false, steps: ["Please enter all required values"] })
      return
    }

    if (volInput === 0) {
       toast({
        title: "Math Error",
        description: "Volume cannot be zero (division by zero).",
        variant: "destructive",
      })
      return
    }

    // Step 1: Convert to SI Base Units
    const m_SI = toKg(massInput, massUnit) // kg
    const v_SI = toM3(volInput, volumeUnit) // m³

    // Step 2: Calculate Density (ρ = m / V) -> Result is in kg/m³
    const rho_SI = m_SI / v_SI

    // Step 3: Convert to User Selected Unit
    const finalValue = fromKgM3(rho_SI, resultUnit)

    const mLabel = massUnits.find(u => u.value === massUnit)?.label
    const vLabel = volumeUnits.find(u => u.value === volumeUnit)?.label
    const resLabel = densityUnits.find(u => u.value === resultUnit)?.label

    const steps = [
      `Step 1: Convert inputs to SI base units`,
      `  m = ${massInput} ${mLabel} = ${formatDisplayNumber(m_SI.toString())} kg`,
      `  V = ${volInput} ${vLabel} = ${formatDisplayNumber(v_SI.toString())} m³`,
      ``,
      `Step 2: Calculate Density (ρ = m / V)`,
      `  ρ = ${formatDisplayNumber(m_SI.toString())} / ${formatDisplayNumber(v_SI.toString())}`,
      `  ρ = ${formatDisplayNumber(rho_SI.toString())} kg/m³`,
      ...(resultUnit !== 'kgm3' ? [
        ``,
        `Step 3: Convert to ${resLabel}`,
        `  ρ = ${formatDisplayNumber(rho_SI.toString())} kg/m³ = ${formatDisplayNumber(finalValue.toString())} ${resLabel}`
      ] : [])
    ]

    setResult({
      value: formatDisplayNumber(finalValue.toString()),
      valueSI: formatDisplayNumber(rho_SI.toString()),
      fullValue: finalValue.toString(),
      massSI: formatDisplayNumber(m_SI.toString()),
      volumeSI: formatDisplayNumber(v_SI.toString()),
      calculated: true,
      steps
    })

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-3 md:p-6 font-sans text-foreground flex flex-col items-center">
      
      <div className="text-center mb-5">
        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          World-Class Engineering Tool for Professionals
        </p>
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">
          Density Calculator <span className="text-muted-foreground text-lg">(By Mass/Volume Method)</span>
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Mass/Volume Method - Calculate Density
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full h-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-border">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Inputs & Parameters</h2>
          </div>

          <div className="p-4 space-y-3.5 flex flex-col flex-1">
            
            {/* Mass Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Mass (m):</label>
                <input
                  type="number"
                  value={mass}
                  onChange={e => handleMassChange(e.target.value)}
                  placeholder="100"
                  className={`flex-1 min-w-0 border ${massError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={massUnit} onValueChange={(value) => { setMassUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {massUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {massError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{massError}</span>
                </div>
              )}
            </div>

            {/* Volume Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Volume (V):</label>
                <input
                  type="number"
                  value={volume}
                  onChange={e => handleVolumeChange(e.target.value)}
                  placeholder="0.1"
                  className={`flex-1 min-w-0 border ${volumeError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={volumeUnit} onValueChange={(value) => { setVolumeUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {volumeUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {volumeError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{volumeError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector */}
            <div className="flex items-center gap-2">
              <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Result Unit:</label>
              <Select value={resultUnit} onValueChange={(value) => { setResultUnit(value); resetCalculation(); }}>
                <SelectTrigger className="flex-1 min-w-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {densityUnits.map((u) => (
                    <SelectItem key={u.value} value={u.value} className="text-sm">
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Spacer to match layout */}
              <div className="w-[90px] flex-shrink-0"></div> 
            </div>

            {/* Formula Display */}
            <div className="mt-auto mb-3 bg-muted/40 rounded-lg p-3 border border-border flex flex-col items-center shadow-sm">
              <h4 className="font-bold text-foreground mb-2 uppercase text-[10px] tracking-wider">Formula:</h4>
              <div className="font-serif text-lg flex items-center gap-2.5">
                <span className="font-bold italic">ρ</span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-2 pb-0.5 text-[15px] italic font-medium tracking-wide">
                    m
                  </span>
                  <span className="pt-0.5 text-[15px] italic font-medium">V</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Density
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="bg-muted px-4 py-2.5 border-b border-border relative z-10">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Calculation & Result</h2>
          </div>

          <div className="p-3.5 flex-1 flex flex-col gap-3 relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Given Data</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">m</strong> 
                    <span className="text-foreground">= {mass || "?"} {massUnits.find(u => u.value === massUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">V</strong> 
                    <span className="text-foreground">= {volume || "?"} {volumeUnits.find(u => u.value === volumeUnit)?.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* To Find Section */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">To Find</h4>
              </div>
              <div className="p-2.5">
                <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                  <span className="text-foreground mr-1">Density (<strong className="text-blue-600 dark:text-blue-400">ρ</strong>)</span> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm transition-all mb-4">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Calculation</h4>
              </div>
              
              {/* Step 1: Base Conversion */}
              <div className="border-b border-border">
                <button
                  onClick={() => setShowStep1(!showStep1)}
                  className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${showStep1 ? 'bg-muted/30' : ''}`}
                >
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Step 1: Convert to SI Base Units (kg, m³)
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    <div>m = {mass || "?"} {massUnits.find(u => u.value === massUnit)?.label} = {result.calculated ? `${result.massSI} kg` : "?"}</div>
                    <div>V = {volume || "?"} {volumeUnits.find(u => u.value === volumeUnit)?.label} = {result.calculated ? `${result.volumeSI} m³` : "?"}</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Formula Application - Perfectly Aligned Grid */}
              <div className="p-4 overflow-x-auto">
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-4 gap-x-3 font-serif text-base">
                  
                  {/* Row 1: General Formula */}
                  <span className="font-bold italic text-right whitespace-nowrap">ρ</span>
                  <span className="text-center font-bold">=</span>
                  <div className="flex flex-col items-center justify-self-start">
                    <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap italic">m</span>
                    <span className="pt-1 text-sm whitespace-nowrap italic">V</span>
                  </div>
                  
                  {/* Row 2: Substituted Values */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-2">
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                        <span className={`bg-orange-100 dark:bg-orange-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Mass (kg)">
                          {result.calculated ? result.massSI : "m"}
                        </span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        <span className={`bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Volume (m³)">
                          {result.calculated ? result.volumeSI : "V"}
                        </span>
                      </span>
                    </div>

                    {/* Step 1 Indicator */}
                    {result.calculated && (massUnit !== 'kg' || volumeUnit !== 'm3') && (
                      <button 
                        onClick={() => setShowStep1(true)}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-sans text-[10px] font-semibold bg-blue-50/80 dark:bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all ml-2 focus:outline-none whitespace-nowrap"
                        title="View Step 1 conversions"
                      > 
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Step 1
                      </button>
                    )}
                  </div>
                  
                  {/* Final Result in SI Base */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <span className={`font-bold text-base justify-self-start ${result.calculated && resultUnit === 'kgm3' ? 'text-blue-600 dark:text-blue-400 font-sans' : (!result.calculated ? 'text-muted-foreground' : 'font-sans')}`}>
                    {result.calculated ? `${result.valueSI} kg/m³` : "? kg/m³"}
                  </span>

                  {/* Final Result in custom unit if not kg/m³ */}
                  {result.calculated && resultUnit !== 'kgm3' && (
                    <>
                      <span></span>
                      <span className="text-center font-bold">=</span>
                      <span className="font-bold text-base justify-self-start text-blue-600 dark:text-blue-400 font-sans">
                        {result.value} {densityUnits.find(u => u.value === resultUnit)?.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Final Result Display */}
            <div className="mt-auto" ref={resultRef}>
              <div className={`rounded-lg px-5 py-4 text-white shadow-lg transition-all duration-500 relative flex items-center justify-center min-h-[76px] ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 {result.calculated && (
                   <button
                     onClick={copyResult}
                     className="absolute top-1/2 -translate-y-1/2 right-3.5 p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                     title="Copy result"
                   >
                     {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                   </button>
                 )}
                 
                 {result.calculated ? (
                   <div className="flex items-center justify-center gap-3 overflow-hidden w-full px-8">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                       </svg>
                     </div>
                     
                     <div className="flex flex-col min-w-0 text-left">
                       <h2 className="text-[11px] font-bold uppercase tracking-wider opacity-90 whitespace-nowrap">Result:</h2>
                       <div className="text-xl md:text-2xl font-bold truncate min-w-0" title={`ρ = ${result.value} ${densityUnits.find(u => u.value === resultUnit)?.label}`}>
                         ρ = {formatDisplayNumber(result.value)} <span className="text-lg md:text-xl font-medium">{densityUnits.find(u => u.value === resultUnit)?.label}</span>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-sm font-medium opacity-70 italic text-muted-foreground">
                     Enter values and click Calculate...
                   </div>
                 )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
      </main>
      <Footer />
    </div>
  )
}