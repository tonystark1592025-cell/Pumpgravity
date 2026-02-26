"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check } from "lucide-react"

// Local length units for Impeller Diameter
const lengthUnits =[
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
  { value: "in", label: "in" }
]

// Simple conversion helper for lengths
const convertToBase = (val: number, unit: string) => {
  if (unit === 'in') return val * 25.4
  if (unit === 'cm') return val * 10
  if (unit === 'm') return val * 1000
  return val // base is mm
}

const convertFromBase = (val: number, unit: string) => {
  if (unit === 'in') return val / 25.4
  if (unit === 'cm') return val / 10
  if (unit === 'm') return val / 1000
  return val // base is mm
}

export default function ImpellerDiameterCheckCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  
  const [dMin, setDMin] = useState<string>("475")
  const[dMinUnit, setDMinUnit] = useState<string>("mm")
  
  const[dRated, setDRated] = useState<string>("500")
  const[dRatedUnit, setDRatedUnit] = useState<string>("mm")
  
  const [dMax, setDMax] = useState<string>("525")
  const[dMaxUnit, setDMaxUnit] = useState<string>("mm")
  
  const[copied, setCopied] = useState(false)

  // Validation states
  const[dMinError, setDMinError] = useState<string>("")
  const[dRatedError, setDRatedError] = useState<string>("")
  const[dMaxError, setDMaxError] = useState<string>("")

  const [result, setResult] = useState<{
    calculated: boolean
    minAllowable: number
    maxAllowable: number
    marginAboveMin: number
    marginBelowMax: number
    isMet: boolean
    unit: string
  }>({
    calculated: false,
    minAllowable: 0,
    maxAllowable: 0,
    marginAboveMin: 0,
    marginBelowMax: 0,
    isMet: false,
    unit: "mm"
  })

  const validateInput = (value: string, setError: (msg: string) => void) => {
    if (value === "") {
      setError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setError("Please enter a valid number")
    } else if (num <= 0) {
      setError("Diameter must be positive")
    } else {
      setError("")
    }
  }

  const handleInputChange = (value: string, setter: (val: string) => void, errorSetter: (msg: string) => void) => {
    setter(value)
    validateInput(value, errorSetter)
    resetCalculation()
  }

  const copyResult = () => {
    const status = result.isMet ? "Conditions Met" : "Conditions NOT Met"
    const resultText = `Impeller Check: ${status} | Margin above min: ${result.marginAboveMin.toFixed(2)}%, Margin below max: ${result.marginBelowMax.toFixed(2)}%`
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: "Results successfully copied.",
    })
  }

  const resetCalculation = () => {
    if (result.calculated) {
      setResult({ ...result, calculated: false })
    }
  }

  const handleCalculate = () => {
    const dMinVal = parseFloat(dMin)
    const dRatedVal = parseFloat(dRated)
    const dMaxVal = parseFloat(dMax)

    if (dMinError || dRatedError || dMaxError) {
      toast({ title: "Validation Error", description: "Please fix all errors before calculating.", variant: "destructive" })
      return
    }

    if (!dMinVal || !dRatedVal || !dMaxVal) {
      toast({ title: "Missing Input", description: "Please enter all required diameter values.", variant: "destructive" })
      return
    }

    // Convert everything to the unit of D_rated for display and exact comparison
    const dMinBase = convertToBase(dMinVal, dMinUnit)
    const dRatedBase = convertToBase(dRatedVal, dRatedUnit)
    const dMaxBase = convertToBase(dMaxVal, dMaxUnit)

    const dMinTarget = convertFromBase(dMinBase, dRatedUnit)
    const dMaxTarget = convertFromBase(dMaxBase, dRatedUnit)

    // Engineering Checks
    const minAllowable = dMinTarget * 1.05
    const maxAllowable = dMaxTarget * 0.95
    
    // Percentage margins
    const marginAboveMin = ((dRatedVal - dMinTarget) / dMinTarget) * 100
    const marginBelowMax = ((dMaxTarget - dRatedVal) / dMaxTarget) * 100

    // Final condition boolean
    const isMet = (dRatedVal >= minAllowable) && (dRatedVal <= maxAllowable)

    setResult({
      calculated: true,
      minAllowable,
      maxAllowable,
      marginAboveMin,
      marginBelowMax,
      isMet,
      unit: dRatedUnit
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
          Impeller Diameter Check Calculator
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Validates API 610 Impeller Margin Rules
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full h-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-border">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Inputs & Parameters <span className="text-xs text-muted-foreground font-medium">(Impeller Diameter Check)</span></h2>
          </div>

          <div className="p-4 space-y-4 flex flex-col flex-1">
            
            {/* Minimum Diameter */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-48 flex-shrink-0">
                  Minimum Impeller Diameter (<span className="italic">D</span><sub>min</sub>):
                </label>
                <input
                  type="number"
                  value={dMin}
                  onChange={e => handleInputChange(e.target.value, setDMin, setDMinError)}
                  placeholder="475"
                  className={`flex-[2] min-w-0 border ${dMinError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={dMinUnit} onValueChange={(value) => { setDMinUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[70px] max-w-[90px] border border-border bg-background text-sm h-9 justify-center font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {lengthUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dMinError && <div className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-medium">{dMinError}</div>}
            </div>

            {/* Rated Diameter */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-48 flex-shrink-0">
                  Rated Impeller Diameter (<span className="italic">D</span><sub>rated</sub>):
                </label>
                <input
                  type="number"
                  value={dRated}
                  onChange={e => handleInputChange(e.target.value, setDRated, setDRatedError)}
                  placeholder="500"
                  className={`flex-[2] min-w-0 border ${dRatedError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={dRatedUnit} onValueChange={(value) => { setDRatedUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[70px] max-w-[90px] border border-border bg-background text-sm h-9 justify-center font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {lengthUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dRatedError && <div className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-medium">{dRatedError}</div>}
            </div>

            {/* Maximum Diameter */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-48 flex-shrink-0">
                  Maximum Impeller Diameter (<span className="italic">D</span><sub>max</sub>):
                </label>
                <input
                  type="number"
                  value={dMax}
                  onChange={e => handleInputChange(e.target.value, setDMax, setDMaxError)}
                  placeholder="525"
                  className={`flex-[2] min-w-0 border ${dMaxError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={dMaxUnit} onValueChange={(value) => { setDMaxUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[70px] max-w-[90px] border border-border bg-background text-sm h-9 justify-center font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {lengthUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dMaxError && <div className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-medium">{dMaxError}</div>}
            </div>

            {/* Formulas Display */}
            <div className="mt-auto mb-3 bg-muted/40 rounded-lg p-4 border border-border flex flex-col shadow-sm">
              <h4 className="font-bold text-foreground mb-3 uppercase text-[11px] tracking-wider">Formulas (Conditions):</h4>
              <div className="font-serif text-[17px] flex flex-col gap-2.5 ml-4">
                <div className="flex items-center gap-2">
                  <span className="italic font-bold">D<sub className="text-[11px] not-italic font-sans">rated</sub></span>
                  <span>&ge;</span>
                  <span>1.05 &times; <span className="italic">D</span><sub className="text-[11px] not-italic font-sans">min</sub></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="italic font-bold">D<sub className="text-[11px] not-italic font-sans">rated</sub></span>
                  <span>&le;</span>
                  <span>0.95 &times; <span className="italic">D</span><sub className="text-[11px] not-italic font-sans">max</sub></span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase flex justify-center items-center gap-2"
            >
              Check Diameter Conditions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="bg-muted px-4 py-2.5 border-b border-border relative z-10">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Calculation & Result <span className="text-xs text-muted-foreground font-medium">(Impeller Diameter Check)</span></h2>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-6 relative z-10 h-full justify-between">
            
            {/* Big Result Header */}
            <div className="text-center mt-2 h-12 flex items-center justify-center">
              {result.calculated ? (
                result.isMet ? (
                  <h3 className="text-[28px] md:text-3xl font-black text-green-600 dark:text-green-500 tracking-tight flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    Result: Conditions met <span className="text-3xl">✅</span>
                  </h3>
                ) : (
                  <h3 className="text-[28px] md:text-3xl font-black text-red-600 dark:text-red-500 tracking-tight flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    Result: Conditions NOT met 
                  </h3>
                )
              ) : (
                <h3 className="text-xl font-bold text-muted-foreground/50 tracking-tight">
                   Check Results Pending...
                </h3>
              )}
            </div>

            {/* Data Table */}
            <div className="bg-background rounded-md border border-border shadow-sm flex flex-col divide-y divide-border text-[15px]">
              <div className="flex justify-between items-center p-3.5 hover:bg-muted/30 transition-colors">
                <span className="font-medium text-foreground">Min allowable <span className="italic font-serif">D</span><sub className="text-[10px]">rated</sub>:</span>
                <span className={`font-bold ${result.calculated ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {result.calculated ? `${result.minAllowable.toFixed(1)} ${result.unit}` : "?"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 hover:bg-muted/30 transition-colors">
                <span className="font-medium text-foreground">Max allowable <span className="italic font-serif">D</span><sub className="text-[10px]">rated</sub>:</span>
                <span className={`font-bold ${result.calculated ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {result.calculated ? `${result.maxAllowable.toFixed(1)} ${result.unit}` : "?"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 hover:bg-muted/30 transition-colors">
                <span className="font-medium text-foreground">Margin above min:</span>
                <span className={`font-bold ${result.calculated ? (result.marginAboveMin >= 5.0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500') : 'text-muted-foreground'}`}>
                  {result.calculated ? `${result.marginAboveMin.toFixed(2)}%` : "?"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 hover:bg-muted/30 transition-colors">
                <span className="font-medium text-foreground">Margin below max:</span>
                <span className={`font-bold ${result.calculated ? (result.marginBelowMax >= 5.0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500') : 'text-muted-foreground'}`}>
                  {result.calculated ? `${result.marginBelowMax.toFixed(2)}%` : "?"}
                </span>
              </div>
            </div>

            {/* Bottom Result Status Banner */}
            <div className="mt-auto" ref={resultRef}>
              <div className={`rounded-lg px-5 py-3.5 text-white shadow-lg transition-all duration-500 relative flex items-center min-h-[68px] ${result.calculated ? (result.isMet ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-red-500 to-red-600") : "bg-muted"}`}>
                
                {result.calculated && (
                  <button
                    onClick={copyResult}
                    className="absolute top-1/2 -translate-y-1/2 right-3.5 p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                    title="Copy result"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}

                {result.calculated ? (
                  <div className="flex items-center gap-4 w-full px-2">
                    <div className="w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center flex-shrink-0">
                      {result.isMet ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0 pr-10">
                      <div className="text-[11px] font-bold uppercase tracking-wider opacity-90 mb-0.5 text-white/90">
                        Result Summary:
                      </div>
                      <h2 className="text-base font-bold leading-tight mb-0.5">
                        {result.isMet ? "Conditions Met." : "Conditions NOT Met."}
                      </h2>
                      <p className="text-xs font-medium opacity-90 leading-snug">
                        Margin above min: {result.marginAboveMin.toFixed(2)}%, Margin below max: {result.marginBelowMax.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ) : (
                   <div className="flex-1 text-center text-sm font-medium opacity-70 italic text-muted-foreground w-full">
                     Enter values and click Check Diameter Conditions...
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