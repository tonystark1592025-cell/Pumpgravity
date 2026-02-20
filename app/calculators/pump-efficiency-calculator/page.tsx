"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check } from "lucide-react"

export default function PumpEfficiencyCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  
  const [flowRate, setFlowRate] = useState<string>("150")
  const [differentialHead, setDifferentialHead] = useState<string>("100")
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  const [shaftPower, setShaftPower] = useState<string>("54.46")
  
  const [copied, setCopied] = useState(false)

  // Validation states
  const [flowError, setFlowError] = useState<string>("")
  const [headError, setHeadError] = useState<string>("")
  const [sgError, setSgError] = useState<string>("")
  const [powerError, setPowerError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    fullValue: string
    calculated: boolean
    steps: {
      q: string
      h: string
      sg: string
      ps: string
      numerator: string
      denominator: string
      efficiencyDecimal: string
      efficiencyPercent: string
    } | null
  }>({
    value: "",
    fullValue: "",
    calculated: false,
    steps: null
  })

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

  // Validate Differential Head
  const validateHead = (value: string) => {
    if (value === "") {
      setHeadError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setHeadError("Please enter a valid number")
    } else if (num <= 0) {
      setHeadError("Head must be positive")
    } else {
      setHeadError("")
    }
  }

  // Validate Specific Gravity
  const validateSG = (value: string) => {
    if (value === "") {
      setSgError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setSgError("Please enter a valid number")
    } else if (num <= 0) {
      setSgError("SG must be positive")
    } else if (num > 23) {
      setSgError("SG cannot exceed 23")
    } else {
      setSgError("")
    }
  }

  // Validate Shaft Power
  const validatePower = (value: string) => {
    if (value === "") {
      setPowerError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setPowerError("Please enter a valid number")
    } else if (num <= 0) {
      setPowerError("Shaft power must be positive")
    } else {
      setPowerError("")
    }
  }

  // Handle input changes
  const handleFlowChange = (value: string) => {
    setFlowRate(value)
    validateFlow(value)
  }

  const handleHeadChange = (value: string) => {
    setDifferentialHead(value)
    validateHead(value)
  }

  const handleSGChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 23) {
      setSpecificGravity("23")
      validateSG("23")
    } else {
      setSpecificGravity(value)
      validateSG(value)
    }
  }

  const handlePowerChange = (value: string) => {
    setShaftPower(value)
    validatePower(value)
  }

  const copyResult = () => {
    const resultText = `η = ${result.value}%`
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: resultText,
    })
  }

  const handleCalculate = () => {
    const Q = flowRate ? parseFloat(flowRate) : null
    const H = differentialHead ? parseFloat(differentialHead) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null
    const Ps = shaftPower ? parseFloat(shaftPower) : null

    // Check for validation errors
    if (flowError || headError || sgError || powerError) {
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

    if (!Q || !H || !SG || !Ps) {
      setResult({
        value: "",
        fullValue: "",
        calculated: false,
        steps: null
      })
      return
    }

    if (Q <= 0 || H <= 0 || SG <= 0 || Ps <= 0) {
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

    // Calculate efficiency using formula: η = (Q × H × SG) / (367.2 × Ps)
    const numerator = Q * H * SG
    const denominator = 367.2 * Ps
    const efficiencyDecimal = numerator / denominator
    const efficiencyPercent = efficiencyDecimal * 100
    const efficiencyRounded = Math.round(efficiencyPercent)

    setResult({
      value: efficiencyRounded.toString(),
      fullValue: efficiencyPercent.toFixed(2),
      calculated: true,
      steps: {
        q: Q.toString(),
        h: H.toString(),
        sg: SG.toString(),
        ps: Ps.toString(),
        numerator: (numerator % 1 === 0 ? numerator : numerator.toFixed(2)).toString(),
        denominator: denominator.toFixed(2),
        efficiencyDecimal: efficiencyDecimal.toFixed(4),
        efficiencyPercent: efficiencyPercent.toFixed(2)
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
          Pump Efficiency Calculator
        </h1>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-3 border-b border-border">
             <h2 className="font-bold text-base uppercase text-foreground">Inputs & Parameters (Pump Efficiency)</h2>
          </div>

          <div className="p-4 space-y-4 flex flex-col flex-1">
            
            {/* Flow Rate Input - Fixed Unit */}
            <div>
              <label className="block font-semibold text-foreground text-sm mb-2">Flow Rate (Q):</label>
              <div className="flex items-stretch border-2 border-border rounded-lg overflow-hidden bg-muted/30">
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => handleFlowChange(e.target.value)}
                  placeholder="150"
                  className={`flex-1 px-4 py-2 text-center text-base bg-transparent focus:outline-none ${flowError ? 'text-red-600' : 'text-foreground'}`}
                />
                <div className="px-4 py-2 bg-muted border-l-2 border-border flex items-center justify-center text-sm font-semibold text-muted-foreground min-w-[80px]">
                  m³/h
                </div>
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

            {/* Differential Head Input - Fixed Unit */}
            <div>
              <label className="block font-semibold text-foreground text-sm mb-2">Differential Head (H):</label>
              <div className="flex items-stretch border-2 border-border rounded-lg overflow-hidden bg-muted/30">
                <input
                  type="number"
                  value={differentialHead}
                  onChange={e => handleHeadChange(e.target.value)}
                  placeholder="100"
                  className={`flex-1 px-4 py-2 text-center text-base bg-transparent focus:outline-none ${headError ? 'text-red-600' : 'text-foreground'}`}
                />
                <div className="px-4 py-2 bg-muted border-l-2 border-border flex items-center justify-center text-sm font-semibold text-muted-foreground min-w-[80px]">
                  m
                </div>
              </div>
              {headError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{headError}</span>
                </div>
              )}
            </div>

            {/* Shaft Power - Fixed Unit - Horizontal Layout */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-40 flex-shrink-0">Shaft Power (P<sub>s</sub>):</label>
                <div className="flex-1 flex items-stretch border-2 border-border rounded-lg overflow-hidden bg-muted/30">
                  <input
                    type="number"
                    value={shaftPower}
                    onChange={e => handlePowerChange(e.target.value)}
                    placeholder="54.46"
                    step="0.01"
                    className={`flex-1 px-4 py-2 text-center text-base bg-transparent focus:outline-none ${powerError ? 'text-red-600' : 'text-foreground'}`}
                  />
                  <div className="px-4 py-2 bg-muted border-l-2 border-border flex items-center justify-center text-sm font-semibold text-muted-foreground min-w-[70px]">
                    kW
                  </div>
                </div>
              </div>
              {powerError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{powerError}</span>
                </div>
              )}
            </div>

            {/* Specific Gravity - No Unit - Horizontal Layout */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-40 flex-shrink-0">Specific Gravity (SG):</label>
                <div className="flex-1 flex items-stretch border-2 border-border rounded-lg overflow-hidden bg-muted/30">
                  <input
                    type="number"
                    value={specificGravity}
                    onChange={e => handleSGChange(e.target.value)}
                    placeholder="1.0"
                    step="0.01"
                    max="23"
                    className={`flex-1 px-4 py-2 text-center text-base bg-transparent focus:outline-none ${sgError ? 'text-red-600' : 'text-foreground'}`}
                  />
                </div>
              </div>
              {sgError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{sgError}</span>
                </div>
              )}
            </div>

            {/* Formula Display */}
            <div className="mt-auto mb-4 bg-muted rounded-lg p-4 border-2 border-border">
              <h4 className="font-bold text-foreground mb-3 uppercase text-xs text-center">Formula:</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="font-serif text-xl flex items-center gap-2">
                  <span className="font-bold">η</span>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-2 border-foreground px-2 pb-0.5 text-base">Q × H × SG</span>
                    <span className="pt-0.5 text-base">367.2 × P<sub className="text-xs">s</sub></span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-base tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Efficiency
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="bg-muted px-4 py-3 border-b border-border relative z-10">
             <h2 className="font-bold text-base uppercase text-foreground">Calculation & Result (Efficiency)</h2>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4 relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">Given</h4>
              </div>
              <div className="p-3">
                <ul className="space-y-1.5 text-sm list-disc list-inside">
                  <li>
                    Flow Rate (Q) = <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded font-semibold">{flowRate || "?"} m³/h</span>
                  </li>
                  <li>
                    Differential Head (H) = <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded font-semibold">{differentialHead || "?"} m</span>
                  </li>
                  <li>
                    Specific Gravity (SG) = {specificGravity || "?"}
                  </li>
                  <li>
                    Shaft Power (P<sub>s</sub>) = {shaftPower || "?"} kW
                  </li>
                </ul>
              </div>
            </div>

            {/* To Find Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">To Find</h4>
              </div>
              <div className="p-3">
                <ul className="space-y-1 text-sm list-disc list-inside">
                  <li>Pump Efficiency (η) = ?</li>
                </ul>
              </div>
            </div>

            {/* Calculation Steps */}
            {result.calculated && result.steps && (
              <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="bg-muted px-3 py-2 border-b border-border">
                  <h4 className="font-bold text-foreground uppercase text-xs">Calculation</h4>
                </div>
                <div className="p-4 space-y-3">
                  {/* Step 1: Formula */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span className="font-bold">η</span>
                    <span>=</span>
                    <div className="inline-flex flex-col items-center text-center">
                      <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm">Q × H × SG</span>
                      <span className="pt-0.5 text-sm">367.2 × P<sub className="text-xs">s</sub></span>
                    </div>
                  </div>
                  
                  {/* Step 2: Substitution */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <div className="inline-flex flex-col items-center text-center">
                      <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm">
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{result.steps.q}</span>
                        {" × "}
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{result.steps.h}</span>
                        {" × "}
                        {result.steps.sg}
                      </span>
                      <span className="pt-0.5 text-sm">
                        367.2 × {result.steps.ps}
                      </span>
                    </div>
                  </div>
                  
                  {/* Step 3: Simplified */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <div className="inline-flex flex-col items-center text-center">
                      <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm">
                        {result.steps.numerator}
                      </span>
                      <span className="pt-0.5 text-sm">
                        {result.steps.denominator}
                      </span>
                    </div>
                  </div>
                  
                  {/* Step 4: Final Result as decimal */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <span className="font-bold">{result.steps.efficiencyDecimal}</span>
                  </div>
                  
                  {/* Step 5: Convert to percentage */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <span className="font-bold">{result.fullValue}%</span>
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
                   <div className="flex items-center justify-center gap-4">
                     <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     
                     <div className="flex items-center gap-3">
                       <h2 className="text-xl font-bold uppercase opacity-90">Result:</h2>
                       <div className="text-3xl font-black">
                         η = {result.value}%
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
