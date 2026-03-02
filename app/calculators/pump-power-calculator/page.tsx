"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ChevronDown } from "lucide-react"
import { 
  convertToSI, 
  convertFromSI, 
  flowUnits, 
  headUnits, 
  powerUnits 
} from "@/lib/unit-conversions"
import { multiply, divide, formatSignificant } from "@/lib/precision-math"
import { formatDisplayNumber } from "@/lib/number-formatter"

export default function PumpPowerCalculator() {
  const { toast } = useToast()
  const [showStep1, setShowStep1] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const[flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  
  const[specificGravity, setSpecificGravity] = useState<string>("1.0")
  const[efficiency, setEfficiency] = useState<string>("75")
  
  const [resultUnit, setResultUnit] = useState<string>("kw")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [flowError, setFlowError] = useState<string>("")
  const[headError, setHeadError] = useState<string>("")
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
    steps:[]
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

  const handleEfficiencyChange = (value: string) => {
    if (value === "") {
      setEfficiency(value)
      validateEfficiency(value)
      resetCalculation()
      return
    }
    const num = parseFloat(value)
    if (!isNaN(num) && num > 100) {
      setEfficiency("100")
      validateEfficiency("100")
    } else {
      setEfficiency(value)
      validateEfficiency(value)
    }
    resetCalculation()
  }

  const handleFlowChange = (value: string) => {
    setFlowRate(value)
    validateFlow(value)
    resetCalculation()
  }

  const handleHeadChange = (value: string) => {
    setHead(value)
    validateHead(value)
    resetCalculation()
  }

  const copyResult = () => {
    const displayValue = parseFloat(result.fullValue).toFixed(8)
    const resultText = `${displayValue} ${powerUnits.find(u => u.value === resultUnit)?.label}`
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
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const H_input = head ? parseFloat(head) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null
    const eta = efficiency ? parseFloat(efficiency) : null

    if (flowError || headError || sgError || efficiencyError) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["Please fix validation errors before calculating"] })
      return
    }

    if (!Q_input || !H_input || !SG || !eta) {
      setResult({ ...result, calculated: false, steps: ["Please enter all required values"] })
      return
    }

    if (Q_input === 0 || H_input === 0 || eta === 0 || SG === 0) {
      toast({
        title: "Invalid Input",
        description: "Values cannot be zero.",
        variant: "destructive",
      })
      setResult({ ...result, calculated: false, steps: ["Input values cannot be zero"] })
      return
    }

    // Step 1: Convert to SI (m³/s, meters, kg/m³)
    const Q_SI = convertToSI(Q_input, flowUnit, 'flow') 
    const Q_m3s = divide(Q_SI.toString(), '3600') 
    const H_SI = convertToSI(H_input, headUnit, 'head') 

    const rho = multiply('1000', SG.toString()) 
    const g = '9.81' 
    const etaDecimal = parseFloat(divide(eta.toString(), '100'))

    // Step 2: Use universal formula -> P = (ρ × g × Q × H) / η (This gives WATTs)
    const rho_g = multiply(rho, g)
    const Q_H = multiply(Q_m3s, H_SI.toString())
    const numerator_W = multiply(rho_g, Q_H)
    
    const power_W_str = divide(numerator_W, etaDecimal.toString())
    
    // Step 3: Base SI requirement for Engineering is often kW
    const power_SI_str = divide(power_W_str, '1000') 
    const power_SI = parseFloat(power_SI_str)

    // Step 4: Convert result to user's preferred unit from kW
    const power_output = convertFromSI(power_SI, resultUnit, 'power')

    const flowUnitLabel = flowUnits.find(u => u.value === flowUnit)?.label || flowUnit
    const headUnitLabel = headUnits.find(u => u.value === headUnit)?.label || headUnit
    const resultUnitLabel = powerUnits.find(u => u.value === resultUnit)?.label || resultUnit

    const steps =[
      `Step 1: Convert to base SI units internally`,
      `  Q = ${Q_input} ${flowUnitLabel} = ${formatSignificant(Q_m3s, 6)} m³/s`,
      `  H = ${H_input} ${headUnitLabel} = ${formatSignificant(H_SI.toString(), 6)} m`,
      `  ρ = 1000 × ${SG} = ${rho} kg/m³`,
      ``,
      `Step 2: Calculate using universal formula (Watts)`,
      `  P = (ρgQH) / η`,
      `  P = (${rho} × 9.81 × ${formatSignificant(Q_m3s, 6)} × ${formatSignificant(H_SI.toString(), 6)}) / ${etaDecimal}`,
      `  P = ${formatSignificant(numerator_W, 6)} / ${etaDecimal}`,
      `  P = ${formatSignificant(power_W_str, 6)} W`,
      ``,
      `Step 3: Convert to kW`,
      `  P = ${formatSignificant(power_SI_str, 6)} kW`,
      ...(resultUnit !== 'kw' ?[
        ``,
        `Step 4: Convert to ${resultUnitLabel}`,
        `  P = ${formatSignificant(power_output.toString(), 6)} ${resultUnitLabel}`
      ] :[])
    ]

    setResult({
      value: parseFloat(power_output.toString()).toFixed(3),
      valueSI: parseFloat(power_SI_str).toFixed(3),
      fullValue: power_output.toString(),
      fullValueSI: power_SI_str,
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
          Pump Power Calculator
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px] md:text-xs font-medium text-blue-700 dark:text-blue-300">
            Universal Formula Edition - Smart Unit Conversion
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
            
            {/* Flow Rate Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Flow Rate (Q):</label>
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => handleFlowChange(e.target.value)}
                  placeholder="100"
                  className={`flex-[2] min-w-0 border ${flowError ?'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Select value={flowUnit} onValueChange={(value) => { setFlowUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-[80px] border border-border bg-background text-sm h-9">
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

            {/* Differential Head Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Head (H):</label>
                <input
                  type="number"
                  value={head}
                  onChange={e => handleHeadChange(e.target.value)}
                  placeholder="5"
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

            {/* Gravity Input (Constant) */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Gravity (g):</label>
                <div className="flex-[2] min-w-0">
                  <input 
                    type="text" 
                    value="9.81" 
                    readOnly
                    className="w-full border border-border bg-muted/50 rounded-md px-3 h-9 text-center text-sm text-muted-foreground cursor-not-allowed font-medium"
                  />
                </div>
                <div className="flex-1 min-w-[80px] text-xs text-muted-foreground text-center font-medium">
                  m/s²
                </div>
              </div>
            </div>

            {/* Pump Efficiency Input */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Efficiency (η):</label>
                <div className="flex-[2] min-w-0 flex gap-2">
                  <input 
                    type="number" 
                    value={efficiency} 
                    onChange={e => handleEfficiencyChange(e.target.value)} 
                    placeholder="75"
                    min="0.01"
                    max="100"
                    step="0.01"
                    className={`flex-1 min-w-0 border ${efficiencyError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-3 h-9 text-center text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                </div>
                <div className="flex-1 min-w-[80px] text-[11px] text-muted-foreground text-center">
                  {efficiencyError ? "%" : "0.01 to 100%"}
                </div>
              </div>
              {efficiencyError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{efficiencyError}</span>
                </div>
              )}
            </div>

            {/* Density / Specific Gravity Input - REFACTORED FOR ALIGNMENT */}
            <div>
              <div className="flex items-center gap-2.5">
                <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Density (ρ):</label>
                {/* Modified container to look like a single input group matching width of other inputs */}
                <div className={`flex-[2] min-w-0 flex items-center border ${sgError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border bg-background'} rounded-md h-9 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors overflow-hidden`}>
                  <div className="flex items-center justify-center bg-muted/40 border-r border-border h-full px-3">
                    <span className="text-muted-foreground font-semibold text-xs whitespace-nowrap">1000 ×</span>
                  </div>
                  <div className="flex-1 flex items-center h-full pl-2">
                    <span className="text-foreground font-semibold text-xs whitespace-nowrap mr-1">SG:</span>
                    <input 
                      type="number" 
                      value={specificGravity} 
                      onChange={e => handleSGChange(e.target.value)} 
                      placeholder="1.0"
                      step="0.01"
                      min="0.01"
                      max="23"
                      className="flex-1 w-full min-w-0 bg-transparent text-center text-sm font-medium focus:outline-none h-full"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[80px] text-[11px] text-muted-foreground text-center leading-tight">
                  {sgError ? "" : "SG: 0.01 to 23"}
                </div>
              </div>
              {sgError && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-medium">{sgError}</span>
                </div>
              )}
            </div>

            {/* Result Unit Selector - FIX CENTER ALIGNMENT */}
            <div className="flex items-center gap-2.5">
              <label className="font-semibold text-foreground text-xs w-24 flex-shrink-0">Result Unit:</label>
              <div className="flex-[2] min-w-0 flex gap-2">
                <Select value={resultUnit} onValueChange={(value) => { setResultUnit(value); resetCalculation(); }}>
                  <SelectTrigger className="flex-1 min-w-0 border border-border bg-background text-sm h-9 justify-center text-center font-medium [&>span]:w-full [&>span]:text-center [&>svg]:ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {powerUnits.map((u) => (
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
              <h4 className="font-bold text-foreground mb-2 uppercase text-[10px] tracking-wider">Universal Formula:</h4>
              <div className="font-serif text-lg flex items-center gap-2.5">
                <span className="font-bold italic">P</span>
                <span>=</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-foreground px-2 pb-0.5 text-[15px] italic font-medium tracking-wide">ρgQH</span>
                  <span className="pt-0.5 text-[15px] italic font-medium">η</span>
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
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">Q</strong> 
                    <span className="text-foreground">= {flowRate || "?"}</span>
                    <span className="text-muted-foreground ml-1">{flowUnits.find(u => u.value === flowUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">H</strong> 
                    <span className="text-foreground">= {head || "?"}</span>
                    <span className="text-muted-foreground ml-1">{headUnits.find(u => u.value === headUnit)?.label}</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">g</strong> 
                    <span className="text-foreground">= 9.81</span>
                    <span className="text-muted-foreground ml-1">m/s²</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">ρ</strong> 
                    <span className="text-foreground">= {specificGravity && !isNaN(parseFloat(specificGravity)) ? (parseFloat(specificGravity) * 1000).toFixed(0) : "?"}</span>
                    <span className="text-muted-foreground ml-1">kg/m³</span>
                  </div>
                  <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">η</strong> 
                    <span className="text-foreground">= {efficiency && !isNaN(parseFloat(efficiency)) ? (parseFloat(efficiency) / 100).toFixed(2) : "?"}</span>
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
                  <strong className="text-blue-600 dark:text-blue-400 mr-1">P</strong> 
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
                    Step 1: Convert internally to base SI units
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                </button>
                {showStep1 && (
                  <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                    {/* FIX: Removed manually added units at the end of the line since the result string already contains them */}
                    <div>Q = {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label} = {result.calculated ? (result.steps[1]?.split('=')[2]?.trim() || "?") : "?"}</div>
                    <div>H = {head || "?"} {headUnits.find(u => u.value === headUnit)?.label} = {result.calculated ? (result.steps[2]?.split('=')[2]?.trim() || "?") : "?"}</div>
                    <div>ρ = 1000 × {specificGravity || "?"} = {result.calculated ? (result.steps[3]?.split('=')[2]?.trim() || "?") : "?"}</div>
                  </div>
                )}
              </div>
              
              {/* Step 2: Calculate using formula */}
              <div className="p-4 overflow-x-auto">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">Step 2: Calculate using universal formula</div>
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-4 gap-x-3 font-serif text-base">
                  
                  {/* Formula with substitution and compact indicator */}
                  <span className="font-bold italic text-right whitespace-nowrap">P</span>
                  <span className="text-center">=</span>
                  <div className="flex flex-wrap items-center justify-self-start gap-y-2">
                    
                    {/* The Fraction */}
                    <div className="flex flex-col items-center">
                      <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap">
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="ρ (Density)">
                          {result.calculated && specificGravity ? (parseFloat(specificGravity) * 1000).toString() : "ρ"}
                        </span>
                        {" × "}
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="g (Gravity)">
                          9.81
                        </span>
                        {" × "}
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="Q (Flow in m³/s)">
                          {result.calculated ? (result.steps[1]?.split('=')[2]?.replace('m³/s', '')?.trim() || "Q") : "Q"}
                        </span>
                        {" × "}
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="H (Head in m)">
                          {result.calculated ? (result.steps[2]?.split('=')[2]?.replace('m', '')?.trim() || "H") : "H"}
                        </span>
                      </span>
                      <span className="pt-1 text-sm whitespace-nowrap">
                        <span className={`bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded ${!result.calculated && 'italic font-medium text-muted-foreground bg-transparent border border-dashed border-muted-foreground'}`} title="η (Efficiency)">
                          {result.calculated && efficiency ? (parseFloat(efficiency) / 100).toFixed(4).replace(/\.?0+$/, '') : "η"}
                        </span>
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
                      {result.calculated ? (result.steps[8]?.split('=')[1]?.split('/')[0]?.trim() || "...") : "?"}
                    </span>
                    <span className="pt-1 text-sm whitespace-nowrap">
                      {result.calculated ? (result.steps[8]?.split('=')[1]?.split('/')[1]?.trim() || "...") : "?"}
                    </span>
                  </div>
                  
                  {/* Final Result in Watts */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <span className={`font-bold text-base justify-self-start ${!result.calculated && 'text-muted-foreground'}`}>
                    {result.calculated ? (result.steps[9]?.split('=')[1]?.trim() || "...") : "? W"}
                  </span>

                  {/* Final Result in kW */}
                  <span></span>
                  <span className="text-center font-bold">=</span>
                  <span className={`font-bold text-base justify-self-start ${result.calculated ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                    {result.calculated ? `${result.valueSI} kW` : "? kW"}
                  </span>
                </div>
              </div>
              
              {/* Step 3: Unit Conversion (if not kW) */}
              {resultUnit !== 'kw' && (
                <div className="px-4 pb-3 border-t border-border">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 mt-3">Step 3: Convert to {powerUnits.find(u => u.value === resultUnit)?.label}</div>
                  <div className="font-mono text-sm text-muted-foreground">
                    P = {result.calculated ? <span className="text-foreground">{result.value}</span> : "?"} {powerUnits.find(u => u.value === resultUnit)?.label}
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
                       <div className="text-2xl font-black truncate min-w-0" title={`P = ${result.value} ${powerUnits.find(u => u.value === resultUnit)?.label}`}>
                         P = {formatDisplayNumber(result.value)} <span className="text-xl">{powerUnits.find(u => u.value === resultUnit)?.label}</span>
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