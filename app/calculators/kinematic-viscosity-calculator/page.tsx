"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { formatDisplayNumber } from "@/lib/number-formatter"

// Local constants for units
const dynamicViscosityUnits = [
  { value: "cp", label: "cP" },
  { value: "mpas", label: "mPa·s" },
  { value: "pas", label: "Pa·s" },
  { value: "poise", label: "P" },
]

const densityUnits = [
  { value: "kgm3", label: "kg/m³" },
  { value: "gcm3", label: "g/cm³" },
  { value: "lbft3", label: "lb/ft³" },
]

const kinematicViscosityUnits = [
  { value: "cst", label: "cSt" },
  { value: "m2s", label: "m²/s" },
  { value: "st", label: "St" },
  { value: "ft2s", label: "ft²/s" },
]

export default function KinematicViscosityCalculator() {
  const { toast } = useToast()
  const [showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  // Inputs
  const [mu, setMu] = useState<string>("")
  const [muUnit, setMuUnit] = useState<string>("cp")

  const [rho, setRho] = useState<string>("")
  const [rhoUnit, setRhoUnit] = useState<string>("kgm3")
  
  const [resultUnit, setResultUnit] = useState<string>("cst")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [muError, setMuError] = useState<string>("")
  const [rhoError, setRhoError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string // m²/s
    fullValue: string
    muSI: string // Pa·s
    rhoSI: string // kg/m³
    calculated: boolean
    steps: string[]
  }>({
    value: "",
    valueSI: "",
    fullValue: "",
    muSI: "",
    rhoSI: "",
    calculated: false,
    steps: []
  })

  // Validators
  const validateInput = (value: string, setErr: (msg: string) => void) => {
    if (value === "") {
      setErr("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setErr("Invalid number")
    } else if (num <= 0) {
      setErr("Must be positive")
    } else {
      setErr("")
    }
  }

  const handleMuChange = (value: string) => {
    setMu(value)
    validateInput(value, setMuError)
    resetCalculation()
  }

  const handleRhoChange = (value: string) => {
    setRho(value)
    validateInput(value, setRhoError)
    resetCalculation()
  }

  const copyResult = () => {
    const displayValue = parseFloat(result.fullValue).toFixed(6)
    const resultText = `${displayValue} ${kinematicViscosityUnits.find(u => u.value === resultUnit)?.label}`
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
        muSI: "",
        rhoSI: "",
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
  const toPas = (val: number, unit: string) => {
    switch (unit) {
      case "cp": return val * 0.001
      case "mpas": return val * 0.001
      case "poise": return val * 0.1
      case "pas": return val
      default: return val
    }
  }

  const toKgM3 = (val: number, unit: string) => {
    switch (unit) {
      case "gcm3": return val * 1000
      case "lbft3": return val * 16.0185
      case "kgm3": return val
      default: return val
    }
  }

  const fromM2s = (val: number, unit: string) => {
    switch (unit) {
      case "cst": return val * 1000000 
      case "st": return val * 10000    
      case "ft2s": return val * 10.7639
      case "m2s": return val
      default: return val
    }
  }

  const handleCalculate = () => {
    const muInput = mu ? parseFloat(mu) : null
    const rhoInput = rho ? parseFloat(rho) : null

    if (muError || rhoError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors.",
        variant: "destructive",
      })
      return
    }

    if (muInput === null || rhoInput === null) {
      setResult({ ...result, calculated: false, steps: ["Please enter all required values"] })
      return
    }

    const mu_SI = toPas(muInput, muUnit)
    const rho_SI = toKgM3(rhoInput, rhoUnit)

    const nu_SI = mu_SI / rho_SI
    const finalValue = fromM2s(nu_SI, resultUnit)

    const muLabel = dynamicViscosityUnits.find(u => u.value === muUnit)?.label
    const rhoLabel = densityUnits.find(u => u.value === rhoUnit)?.label
    const resLabel = kinematicViscosityUnits.find(u => u.value === resultUnit)?.label

    const steps = [
      `Step 1: Convert inputs to SI base units`,
      `  μ = ${muInput} ${muLabel} = ${formatDisplayNumber(mu_SI.toString())} Pa·s`,
      `  ρ = ${rhoInput} ${rhoLabel} = ${formatDisplayNumber(rho_SI.toString())} kg/m³`,
      ``,
      `Step 2: Calculate Kinematic Viscosity (ν = μ / ρ)`,
      `  ν = ${formatDisplayNumber(mu_SI.toString())} / ${formatDisplayNumber(rho_SI.toString())}`,
      `  ν = ${formatDisplayNumber(nu_SI.toString())} m²/s`,
      ...(resultUnit !== 'm2s' ? [
        ``,
        `Step 3: Convert to ${resLabel}`,
        `  ν = ${formatDisplayNumber(nu_SI.toString())} m²/s = ${formatDisplayNumber(finalValue.toString())} ${resLabel}`
      ] : [])
    ]

    setResult({
      value: formatDisplayNumber(finalValue.toString()),
      valueSI: formatDisplayNumber(nu_SI.toString()),
      fullValue: finalValue.toString(),
      muSI: formatDisplayNumber(mu_SI.toString()),
      rhoSI: formatDisplayNumber(rho_SI.toString()),
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
          Kinematic Viscosity Calculator
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Fluid Mechanics - Convert Dynamic to Kinematic
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
            
            {/* Dynamic Viscosity Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Dynamic Viscosity (μ):</label>
                <input
                  type="number"
                  value={mu}
                  onChange={e => handleMuChange(e.target.value)}
                  placeholder="200"
                  className={`flex-1 min-w-0 border ${muError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={muUnit} onValueChange={(value) => { setMuUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {dynamicViscosityUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {muError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{muError}</span>
                </div>
              )}
            </div>

            {/* Density Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Density (ρ):</label>
                <input
                  type="number"
                  value={rho}
                  onChange={e => handleRhoChange(e.target.value)}
                  placeholder="800"
                  className={`flex-1 min-w-0 border ${rhoError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={rhoUnit} onValueChange={(value) => { setRhoUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
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
              </div>
              {rhoError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{rhoError}</span>
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
                  {kinematicViscosityUnits.map((u) => (
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
                <span className="font-bold italic">ν</span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-2 pb-0.5 text-[15px] italic font-medium tracking-wide">
                    μ
                  </span>
                  <span className="pt-0.5 text-[15px] italic font-medium">ρ</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Kinematic Viscosity
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
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">μ</strong> 
                    <span className="text-foreground">= {mu || "?"} {dynamicViscosityUnits.find(u => u.value === muUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">ρ</strong> 
                    <span className="text-foreground">= {rho || "?"} {densityUnits.find(u => u.value === rhoUnit)?.label}</span>
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
                  <span className="text-foreground mr-1">Kinematic Viscosity (<strong className="text-blue-600 dark:text-blue-400">ν</strong>)</span> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps - Fixed Alignment */}
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
                    Step 1: Convert to SI Base Units (Pa·s, kg/m³)
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    <div>μ = {mu || "?"} {dynamicViscosityUnits.find(u => u.value === muUnit)?.label} = {result.calculated ? `${result.muSI} Pa·s` : "?"}</div>
                    <div>ρ = {rho || "?"} {densityUnits.find(u => u.value === rhoUnit)?.label} = {result.calculated ? `${result.rhoSI} kg/m³` : "?"}</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Formula Application - Perfectly Aligned Grid */}
              <div className="p-4 overflow-x-auto">
                <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-4 items-center font-serif text-base">
                  
                  {/* Row 1: General Formula */}
                  <span className="font-bold italic text-right whitespace-nowrap">ν</span>
                  <span className="text-center font-bold">=</span>
                  <div className="flex flex-col items-center justify-self-start">
                    <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap italic">μ</span>
                    <span className="pt-1 text-sm whitespace-nowrap italic">ρ</span>
                  </div>
                  
                  {/* Row 2: Substituted Values */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-2">
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                        <span className={`bg-orange-100 dark:bg-orange-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Dynamic Viscosity (Pa·s)">
                          {result.calculated ? result.muSI : "μ"}
                        </span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        <span className={`bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Density (kg/m³)">
                          {result.calculated ? result.rhoSI : "ρ"}
                        </span>
                      </span>
                    </div>

                    {/* Step 1 Indicator - Placed inline with substitution */}
                    {result.calculated && (muUnit !== 'pas' || rhoUnit !== 'kgm3') && (
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
                  <span className={`font-bold text-base justify-self-start ${result.calculated && resultUnit === 'm2s' ? 'text-blue-600 dark:text-blue-400 font-sans' : (!result.calculated ? 'text-muted-foreground' : 'font-sans')}`}>
                    {result.calculated ? `${result.valueSI} m²/s` : "? m²/s"}
                  </span>

                  {/* Final Result in custom unit if not m2/s */}
                  {result.calculated && resultUnit !== 'm2s' && (
                    <>
                      <span></span>
                      <span className="text-center font-bold">=</span>
                      <span className="font-bold text-base justify-self-start text-blue-600 dark:text-blue-400 font-sans">
                        {result.value} {kinematicViscosityUnits.find(u => u.value === resultUnit)?.label}
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
                       <div className="text-xl md:text-2xl font-bold truncate min-w-0" title={`ν = ${result.value} ${kinematicViscosityUnits.find(u => u.value === resultUnit)?.label}`}>
                         ν = {formatDisplayNumber(result.value)} <span className="text-lg md:text-xl font-medium">{kinematicViscosityUnits.find(u => u.value === resultUnit)?.label}</span>
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