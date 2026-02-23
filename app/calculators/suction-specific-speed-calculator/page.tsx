"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { formatDisplayNumber } from "@/lib/number-formatter"
import { RadicalSymbol } from "@/components/math-symbols"
import { formatExact, formatValue } from "@/lib/format-exact"
import { 
  convertToSI, 
  speedUnits, 
  flowUnits, 
  headUnits 
} from "@/lib/unit-conversions"

// NPSH uses same units as head (m, ft, etc.)
const npshUnits = headUnits

export default function SuctionSpecificSpeedCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  const [showStep1, setShowStep1] = useState(false)
  
  const [rotationalSpeed, setRotationalSpeed] = useState<string>("")
  const [speedUnit, setSpeedUnit] = useState<string>("rpm")
  
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  
  const [npshRequired, setNpshRequired] = useState<string>("")
  const [npshUnit, setNpshUnit] = useState<string>("m")
  
  const [copied, setCopied] = useState(false)

  // Validation states
  const [speedError, setSpeedError] = useState<string>("")
  const [flowError, setFlowError] = useState<string>("")
  const [npshError, setNpshError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    fullValue: string
    calculated: boolean
    steps: {
      n_rpm: string
      q_m3h: string
      npshr_m: string
      sqrtQ: string
      npshrPower: string
      numerator: string
      nssExact: string
    } | null
  }>({
    value: "",
    fullValue: "",
    calculated: false,
    steps: null
  })

  // Validate Rotational Speed
  const validateSpeed = (value: string) => {
    if (value === "") {
      setSpeedError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setSpeedError("Please enter a valid number")
    } else if (num <= 0) {
      setSpeedError("Speed must be positive")
    } else {
      setSpeedError("")
    }
  }

  // Validate Flow Rate
  const validateFlow = (value: string) => {
    if (value === "") {
      setFlowError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setFlowError("Please enter a valid number")
    } else if (num <= 0) {
      setFlowError("Flow rate must be positive")
    } else {
      setFlowError("")
    }
  }

  // Validate NPSH Required
  const validateNPSH = (value: string) => {
    if (value === "") {
      setNpshError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setNpshError("Please enter a valid number")
    } else if (num <= 0) {
      setNpshError("NPSHr must be positive")
    } else {
      setNpshError("")
    }
  }

  // Handle input changes
  const handleSpeedChange = (value: string) => {
    setRotationalSpeed(value)
    validateSpeed(value)
    resetCalculation()
  }

  const handleFlowChange = (value: string) => {
    setFlowRate(value)
    validateFlow(value)
    resetCalculation()
  }

  const handleNPSHChange = (value: string) => {
    setNpshRequired(value)
    validateNPSH(value)
    resetCalculation()
  }

  const copyResult = () => {
    // Copy only the result value
    const resultText = `${result.value}`
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: resultText,
    })
  }

  // Reset calculation when any input changes
  const resetCalculation = () => {
    if (result.calculated) {
      setResult({
        value: "",
        fullValue: "",
        calculated: false,
        steps: null
      })
      toast({
        title: "Input Modified",
        description: "Please click Calculate again to see updated results.",
        variant: "default",
      })
    }
  }

  const handleCalculate = () => {
    const N_input = rotationalSpeed ? parseFloat(rotationalSpeed) : null
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const NPSHr_input = npshRequired ? parseFloat(npshRequired) : null

    // Check for validation errors
    if (speedError || flowError || npshError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      })
      setResult({
        value: "",
        fullValue: "",
        calculated: false,
        steps: null
      })
      return
    }

    if (!N_input || !Q_input || !NPSHr_input) {
      setResult({
        value: "",
        fullValue: "",
        calculated: false,
        steps: null
      })
      return
    }

    if (N_input <= 0 || Q_input <= 0 || NPSHr_input <= 0) {
      toast({
        title: "Invalid Input",
        description: "All values must be positive.",
        variant: "destructive",
      })
      setResult({
        value: "",
        fullValue: "",
        calculated: false,
        steps: null
      })
      return
    }

    // Step 1: Convert inputs to SI units
    const N_rpm = convertToSI(N_input, speedUnit, 'speed') // RPM
    const Q_m3h = convertToSI(Q_input, flowUnit, 'flow') // m³/h
    const NPSHr_m = convertToSI(NPSHr_input, npshUnit, 'head') // m

    // Step 2: Calculate Nss using formula: Nss = (N × √Q) / NPSHr^(3/4)
    const sqrtQ = Math.sqrt(Q_m3h)
    const numerator = N_rpm * sqrtQ
    const npshrPower = Math.pow(NPSHr_m, 0.75) // 3/4 = 0.75
    const nssExact = numerator / npshrPower
    const nssRounded = Math.round(nssExact)

    setResult({
      value: nssRounded.toString(),
      fullValue: nssExact.toFixed(2),
      calculated: true,
      steps: {
        n_rpm: formatValue(N_rpm, true), // RPM - no decimals
        q_m3h: formatExact(Q_m3h),
        npshr_m: formatExact(NPSHr_m),
        sqrtQ: sqrtQ.toFixed(4),
        npshrPower: npshrPower.toFixed(4),
        numerator: numerator.toFixed(2),
        nssExact: nssExact.toFixed(2)
      }
    })

    // Scroll to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8 font-sans text-foreground flex flex-col items-center">
      
      <div className="text-center mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          World-Class Engineering Tool for Professionals
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">
          Suction Specific Speed Calculator
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Smart Unit Conversion - Enter values in any unit!
          </span>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-3 border-b border-border">
             <h2 className="font-bold text-base uppercase text-foreground">Inputs & Parameters</h2>
          </div>

          <div className="p-4 space-y-4 flex flex-col flex-1">
            
            {/* Rotational Speed Input */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-32 flex-shrink-0">Speed (N):</label>
                <input
                  type="number"
                  value={rotationalSpeed}
                  onChange={e => handleSpeedChange(e.target.value)}
                  placeholder="1000"
                  className={`flex-[2] min-w-0 border-2 ${speedError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={speedUnit} onValueChange={(value) => { setSpeedUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[100px] border-2 border-border bg-background text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {speedUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {speedError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{speedError}</span>
                </div>
              )}
            </div>

            {/* Flow Rate Input */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-32 flex-shrink-0">Flow Rate (Q):</label>
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => handleFlowChange(e.target.value)}
                  placeholder="100"
                  className={`flex-[2] min-w-0 border-2 ${flowError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={flowUnit} onValueChange={(value) => { setFlowUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[100px] border-2 border-border bg-background text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {flowUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {flowError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{flowError}</span>
                </div>
              )}
            </div>

            {/* NPSH Required Input */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-32 flex-shrink-0">NPSHr:</label>
                <input
                  type="number"
                  value={npshRequired}
                  onChange={e => handleNPSHChange(e.target.value)}
                  placeholder="10"
                  className={`flex-[2] min-w-0 border-2 ${npshError ?'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={npshUnit} onValueChange={(value) => { setNpshUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[100px] border-2 border-border bg-background text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {npshUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {npshError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{npshError}</span>
                </div>
              )}
            </div>

            {/* Formula Display */}
            <div className="mt-auto mb-4 bg-muted rounded-lg p-8 py-10 border-2 border-border flex flex-col items-center justify-center">
              <h4 className="font-bold text-foreground mb-4 uppercase text-sm text-center">Formula:</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="font-serif text-2xl flex items-center gap-3">
                  <span className="font-bold">N<sub className="text-sm">ss</sub></span>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-2 border-foreground px-3 pb-1 text-xl flex items-center">
                      N × <RadicalSymbol>Q</RadicalSymbol>
                    </span>
                    <span className="pt-1 text-xl">NPSHr<sup className="text-sm">3/4</sup></span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-base tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Suction Specific Speed
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="bg-muted px-4 py-3 border-b border-border relative z-10">
             <h2 className="font-bold text-base uppercase text-foreground">Calculation & Result </h2>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4 relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">Given</h4>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">N</strong> 
                    <span className="text-foreground">= {rotationalSpeed || "?"} {speedUnits.find(u => u.value === speedUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q</strong> 
                    <span className="text-foreground">= {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">NPSHr</strong> 
                    <span className="text-foreground">= {npshRequired || "?"} {npshUnits.find(u => u.value === npshUnit)?.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* To Find Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">To Find</h4>
              </div>
              <div className="p-3">
                <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                  <strong className="text-blue-600 dark:text-blue-400 mr-1.5">N<sub className="text-xs">ss</sub></strong> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps */}
            {result.calculated && result.steps && (
              <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="bg-muted px-3 py-2 border-b border-border">
                  <h4 className="font-bold text-foreground uppercase text-xs">Calculation</h4>
                </div>
                
                {/* Step 1: SI Conversion - Collapsible */}
                <div className="border-b border-border">
                  <button
                    onClick={() => setShowStep1(!showStep1)}
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Step 1: Convert to SI units
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                  </button>
                  {showStep1 && (
                    <div className="px-6 pb-4 space-y-1 text-sm font-mono bg-blue-50/50 dark:bg-blue-950/20">
                      <div>N = {rotationalSpeed} {speedUnits.find(u => u.value === speedUnit)?.label} = {result.steps.n_rpm} RPM</div>
                      <div>Q = {flowRate} {flowUnits.find(u => u.value === flowUnit)?.label} = {result.steps.q_m3h} m³/h</div>
                      <div>NPSHr = {npshRequired} {npshUnits.find(u => u.value === npshUnit)?.label} = {result.steps.npshr_m} m</div>
                    </div>
                  )}
                </div>
                
                {/* Step 2: Calculate using formula */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-5 gap-x-4 font-serif text-lg min-w-max overflow-x-auto">
                    
                    {/* Step 1: Formula */}
                    <span className="font-bold text-right whitespace-nowrap">N<sub className="text-xs">ss</sub></span>
                    <span className="text-center">=</span>
                    <div className="flex flex-col items-center justify-self-start">
                      <span className="border-b-2 border-foreground px-4 pb-1 text-base whitespace-nowrap flex items-center">
                        N × <RadicalSymbol>Q</RadicalSymbol>
                      </span>
                      <span className="pt-1 text-base whitespace-nowrap">NPSHr<sup className="text-xs">3/4</sup></span>
                    </div>
                    
                    {/* Step 2: Substitution */}
                    <span></span>
                    <span className="text-center">=</span>
                    <div className="flex flex-col items-center justify-self-start">
                      <span className="border-b-2 border-foreground px-4 pb-1 text-base whitespace-nowrap flex items-center">
                        <span className="bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1.5 py-0.5 rounded">{result.steps.n_rpm}</span>
                        <span className="mx-1">×</span>
                        <RadicalSymbol>
                          <span className="bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1.5 py-0.5 rounded">{result.steps.q_m3h}</span>
                        </RadicalSymbol>
                      </span>
                      <span className="pt-1 text-base whitespace-nowrap">
                        <span className="bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1.5 py-0.5 rounded">{result.steps.npshr_m}</span>
                        <sup className="text-xs">3/4</sup>
                      </span>
                    </div>
                    
                    {/* Step 3: Simplified Fraction */}
                    <span></span>
                    <span className="text-center">=</span>
                    <div className="flex flex-col items-center justify-self-start">
                      <span className="border-b-2 border-foreground px-4 pb-1 text-base whitespace-nowrap">
                        {result.steps.numerator}
                      </span>
                      <span className="pt-1 text-base whitespace-nowrap">
                        {result.steps.npshrPower}
                      </span>
                    </div>
                    
                    {/* Step 4: Final Result */}
                    <span></span>
                    <span className="text-center font-bold">≈</span>
                    <span className="font-bold text-xl justify-self-start">{result.fullValue}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="mt-auto" ref={resultRef}>
              <div className={`rounded-lg px-6 py-4 text-white shadow-lg transition-all duration-500 relative ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 {result.calculated && (
                   <button
                     onClick={copyResult}
                     className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                     title="Copy result"
                   >
                     {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                   </button>
                 )}
                 
                 {result.calculated ? (
                   <div className="flex items-center justify-center gap-4 overflow-hidden">
                     <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     
                     <div className="flex items-center gap-3 min-w-0 flex-1">
                       <h2 className="text-xl font-bold uppercase opacity-90 whitespace-nowrap">Result:</h2>
                       <div className="text-3xl font-black truncate min-w-0" title={`Nss = ${result.value}`}>
                         N<sub className="text-xl">ss</sub> = {formatDisplayNumber(result.value)}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center">
                     <div className="text-base font-medium opacity-70 italic text-muted-foreground">
                       Enter values and click Calculate...
                     </div>
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