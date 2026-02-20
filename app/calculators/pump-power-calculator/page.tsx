"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check } from "lucide-react"
import { 
  convertToSI, 
  convertFromSI, 
  flowUnits, 
  headUnits, 
  powerUnits 
} from "@/lib/unit-conversions"
import { multiply, divide, formatSignificant } from "@/lib/precision-math"

export default function PumpPowerCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  const [efficiency, setEfficiency] = useState<string>("75")
  
  const [resultUnit, setResultUnit] = useState<string>("kw")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [flowError, setFlowError] = useState<string>("")
  const [headError, setHeadError] = useState<string>("")
  const [sgError, setSgError] = useState<string>("")
  const [efficiencyError, setEfficiencyError] = useState<string>("")

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
    steps: []
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
    } else if (num === 0) {
      setFlowError("Flow rate cannot be zero")
      toast({
        title: "Invalid Input",
        description: "Flow rate cannot be zero. Please enter a valid value.",
        variant: "destructive",
      })
    } else if (num < 0) {
      setFlowError("Flow rate must be positive")
    } else {
      setFlowError("")
    }
  }

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

  // Validate Efficiency
  const validateEfficiency = (value: string) => {
    if (value === "") {
      setEfficiencyError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setEfficiencyError("Please enter a valid number")
    } else if (num === 0) {
      setEfficiencyError("Efficiency cannot be zero")
      toast({
        title: "Invalid Input",
        description: "Efficiency cannot be zero. Please enter a valid value.",
        variant: "destructive",
      })
    } else if (num < 0.01) {
      setEfficiencyError("Efficiency must be at least 0.01%")
    } else if (num > 100) {
      setEfficiencyError("Efficiency cannot exceed 100%")
    } else {
      setEfficiencyError("")
    }
  }

  // Handle SG change
  const handleSGChange = (value: string) => {
    // Enforce maximum limit of 23
    const num = parseFloat(value)
    if (!isNaN(num) && num > 23) {
      setSpecificGravity("23")
      validateSG("23")
    } else {
      setSpecificGravity(value)
      validateSG(value)
    }
  }

  // Handle Efficiency change
  const handleEfficiencyChange = (value: string) => {
    // Allow empty string
    if (value === "") {
      setEfficiency(value)
      validateEfficiency(value)
      return
    }
    
    const num = parseFloat(value)
    
    // If value is greater than 100, cap at 100
    if (!isNaN(num) && num > 100) {
      setEfficiency("100")
      validateEfficiency("100")
    } else {
      setEfficiency(value)
      validateEfficiency(value)
    }
  }

  // Handle Flow Rate change
  const handleFlowChange = (value: string) => {
    setFlowRate(value)
    validateFlow(value)
  }

  // Handle Head change
  const handleHeadChange = (value: string) => {
    setHead(value)
    validateHead(value)
  }

  const copyResult = () => {
    // Use reasonable precision for copy (8 decimal places)
    const displayValue = parseFloat(result.fullValue).toFixed(8)
    const displayValueSI = parseFloat(result.fullValueSI).toFixed(8)
    const resultText = `Ps = ${displayValue} ${powerUnits.find(u => u.value === resultUnit)?.label} (${displayValueSI} kW)`
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: resultText,
    })
  }

  const handleCalculate = () => {
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const H_input = head ? parseFloat(head) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null
    const eta = efficiency ? parseFloat(efficiency) : null

    // Check for validation errors - STOP calculation if any errors exist
    if (flowError || headError || sgError || efficiencyError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      })
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Please fix validation errors before calculating"]
      })
      return
    }

    if (!Q_input || !H_input || !SG || !eta) {
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Please enter all required values"]
      })
      return
    }

    // Additional zero checks
    if (Q_input === 0) {
      toast({
        title: "Invalid Input",
        description: "Flow rate cannot be zero.",
        variant: "destructive",
      })
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Flow rate cannot be zero"]
      })
      return
    }

    if (H_input === 0) {
      toast({
        title: "Invalid Input",
        description: "Head cannot be zero.",
        variant: "destructive",
      })
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Head cannot be zero"]
      })
      return
    }

    if (eta === 0) {
      toast({
        title: "Invalid Input",
        description: "Efficiency cannot be zero.",
        variant: "destructive",
      })
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Efficiency cannot be zero"]
      })
      return
    }

    if (SG === 0) {
      toast({
        title: "Invalid Input",
        description: "Specific Gravity cannot be zero.",
        variant: "destructive",
      })
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Specific Gravity cannot be zero"]
      })
      return
    }

    if (eta < 0.01 || eta > 100) {
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Pump efficiency must be between 0.01% and 100%"]
      })
      return
    }

    if (SG < 0.01 || SG > 23) {
      setResult({
        value: "",
        valueSI: "",
        fullValue: "",
        fullValueSI: "",
        calculated: false,
        steps: ["Specific Gravity must be between 0.01 and 23"]
      })
      return
    }

    // Step 1: Convert inputs to SI units
    const Q_SI = convertToSI(Q_input, flowUnit, 'flow') // m³/h
    const H_SI = convertToSI(H_input, headUnit, 'head') // m

    // Step 2: Calculate in SI units using high-precision math
    // Formula: Ps = (Q × H × SG) / (367.2 × η)
    // Where η is efficiency as decimal (75% = 0.75)
    const etaDecimal = parseFloat(divide(eta.toString(), '100'))
    
    // Calculate numerator: Q × H × SG
    const qh = multiply(Q_SI.toString(), H_SI.toString())
    const numerator = multiply(qh, SG.toString())
    
    // Calculate denominator: 367.2 × η
    const denominator = multiply('367.2', etaDecimal.toString())
    
    // Calculate power: numerator / denominator
    const power_SI_str = divide(numerator, denominator)
    const power_SI = parseFloat(power_SI_str)

    // Step 3: Convert result to user's preferred unit
    const power_output = convertFromSI(power_SI, resultUnit, 'power')

    const flowUnitLabel = flowUnits.find(u => u.value === flowUnit)?.label || flowUnit
    const headUnitLabel = headUnits.find(u => u.value === headUnit)?.label || headUnit
    const resultUnitLabel = powerUnits.find(u => u.value === resultUnit)?.label || resultUnit

    const steps = [
      `Step 1: Convert to SI units`,
      `  Q = ${Q_input} ${flowUnitLabel} = ${formatSignificant(Q_SI.toString(), 6)} m³/h`,
      `  H = ${H_input} ${headUnitLabel} = ${formatSignificant(H_SI.toString(), 6)} m`,
      ``,
      `Step 2: Calculate in SI (kW)`,
      `  Ps = (Q × H × SG) / (367.2 × η)`,
      `  Ps = (${formatSignificant(Q_SI.toString(), 6)} × ${formatSignificant(H_SI.toString(), 6)} × ${SG}) / (367.2 × ${etaDecimal})`,
      `  Ps = ${formatSignificant(numerator, 6)} / ${formatSignificant(denominator, 6)}`,
      `  Ps = ${formatSignificant(power_SI_str, 6)} kW`,
      ``,
      `Step 3: Convert to ${resultUnitLabel}`,
      `  Ps = ${formatSignificant(power_output.toString(), 6)} ${resultUnitLabel}`
    ]

    setResult({
      value: parseFloat(power_output.toString()).toFixed(3),
      valueSI: parseFloat(power_SI_str).toFixed(3),
      fullValue: power_output.toString(),
      fullValueSI: power_SI_str,
      calculated: true,
      steps
    })

    // Scroll to result after a short delay to ensure DOM is updated
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
          Pump Power Calculator
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
             <h2 className="font-bold text-base uppercase text-foreground">Inputs & Parameters (Pump Power)</h2>
          </div>

          <div className="p-4 space-y-4 flex flex-col flex-1">
            
            {/* Flow Rate Input with Unit Selector - One Line */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-28 flex-shrink-0">Flow Rate (Q) :</label>
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => handleFlowChange(e.target.value)}
                  placeholder="100"
                  className={`flex-[2] min-w-0 border-2 ${flowError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={flowUnit} onValueChange={setFlowUnit}>
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

            {/* Differential Head Input with Unit Selector - One Line */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-28 flex-shrink-0">Head (H) :</label>
                <input
                  type="number"
                  value={head}
                  onChange={e => handleHeadChange(e.target.value)}
                  placeholder="50"
                  className={`flex-[2] min-w-0 border-2 ${headError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={headUnit} onValueChange={setHeadUnit}>
                  <SelectTrigger className="flex-1 min-w-[100px] border-2 border-border bg-background text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {headUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* Specific Gravity Input - One Line */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-28 flex-shrink-0">SG :</label>
                <div className="flex-[2] min-w-0 flex gap-2">
                  <input 
                    type="number" 
                    value={specificGravity} 
                    onChange={e => handleSGChange(e.target.value)} 
                    placeholder="1.0"
                    step="0.01"
                    min="0.01"
                    max="23"
                    className={`flex-1 min-w-0 border-2 ${sgError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                </div>
                <div className="flex-1 min-w-[100px] text-xs text-muted-foreground text-center">
                  {sgError ? "" : "0.01 to 23"}
                </div>
              </div>
              {sgError && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{sgError}</span>
                </div>
              )}
            </div>

            {/* Pump Efficiency Input - One Line */}
            <div>
              <div className="flex items-center gap-3">
                <label className="font-semibold text-foreground text-sm w-28 flex-shrink-0">Efficiency (η) :</label>
                <div className="flex-[2] min-w-0 flex gap-2">
                  <input 
                    type="number" 
                    value={efficiency} 
                    onChange={e => handleEfficiencyChange(e.target.value)} 
                    placeholder="75"
                    min="0.01"
                    max="100"
                    step="0.01"
                    className={`flex-1 min-w-0 border-2 ${efficiencyError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                </div>
                <div className="flex-1 min-w-[100px] text-xs text-muted-foreground text-center">
                  {efficiencyError ? "%" : "0.01 to 100%"}
                </div>
              </div>
              {efficiencyError && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{efficiencyError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector - One Line */}
            <div className="flex items-center gap-3">
              <label className="font-semibold text-foreground text-sm w-28 flex-shrink-0">Result Unit :</label>
              <div className="flex-[2] min-w-0 flex gap-2">
                <Select value={resultUnit} onValueChange={setResultUnit}>
                  <SelectTrigger className="flex-1 min-w-0 border-2 border-border bg-background text-base h-10 justify-center [&>span]:flex [&>span]:justify-center [&>span]:w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {powerUnits.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[100px]"></div>
            </div>

            {/* Formula Display */}
            <div className="mt-auto mb-4 bg-muted rounded-lg p-4 border-2 border-border">
              <h4 className="font-bold text-foreground mb-3 uppercase text-xs text-center">Formula:</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="font-serif text-xl flex items-center gap-2">
                  <span className="font-bold">P<sub className="text-xs">s</sub></span>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-2 border-foreground px-2 pb-0.5 text-base">Q × H × SG</span>
                    <span className="pt-0.5 text-base">367.2 × η</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-base tracking-wide shadow-md active:translate-y-0.5 transition-all uppercase"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="bg-muted px-4 py-3 border-b border-border relative z-10">
             <h2 className="font-bold text-base uppercase text-foreground">Calculation & Result (Shaft Power)</h2>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4 relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">Given Data</h4>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q</strong> 
                    <span className="text-foreground">= {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H</strong> 
                    <span className="text-foreground">= {head || "?"} {headUnits.find(u => u.value === headUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">SG</strong> 
                    <span className="text-foreground">= {specificGravity || "?"}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1.5">η</strong> 
                    <span className="text-foreground">= {efficiency ? (parseFloat(efficiency) / 100).toFixed(2) : "?"}</span>
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
                  <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P<sub className="text-xs">s</sub></strong> 
                  <span className="text-foreground">= ?</span>
                </div>
              </div>
            </div>

            {/* Calculation Steps - Vertical Layout */}
            {result.calculated && (
              <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="bg-muted px-3 py-2 border-b border-border">
                  <h4 className="font-bold text-foreground uppercase text-xs">Step-by-Step Calculation</h4>
                </div>
                <div className="p-4 space-y-3">
                  {/* Step 1: Substitution */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span className="font-bold">P<sub className="text-xs">s</sub></span>
                    <span>=</span>
                    <div className="inline-flex flex-col items-center text-center">
                      <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm">
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{result.steps[6]?.match(/\(([^×]+)/)?.[1]?.trim() || flowRate}</span>
                        {" × "}
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{result.steps[6]?.match(/× ([^×]+) ×/)?.[1]?.trim() || head}</span>
                        {" × "}
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{specificGravity}</span>
                      </span>
                      <span className="pt-0.5 text-sm">
                        {"367.2 × "}
                        <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{efficiency ? (parseFloat(efficiency) / 100).toFixed(2) : "?"}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Step 2: Simplified */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <div className="inline-flex flex-col items-center text-center">
                      <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm">
                        {result.steps[7]?.match(/= ([^/]+)/)?.[1]?.trim() || "..."}
                      </span>
                      <span className="pt-0.5 text-sm">
                        {result.steps[7]?.match(/\/ (.+)/)?.[1]?.trim() || "..."}
                      </span>
                    </div>
                  </div>
                  
                  {/* Step 3: Final Result */}
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <span>=</span>
                    <span className="font-bold">{result.valueSI} kW</span>
                  </div>
                  
                  {/* Step 4: Unit Conversion (if not kW) */}
                  {resultUnit !== 'kw' && (
                    <div className="flex items-center gap-3 font-serif text-lg">
                      <span>=</span>
                      <span className="font-bold">{result.value} {powerUnits.find(u => u.value === resultUnit)?.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result Display - Horizontal Layout */}
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
                         P<sub className="text-xl">s</sub> = {result.value} {powerUnits.find(u => u.value === resultUnit)?.label}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center">
                     <div className="text-base font-medium opacity-70 italic text-muted-foreground">
                       {result.steps[0] || "Enter values and click Calculate..."}
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






