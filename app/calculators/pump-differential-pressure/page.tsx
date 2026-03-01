"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { 
  convertToSI, 
  headUnits 
} from "@/lib/unit-conversions"
import { multiply, divide, formatSignificant } from "@/lib/precision-math"
import { formatDisplayNumber } from "@/lib/number-formatter"

// Local constant for Pressure Units to ensure standalone functionality immediately
const pressureUnits =[
  { value: "bar", label: "bar" },
  { value: "psi", label: "psi" },
  { value: "kpa", label: "kPa" },
  { value: "mpa", label: "MPa" }
]

export default function PumpDifferentialPressureCalculator() {
  const { toast } = useToast()
  const [showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  
  const [resultUnit, setResultUnit] = useState<string>("bar")
  const [copied, setCopied] = useState(false)

  // Validation states
  const[headError, setHeadError] = useState<string>("")
  const [sgError, setSgError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string
    fullValue: string
    fullValueSI: string
    calculated: boolean
    steps: string[]
  }>({
    value: "",
    valueSI: "",
    fullValue: "",
    fullValueSI: "",
    calculated: false,
    steps:[]
  })

  // Validate Head
  const validateHead = (value: string) => {
    if (value === "") {
      setHeadError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setHeadError("Please enter a valid number")
    } else if (num === 0) {
      setHeadError("Head cannot be zero")
      toast({
        title: "Invalid Input",
        description: "Head cannot be zero. Please enter a valid value.",
        variant: "destructive",
      })
    } else if (num < 0) {
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
    } else if (num === 0) {
      setSgError("SG cannot be zero")
      toast({
        title: "Invalid Input",
        description: "Specific Gravity cannot be zero. Please enter a valid value.",
        variant: "destructive",
      })
    } else if (num < 0.01) {
      setSgError("SG must be at least 0.01")
    } else if (num > 23) {
      setSgError("SG cannot exceed 23")
    } else {
      setSgError("")
    }
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
    resetCalculation()
  }

  const handleHeadChange = (value: string) => {
    setHead(value)
    validateHead(value)
    resetCalculation()
  }

  const copyResult = () => {
    const displayValue = parseFloat(result.fullValue).toFixed(4)
    const resultText = `${displayValue} ${pressureUnits.find(u => u.value === resultUnit)?.label}`
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
        fullValueSI: "",
        calculated: false,
        steps:[]
      })
      toast({
        title: "Input Modified",
        description: "Please click Calculate again to see updated results.",
        variant: "default",
      })
    }
  }

  const handleCalculate = () => {
    const H_input = head ? parseFloat(head) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null

    if (headError || sgError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["Please fix validation errors before calculating"] })
      return
    }

    if (!H_input || !SG) {
      setResult({ ...result, calculated: false, steps:["Please enter all required values"] })
      return
    }

    if (H_input === 0 || SG === 0) {
      toast({
        title: "Invalid Input",
        description: "Values cannot be zero.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["Input values cannot be zero"] })
      return
    }

    // Step 1: Convert internally to base metric units (Head to meters)
    const H_SI = convertToSI(H_input, headUnit, 'head') 
    const H_m_str = H_SI.toString()

    // Step 2: Use differential pressure formula -> ΔP = (H × SG) / 10.2
    const numerator_str = multiply(H_m_str, SG.toString())
    const dp_bar_str = divide(numerator_str, '10.2')
    const dp_bar_val = parseFloat(dp_bar_str)

    // Step 3: Convert to Target Unit
    let final_output = dp_bar_val
    if (resultUnit === 'psi') final_output = dp_bar_val * 14.50377
    if (resultUnit === 'kpa') final_output = dp_bar_val * 100
    if (resultUnit === 'mpa') final_output = dp_bar_val * 0.1

    const headUnitLabel = headUnits.find(u => u.value === headUnit)?.label || headUnit
    const resultUnitLabel = pressureUnits.find(u => u.value === resultUnit)?.label || resultUnit

    const steps =[
      `Step 1: Convert internally to base metric units`,
      `  H = ${H_input} ${headUnitLabel} = ${formatSignificant(H_m_str, 6)} m`,
      `  SG = ${SG}`,
      ``,
      `Step 2: Calculate using standard formula (bar)`,
      `  ΔP = (H × SG) / 10.2`,
      `  ΔP = (${formatSignificant(H_m_str, 6)} × ${SG}) / 10.2`,
      `  ΔP = ${formatSignificant(numerator_str, 6)} / 10.2`,
      `  ΔP = ${formatSignificant(dp_bar_str, 6)} bar`,
      ...(resultUnit !== 'bar' ?[
        ``,
        `Step 3: Convert to ${resultUnitLabel}`,
        `  ΔP = ${formatSignificant(final_output.toString(), 6)} ${resultUnitLabel}`
      ] :[])
    ]

    setResult({
      value: final_output.toFixed(3),
      valueSI: dp_bar_val.toFixed(3),
      fullValue: final_output.toString(),
      fullValueSI: dp_bar_str,
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
          Pump Differential Pressure
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Standard Field Formula - Calculate Pressure from Head
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full h-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-border">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Inputs & Parameters </h2>
          </div>

          <div className="p-4 space-y-3.5 flex flex-col flex-1">
            
            {/* Differential Head Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-28 flex-shrink-0">Discharge Head (H):</label>
                <input
                  type="number"
                  value={head}
                  onChange={e => handleHeadChange(e.target.value)}
                  placeholder="77"
                  className={`flex-[2] min-w-0 border ${headError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={headUnit} onValueChange={(value) => { setHeadUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[80px] border border-border bg-background text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {headUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {headError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{headError}</span>
                </div>
              )}
            </div>

            {/* Density / Specific Gravity Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-28 flex-shrink-0">Specific Gravity (SG):</label>
                <div className="flex-[2] min-w-0 flex items-center gap-2">
                  <div className={`flex-1 flex items-center gap-1.5 border ${sgError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border bg-background'} rounded-md px-2.5 h-9 focus-within:border-blue-500 transition-colors shadow-sm`}>
                    <input 
                      type="number" 
                      value={specificGravity} 
                      onChange={e => handleSGChange(e.target.value)} 
                      placeholder="1.0"
                      step="0.01"
                      min="0.01"
                      max="23"
                      className="flex-1 w-full min-w-0 bg-transparent text-center text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[80px] text-[11px] text-muted-foreground text-center leading-tight">
                  {sgError ? "" : "Water = 1.0"}
                </div>
              </div>
              {sgError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{sgError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector */}
            <div className="flex items-center gap-2.5">
              <label className="font-semibold text-foreground text-xs w-28 flex-shrink-0">Result Unit:</label>
              <div className="flex-[2] min-w-0 flex gap-2">
                <Select value={resultUnit} onValueChange={(value) => { setResultUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center[&>span]:w-full font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {pressureUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[80px]"></div>
            </div>

            {/* Universal Formula Display */}
            <div className="mt-auto mb-3 bg-muted/40 rounded-lg p-3 border border-border flex flex-col items-center shadow-sm">
              <h4 className="font-bold text-foreground mb-2 uppercase text-[10px] tracking-wider">Formula:</h4>
              <div className="font-serif text-lg flex items-center gap-2.5">
                <span className="font-bold italic">ΔP</span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-2 pb-0.5 text-[15px] italic font-medium tracking-wide">H × SG</span>
                  <span className="pt-0.5 text-[15px] font-medium">10.2</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="bg-muted px-4 py-2.5 border-b border-border relative z-10">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Calculation & Result </h2>
          </div>

          <div className="p-3.5 flex-1 flex flex-col gap-3 relative z-10">
            
            {/* Given Data Section - Live Updating */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Given Data</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">H</strong> 
                    <span className="text-foreground">= {head || "?"} {headUnits.find(u => u.value === headUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">SG</strong> 
                    <span className="text-foreground">= {specificGravity || "?"}</span>
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
                  <strong className="text-blue-600 dark:text-blue-400 mr-1">ΔP</strong> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps - Always visible to prevent jumping */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm transition-all">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Calculation</h4>
              </div>
              
              {/* Step 1: Base Conversion - Collapsible */}
              <div className="border-b border-border">
                <button
                  onClick={() => setShowStep1(!showStep1)}
                  className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${showStep1 ? 'bg-muted/30' : ''}`}
                >
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Step 1: Convert internally to base units
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    <div>H = {head || "?"} {headUnits.find(u => u.value === headUnit)?.label} = {result.calculated ? (result.steps[1]?.split('=')[2]?.trim() || "?") : "?"} m</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Calculate using formula */}
              <div className="p-4 overflow-x-auto">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">Step 2: Calculate using standard formula</div>
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-4 gap-x-3 font-serif text-base">
                  
                  {/* Formula with substitution and compact indicator */}
                  <span className="font-bold italic text-right whitespace-nowrap">ΔP</span>
                  <span className="text-center">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-y-2">
                    
                    {/* The Fraction */}
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="H (Head in m)">
                          {result.calculated ? (result.steps[1]?.split('=')[2]?.replace('m', '')?.trim() || "H") : "H"}
                        </span>
                        {" × "}
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="SG (Specific Gravity)">
                          {result.calculated && specificGravity ? specificGravity : "SG"}
                        </span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        10.2
                      </span>
                    </div>
                    &nbsp; &nbsp; ...
                    {/* Highly Compact "Step 1" Indicator to prevent scrollbars */}
                    {result.calculated && (
                      <button 
                        onClick={() => setShowStep1(true)}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-sans text-[10px] font-semibold bg-blue-50/80 dark:bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all ml-2 focus:outline-none whitespace-nowrap"
                        title="View Step 1 conversions"
                      > 
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        From Step 1
                      </button>
                    )}

                  </div>
                  
                  {/* Simplified Numerator / Denominator */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start">
                    <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                      {result.calculated ? (result.steps[7]?.split('=')[1]?.split('/')[0]?.trim() || "...") : "?"}
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      10.2
                    </span>
                  </div>
                  
                  {/* Final Result in bar */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <span className={`font-bold text-base justify-self-start ${result.calculated && resultUnit === 'bar' ? 'text-blue-600 dark:text-blue-400' : (!result.calculated ? 'text-muted-foreground' : '')}`}>
                    {result.calculated ? `${result.valueSI} bar` : "? bar"}
                  </span>

                  {/* Final Result in custom unit if not bar */}
                  {result.calculated && resultUnit !== 'bar' && (
                    <>
                      <span></span>
                      <span className="text-center font-bold">=</span>
                      <span className="font-bold text-base justify-self-start text-blue-600 dark:text-blue-400">
                        {result.value} {pressureUnits.find(u => u.value === resultUnit)?.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Step 3: Unit Conversion (if not bar) */}
              {resultUnit !== 'bar' && (
                <div className="px-4 pb-3 border-t border-border">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 mt-3">Step 3: Convert to {pressureUnits.find(u => u.value === resultUnit)?.label}</div>
                  <div className="font-mono text-sm text-muted-foreground">
                    ΔP = {result.calculated ? <span className="text-foreground">{result.value}</span> : "?"} {pressureUnits.find(u => u.value === resultUnit)?.label}
                  </div>
                </div>
              )}
            </div>

            {/* Result Display - Fixed height to avoid layout shift */}
            <div className="mt-auto" ref={resultRef}>
              <div className={`rounded-lg px-5 py-3.5 text-white shadow-lg transition-all duration-500 relative flex items-center justify-center min-h-[68px] ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
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
                   <div className="flex items-center justify-center gap-3 overflow-hidden w-full px-8">
                     <div className="w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center flex-shrink-0">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     
                     <div className="flex items-center gap-2.5 min-w-0">
                       <h2 className="text-lg font-bold uppercase opacity-90 whitespace-nowrap">Result:</h2>
                       <div className="text-2xl font-black truncate min-w-0" title={`ΔP = ${result.value} ${pressureUnits.find(u => u.value === resultUnit)?.label}`}>
                         ΔP = {formatDisplayNumber(result.value)} <span className="text-xl">{pressureUnits.find(u => u.value === resultUnit)?.label}</span>
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