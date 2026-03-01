"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { formatDisplayNumber } from "@/lib/number-formatter"

// Local constants
const pressureUnits =[
  { value: "bar", label: "bar" },
  { value: "psi", label: "psi" },
  { value: "kpa", label: "kPa" },
  { value: "mpa", label: "MPa" }
]

const headUnits =[
  { value: "m", label: "m" },
  { value: "ft", label: "ft" }
]

export default function PumpDifferentialHeadCalculator() {
  const { toast } = useToast()
  const [showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  const [pd, setPd] = useState<string>("")
  const [pdUnit, setPdUnit] = useState<string>("bar")

  const [ps, setPs] = useState<string>("")
  const [psUnit, setPsUnit] = useState<string>("bar")
  
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  
  const [resultUnit, setResultUnit] = useState<string>("m")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [pdError, setPdError] = useState<string>("")
  const [psError, setPsError] = useState<string>("")
  const [sgError, setSgError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string
    fullValue: string
    dpBar: string
    numerator: string
    calculated: boolean
    pdBarVal: string
    psBarVal: string
    steps: string[]
  }>({
    value: "",
    valueSI: "",
    fullValue: "",
    dpBar: "",
    numerator: "",
    pdBarVal: "",
    psBarVal: "",
    calculated: false,
    steps:[]
  })

  // Validate Pressures
  const validatePressure = (value: string, setErr: (msg: string) => void) => {
    if (value === "") {
      setErr("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setErr("Invalid number")
    } else {
      setErr("")
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
      setSgError("Invalid number")
    } else if (num === 0) {
      setSgError("Cannot be zero")
      toast({
        title: "Invalid Input",
        description: "Specific Gravity cannot be zero.",
        variant: "destructive",
      })
    } else if (num < 0.01) {
      setSgError("Min 0.01")
    } else if (num > 23) {
      setSgError("Max 23")
    } else {
      setSgError("")
    }
  }

  const handlePdChange = (value: string) => {
    setPd(value)
    validatePressure(value, setPdError)
    resetCalculation()
  }

  const handlePsChange = (value: string) => {
    setPs(value)
    validatePressure(value, setPsError)
    resetCalculation()
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

  const copyResult = () => {
    const displayValue = parseFloat(result.fullValue).toFixed(2)
    const resultText = `${displayValue} ${headUnits.find(u => u.value === resultUnit)?.label}`
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
        dpBar: "",
        numerator: "",
        pdBarVal: "",
        psBarVal: "",
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

  // Internal helper to get pressure to Bar
  const toBar = (val: number, unit: string) => {
    if (unit === 'psi') return val / 14.50377
    if (unit === 'kpa') return val / 100
    if (unit === 'mpa') return val * 10
    return val
  }

  const handleCalculate = () => {
    const Pd_input = pd ? parseFloat(pd) : null
    const Ps_input = ps ? parseFloat(ps) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null

    if (pdError || psError || sgError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["Please fix validation errors before calculating"] })
      return
    }

    if (Pd_input === null || Ps_input === null || !SG) {
      setResult({ ...result, calculated: false, steps:["Please enter all required values"] })
      return
    }

    if (SG === 0) {
      toast({
        title: "Invalid Input",
        description: "Specific Gravity cannot be zero.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["SG cannot be zero"] })
      return
    }

    // Step 1: Convert to Bar for the standard 10.2 constant formula
    const pd_bar = toBar(Pd_input, pdUnit)
    const ps_bar = toBar(Ps_input, psUnit)

    // Step 2: Use Differential Head formula -> H(m) = ((Pd - Ps) * 10.2) / SG
    const dp = pd_bar - ps_bar
    const numerator = dp * 10.2
    const h_meters = numerator / SG

    // Step 3: Convert output if needed
    let final_output = h_meters
    if (resultUnit === 'ft') {
      final_output = h_meters * 3.28084
    }

    const pdUnitLabel = pressureUnits.find(u => u.value === pdUnit)?.label || pdUnit
    const psUnitLabel = pressureUnits.find(u => u.value === psUnit)?.label || psUnit
    const resultUnitLabel = headUnits.find(u => u.value === resultUnit)?.label || resultUnit

    const steps =[
      `Step 1: Convert internally to base metric units (bar)`,
      `  Pd = ${Pd_input} ${pdUnitLabel} = ${pd_bar.toFixed(4)} bar`,
      `  Ps = ${Ps_input} ${psUnitLabel} = ${ps_bar.toFixed(4)} bar`,
      `  SG = ${SG}`,
      ``,
      `Step 2: Calculate using standard formula (meters)`,
      `  H = ((Pd - Ps) × 10.2) / SG`,
      `  H = ((${pd_bar.toFixed(2)} - ${ps_bar.toFixed(2)}) × 10.2) / ${SG}`,
      `  H = (${dp.toFixed(2)} × 10.2) / ${SG}`,
      `  H = ${numerator.toFixed(2)} / ${SG}`,
      `  H = ${h_meters.toFixed(2)} m`,
      ...(resultUnit !== 'm' ?[
        ``,
        `Step 3: Convert to ${resultUnitLabel}`,
        `  H = ${final_output.toFixed(2)} ${resultUnitLabel}`
      ] :[])
    ]

    setResult({
      value: final_output.toFixed(2),
      valueSI: h_meters.toFixed(2),
      fullValue: final_output.toString(),
      dpBar: dp.toFixed(2),
      numerator: numerator.toFixed(2),
      pdBarVal: pd_bar.toFixed(2),
      psBarVal: ps_bar.toFixed(2),
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
          Pump Differential Head <span className="text-muted-foreground text-lg">(From Pressure)</span>
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Standard Field Formula - Calculate Head from Pressure
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full h-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-border">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Inputs & Parameters <span className="opacity-70 normal-case text-xs font-medium tracking-normal">(Pump Differential Head)</span></h2>
          </div>

          <div className="p-4 space-y-3.5 flex flex-col flex-1">
            
            {/* 
                Structure: Fixed Label (w-36) | Fluid Input (flex-1) | Fixed Unit (w-[90px]) 
                This ensures perfect vertical alignment of columns.
            */}

            {/* Discharge Pressure Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Discharge Pressure (P<sub>d</sub>):</label>
                <input
                  type="number"
                  value={pd}
                  onChange={e => handlePdChange(e.target.value)}
                  placeholder="6.0"
                  className={`flex-1 min-w-0 border ${pdError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={pdUnit} onValueChange={(value) => { setPdUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
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
              {pdError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{pdError}</span>
                </div>
              )}
            </div>

            {/* Suction Pressure Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Suction Pressure (P<sub>s</sub>):</label>
                <input
                  type="number"
                  value={ps}
                  onChange={e => handlePsChange(e.target.value)}
                  placeholder="0.5"
                  className={`flex-1 min-w-0 border ${psError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <Select value={psUnit} onValueChange={(value) => { setPsUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="w-[90px] flex-shrink-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
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
              {psError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{psError}</span>
                </div>
              )}
            </div>

            {/* Specific Gravity Input */}
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Specific Gravity (SG):</label>
                <input
                  type="number"
                  value={specificGravity}
                  onChange={e => handleSGChange(e.target.value)}
                  placeholder="1.0"
                  step="0.01"
                  min="0.01"
                  max="23"
                  className={`flex-1 min-w-0 border ${sgError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors shadow-sm`}
                />
                <div className="w-[90px] flex-shrink-0 border border-border bg-muted/40 rounded-md h-9 flex items-center justify-center text-sm font-semibold text-muted-foreground shadow-sm">
                  SG
                </div>
              </div>
              {sgError && (
                <div className="mt-1 ml-36 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <span className="font-medium">{sgError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector - Matched Alignment */}
            <div className="flex items-center gap-2">
              <label className="font-semibold text-foreground text-xs w-36 flex-shrink-0">Result Unit:</label>
              <Select value={resultUnit} onValueChange={(value) => { setResultUnit(value); resetCalculation(); }}>
                <SelectTrigger className="flex-1 min-w-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:items-center [&>span]:w-full font-medium shadow-sm">
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
              {/* Empty placeholder to match the Unit Column width perfectly */}
              <div className="w-[90px] flex-shrink-0"></div> 
            </div>

            {/* Formula Display */}
            <div className="mt-auto mb-3 bg-muted/40 rounded-lg p-3 border border-border flex flex-col items-center shadow-sm">
              <h4 className="font-bold text-foreground mb-2 uppercase text-[10px] tracking-wider">Formula:</h4>
              <div className="font-serif text-lg flex items-center gap-2.5">
                <span className="font-bold italic">H(m)</span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-2 pb-0.5 text-[15px] italic font-medium tracking-wide">
                    (P<sub>d</sub> - P<sub>s</sub>) × 10.2
                  </span>
                  <span className="pt-0.5 text-[15px] italic font-medium">SG</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Differential Head
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="bg-muted px-4 py-2.5 border-b border-border relative z-10">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Calculation & Result <span className="opacity-70 normal-case text-xs font-medium tracking-normal">(Pump Differential Head)</span></h2>
          </div>

          <div className="p-3.5 flex-1 flex flex-col gap-3 relative z-10">
            
            {/* Given Data Section - Correct Box Style */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Given Data</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">P<sub>d</sub></strong> 
                    <span className="text-foreground">= {pd || "?"} {pressureUnits.find(u => u.value === pdUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">P<sub>s</sub></strong> 
                    <span className="text-foreground">= {ps || "?"} {pressureUnits.find(u => u.value === psUnit)?.label}</span>
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
                  <span className="text-foreground mr-1">Differential Head (<strong className="text-blue-600 dark:text-blue-400">H</strong>)</span> 
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
                    Step 1: Convert internally to bar (if needed)
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    <div>P<sub>d</sub> = {pd || "?"} {pressureUnits.find(u => u.value === pdUnit)?.label} = {result.calculated ? `${result.pdBarVal} bar` : "?"}</div>
                    <div>P<sub>s</sub> = {ps || "?"} {pressureUnits.find(u => u.value === psUnit)?.label} = {result.calculated ? `${result.psBarVal} bar` : "?"}</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Calculate using formula */}
              <div className="p-4 overflow-x-auto">
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-4 gap-x-3 font-serif text-base">
                  
                  {/* Row 1: General Formula */}
                  <span className="font-bold italic text-right whitespace-nowrap">H</span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start">
                    <span className="border-b border-foreground px-4 pb-1 text-sm whitespace-nowrap italic">
                      (P<sub>d</sub> - P<sub>s</sub>) × 10.2
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap italic">
                      SG
                    </span>
                  </div>
                  
                  {/* Row 2: Substituted Values */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-y-2">
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-4 pb-1 text-sm whitespace-nowrap">
                        <span className="font-sans">(</span>
                        <span className={`bg-orange-100 dark:bg-orange-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Pd (Discharge Pressure in bar)">
                          {result.calculated ? result.pdBarVal : "Pd"}
                        </span>
                        <span className="font-sans mx-1">-</span>
                        <span className={`bg-orange-100 dark:bg-orange-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Ps (Suction Pressure in bar)">
                          {result.calculated ? result.psBarVal : "Ps"}
                        </span>
                        <span className="font-sans">)</span>
                        <span className="font-sans mx-1">×</span>
                        <span className="font-sans">10.2</span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        <span className={`bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="SG (Specific Gravity)">
                          {result.calculated ? specificGravity : "SG"}
                        </span>
                      </span>
                    </div>

                    {/* Step 1 Indicator */}
                    {result.calculated && (pdUnit !== 'bar' || psUnit !== 'bar') && (
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
                  
                  {/* Row 3: Subtracted Math Step */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start font-sans">
                    <span className="border-b border-foreground px-4 pb-1 text-sm whitespace-nowrap">
                      {result.calculated ? `${result.dpBar} * 10.2` : "?"}
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      {result.calculated ? specificGravity : "?"}
                    </span>
                  </div>

                  {/* Row 4: Numerator Solved Step */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start font-sans">
                    <span className="border-b border-foreground px-4 pb-1 text-sm whitespace-nowrap">
                      {result.calculated ? result.numerator : "?"}
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      {result.calculated ? specificGravity : "?"}
                    </span>
                  </div>
                  
                  {/* Final Result in meters */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <span className={`font-bold text-base justify-self-start ${result.calculated && resultUnit === 'm' ? 'text-blue-600 dark:text-blue-400 font-sans' : (!result.calculated ? 'text-muted-foreground' : 'font-sans')}`}>
                    {result.calculated ? `${result.valueSI} m` : "? m"}
                  </span>

                  {/* Final Result in custom unit if not meters */}
                  {result.calculated && resultUnit !== 'm' && (
                    <>
                      <span></span>
                      <span className="text-center font-bold">=</span>
                      <span className="font-bold text-base justify-self-start text-blue-600 dark:text-blue-400 font-sans">
                        {result.value} {headUnits.find(u => u.value === resultUnit)?.label}
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
                       <div className="text-xl md:text-2xl font-bold truncate min-w-0" title={`H = ${result.value} ${headUnits.find(u => u.value === resultUnit)?.label}`}>
                         H = {formatDisplayNumber(result.value)} <span className="text-lg md:text-xl font-medium">{headUnits.find(u => u.value === resultUnit)?.label}</span>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-sm font-medium opacity-70 italic text-muted-foreground">
                     Enter values and click Calculate Differential Head...
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