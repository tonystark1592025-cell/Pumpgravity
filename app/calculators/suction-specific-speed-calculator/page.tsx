"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { 
  convertToSI, 
  convertFromSI, // Imported to allow conversion backwards to US units
  flowUnits, 
  headUnits 
} from "@/lib/unit-conversions"
import { formatDisplayNumber } from "@/lib/number-formatter"

// Local constant for Speed Units
const speedUnits = [
  { value: "rpm", label: "RPM" }
]

export default function SuctionSpecificSpeedCalculator() {
  const { toast } = useToast()
  const[showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  const [speed, setSpeed] = useState<string>("")
  const[speedUnit, setSpeedUnit] = useState<string>("rpm")
  
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  
  const [npshr, setNpshr] = useState<string>("")
  const[npshrUnit, setNpshrUnit] = useState<string>("m")

  // New state to define Calculation Standard (SI vs US)
  const [resultStandard, setResultStandard] = useState<string>("si")
  
  const [copied, setCopied] = useState(false)

  // Validation states
  const [speedError, setSpeedError] = useState<string>("")
  const[flowError, setFlowError] = useState<string>("")
  const [npshrError, setNpshrError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    fullValue: string
    numerator: string
    denominator: string
    calculated: boolean
    steps: string[]
    unitStandard?: string
    qTargetLabel?: string
    hTargetLabel?: string
  }>({
    value: "",
    fullValue: "",
    numerator: "",
    denominator: "",
    calculated: false,
    steps:[]
  })

  // Validate Speed
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
      toast({ title: "Invalid Input", description: "Speed must be a positive number.", variant: "destructive" })
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
      toast({ title: "Invalid Input", description: "Flow rate must be a positive number.", variant: "destructive" })
    } else {
      setFlowError("")
    }
  }

  // Validate NPSHr
  const validateNpshr = (value: string) => {
    if (value === "") {
      setNpshrError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setNpshrError("Please enter a valid number")
    } else if (num <= 0) {
      setNpshrError("NPSHr must be positive")
      toast({ title: "Invalid Input", description: "NPSHr must be a positive number.", variant: "destructive" })
    } else {
      setNpshrError("")
    }
  }

  const handleSpeedChange = (value: string) => {
    setSpeed(value)
    validateSpeed(value)
    resetCalculation()
  }

  const handleFlowChange = (value: string) => {
    setFlowRate(value)
    validateFlow(value)
    resetCalculation()
  }

  const handleNpshrChange = (value: string) => {
    setNpshr(value)
    validateNpshr(value)
    resetCalculation()
  }

  // Auto-change flow and head input units based on result standard
  const handleStandardChange = (value: string) => {
    setResultStandard(value)
    if (value === "us") {
      // Find exact key for GPM (usually 'usgpm' or 'gpm')
      const hasUsGpm = flowUnits.some(u => u.value === 'usgpm')
      setFlowUnit(hasUsGpm ? "usgpm" : "gpm")
      setNpshrUnit("ft")
    } else {
      setFlowUnit("m3h")
      setNpshrUnit("m")
    }
    resetCalculation()
  }

  const copyResult = () => {
    const resultText = `Nss = ${result.value} ${result.unitStandard}`
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
        fullValue: "",
        numerator: "",
        denominator: "",
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
    const N_input = speed ? parseFloat(speed) : null
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const NPSHr_input = npshr ? parseFloat(npshr) : null

    if (speedError || flowError || npshrError) {
      toast({ title: "Validation Error", description: "Please fix all validation errors before calculating.", variant: "destructive" })
      setResult({ ...result, calculated: false, steps: ["Please fix validation errors before calculating"] })
      return
    }

    if (!N_input || !Q_input || !NPSHr_input) {
      setResult({ ...result, calculated: false, steps: ["Please enter all required values"] })
      return
    }

    if (N_input <= 0 || Q_input <= 0 || NPSHr_input <= 0) {
      toast({ title: "Invalid Input", description: "Values must be greater than zero.", variant: "destructive" })
      setResult({ ...result, calculated: false, steps: ["Input values must be greater than zero"] })
      return
    }

    // Convert inputs internally to strict base Metric to normalize everything
    const Q_base = convertToSI(Q_input, flowUnit, 'flow') // Usually m³/h
    const NPSHr_base = convertToSI(NPSHr_input, npshrUnit, 'head') // Usually meters

    let Q_target = Q_base
    let NPSHr_target = NPSHr_base
    let flowTargetLabel = 'm³/h'
    let headTargetLabel = 'm'

    // Convert to US Units if Selected
    if (resultStandard === 'us') {
      flowTargetLabel = 'GPM'
      headTargetLabel = 'ft'

      // Hardcoded constant multipliers as fallback
      Q_target = Q_base * 4.4028675393  // 1 m³/h = 4.4028675 US GPM
      NPSHr_target = NPSHr_base * 3.280839895 // 1 m = 3.28084 ft
      
      // Attempt clean conversion using lib functions if imported properly
      if (typeof convertFromSI === 'function') {
        try {
          const key = flowUnits.some(u => u.value === 'usgpm') ? 'usgpm' : 'gpm'
          const valQ = convertFromSI(Q_base, key, 'flow')
          if(!isNaN(valQ)) Q_target = valQ
        } catch(e) {}
        try {
          const valH = convertFromSI(NPSHr_base, 'ft', 'head')
          if(!isNaN(valH)) NPSHr_target = valH
        } catch(e) {}
      }
    }

    // Step 2: Calculate Nss -> Nss = (N × √Q) / (NPSHr^0.75) using targeted basis
    const sqrt_Q = Math.sqrt(Q_target)
    const numerator = N_input * sqrt_Q
    const denominator = Math.pow(NPSHr_target, 0.75)
    const nss_exact = numerator / denominator

    const flowUnitLabel = flowUnits.find(u => u.value === flowUnit)?.label || flowUnit
    const npshrUnitLabel = headUnits.find(u => u.value === npshrUnit)?.label || npshrUnit
    const unitString = resultStandard === 'us' ? 'US units' : 'SI units'

    const steps =[
      `Step 1: Convert internally to target standard units`,
      `  N = ${N_input} RPM`,
      `  Q = ${Q_input} ${flowUnitLabel} = ${Q_target.toFixed(2)} ${flowTargetLabel}`,
      `  NPSHr = ${NPSHr_input} ${npshrUnitLabel} = ${NPSHr_target.toFixed(2)} ${headTargetLabel}`,
      ``,
      `Step 2: Calculate using formula`,
      `  Nss = (N × √Q) / NPSHr^(3/4)`,
      `  Nss = (${N_input} × √${Q_target.toFixed(2)}) / ${NPSHr_target.toFixed(2)}^(3/4)`,
      `  Nss = ${numerator.toFixed(2)} / ${denominator.toFixed(4)}`,
      `  Nss ≈ ${nss_exact.toFixed(2)} ${unitString}`
    ]

    setResult({
      value: Math.round(nss_exact).toString(), // Rounded integer for main display
      fullValue: nss_exact.toFixed(2),         // 2 decimals for step display
      numerator: numerator.toFixed(2),
      denominator: denominator.toFixed(4),
      calculated: true,
      steps,
      unitStandard: unitString,
      qTargetLabel: flowTargetLabel,
      hTargetLabel: headTargetLabel
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
          Suction Specific Speed Calculator
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Smart Unit Conversion - Enter values in any unit!
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col w-full h-full">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-border">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Inputs & Parameters </h2>
          </div>

          <div className="p-4 space-y-4 flex flex-col flex-1">
            
            {/* Speed Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Speed (N):</label>
                <input
                  type="number"
                  value={speed}
                  onChange={e => handleSpeedChange(e.target.value)}
                  placeholder="100"
                  className={`flex-[2] min-w-0 border ${speedError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={speedUnit} onValueChange={(value) => { setSpeedUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[80px] border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:w-full font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {speedUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {speedError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{speedError}</span>
                </div>
              )}
            </div>

            {/* Flow Rate Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Flow Rate (Q):</label>
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => handleFlowChange(e.target.value)}
                  placeholder="100"
                  className={`flex-[2] min-w-0 border ${flowError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={flowUnit} onValueChange={(value) => { setFlowUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[80px] border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:w-full font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {flowUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value} className="text-sm">
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {flowError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{flowError}</span>
                </div>
              )}
            </div>

            {/* NPSHr Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">NPSHr:</label>
                <input
                  type="number"
                  value={npshr}
                  onChange={e => handleNpshrChange(e.target.value)}
                  placeholder="10"
                  className={`flex-[2] min-w-0 border ${npshrError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={npshrUnit} onValueChange={(value) => { setNpshrUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[80px] border border-border bg-background text-sm h-9 justify-center [&>span]:flex [&>span]:justify-center [&>span]:w-full font-medium">
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
              {npshrError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{npshrError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Result Standard:</label>
                <div className="flex-[2] min-w-0 flex gap-2">
                  <Select value={resultStandard} onValueChange={handleStandardChange}>
                    <SelectTrigger className="flex-1 min-w-0 border border-border bg-background text-sm h-9 justify-center [&>span]:flex[&>span]:justify-center [&>span]:w-full font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="si" className="text-sm">SI Units (m³/h, m)</SelectItem>
                      <SelectItem value="us" className="text-sm">US Units (GPM, ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[80px]"></div>
              </div>
            </div>

            {/* Universal Formula Display */}
            <div className="mt-auto mb-3 bg-muted/40 rounded-lg p-3 border border-border flex flex-col items-center shadow-sm">
              <h4 className="font-bold text-foreground mb-2 uppercase text-[10px] tracking-wider">Formula:</h4>
              <div className="font-serif text-lg flex items-center gap-2.5">
                <span className="font-bold italic">N<sub className="text-[11px] not-italic">ss</sub></span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-3 pb-1 text-[15px] font-medium tracking-wide flex items-center gap-1">
                    <span className="italic">N</span> &times; 
                    <span className="inline-flex items-center">
                      <span className="mr-0.5">&radic;</span>
                      <span className="border-t border-foreground px-0.5 italic">Q</span>
                    </span>
                  </span>
                  <span className="pt-1 text-[15px] font-medium">
                    NPSHr<sup className="text-[10px] ml-0.5">3/4</sup>
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate Suction Specific Speed
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
                <h4 className="font-bold text-foreground uppercase text-[11px]">Given</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">N</strong> 
                    <span className="text-foreground">= {speed || "?"} {speedUnits.find(u => u.value === speedUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">Q</strong> 
                    <span className="text-foreground">= {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">NPSHr</strong> 
                    <span className="text-foreground">= {npshr || "?"} {headUnits.find(u => u.value === npshrUnit)?.label}</span>
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
                  <strong className="text-blue-600 dark:text-blue-400 mr-1">N<sub className="text-[9px]">ss</sub></strong> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps - Always visible to prevent jumping */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm transition-all">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Calculation</h4>
              </div>
              
              {/* Step 1: Base SI Conversion - Collapsible */}
              <div className="border-b border-border">
                <button
                  onClick={() => setShowStep1(!showStep1)}
                  className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${showStep1 ? 'bg-muted/30' : ''}`}
                >
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Step 1: Convert to target standard units
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    <div>N = {speed || "?"} {speedUnits.find(u => u.value === speedUnit)?.label}</div>
                    <div>Q = {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label} = {result.calculated ? (result.steps[2]?.split('=')[2]?.trim() || "?") : "?"}</div>
                    <div>NPSHr = {npshr || "?"} {headUnits.find(u => u.value === npshrUnit)?.label} = {result.calculated ? (result.steps[3]?.split('=')[2]?.trim() || "?") : "?"}</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Calculate using formula */}
              <div className="p-4 overflow-x-auto">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">
                  Step 2: Calculate using formula
                </div>
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-5 gap-x-3 font-serif text-base min-w-max">
                  
                  {/* General Formula */}
                  <span className="font-bold italic text-right whitespace-nowrap">N<sub className="text-[11px] not-italic font-bold">ss</sub></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start">
                    <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap flex items-center gap-1">
                      <span className="italic">N</span> &times; 
                      <span className="inline-flex items-center">
                        <span className="mr-0.5">&radic;</span>
                        <span className="border-t border-foreground px-0.5 italic">Q</span>
                      </span>
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      NPSHr<sup className="text-[9px] ml-0.5">3/4</sup>
                    </span>
                  </div>
                  
                  {/* Formula with substitution and compact indicator */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-y-2">
                    
                    {/* The Fraction */}
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap flex items-center gap-1">
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="N (Speed)">
                          {result.calculated ? speed : "N"}
                        </span>
                        {" × "}
                        <span className="inline-flex items-center">
                          <span className="mr-0.5">&radic;</span>
                          <span className={`border-t border-foreground px-0.5 bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border-t-0 border border-dashed border-muted-foreground'}`} title={`Q (Flow in ${result.qTargetLabel || 'target unit'})`}>
                            {result.calculated && result.steps[2] ? (result.steps[2].split('=')[2]?.replace(result.qTargetLabel || '', '')?.trim() || "Q") : "Q"}
                          </span>
                        </span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded font-sans ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title={`NPSHr (in ${result.hTargetLabel || 'target unit'})`}>
                          {result.calculated && result.steps[3] ? (result.steps[3].split('=')[2]?.replace(result.hTargetLabel || '', '')?.trim() || "NPSHr") : "NPSHr"}
                        </span>
                        <sup className="text-[10px] ml-0.5 font-sans">3/4</sup>
                      </span>
                    </div>

                    {/* Highly Compact "Step 1" Indicator */}
                    {result.calculated && (
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
                  
                  {/* Simplified Numerator / Denominator */}
                  <span></span>
                  <span className="text-center">=</span>
                  <div className="flex flex-col items-center justify-self-start font-sans font-medium">
                    <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                      {result.calculated ? result.numerator : "?"}
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      {result.calculated ? result.denominator : "?"}
                    </span>
                  </div>

                  {/* Final Result in decimal */}
                  <span></span>
                  <span className="text-center font-bold">≈</span>
                  <span className={`font-bold text-base justify-self-start ${result.calculated ? 'font-sans' : 'text-muted-foreground'}`}>
                    {result.calculated ? `${result.fullValue} ${result.unitStandard}` : "?"}
                  </span>
                </div>
              </div>
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
                       <div className="text-2xl font-black truncate min-w-0 flex items-center gap-2" title={`Nss = ${result.value} ${result.unitStandard}`}>
                         <span>N<sub className="text-[14px] font-bold">ss</sub> = {formatDisplayNumber(result.value)}</span>
                         {result.unitStandard && <span className="text-[17px] font-bold opacity-85 uppercase tracking-wide">({result.unitStandard})</span>}
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