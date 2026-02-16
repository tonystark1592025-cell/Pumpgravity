"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  convertToSI, 
  convertFromSI, 
  flowUnits, 
  headUnits, 
  powerUnits 
} from "@/lib/unit-conversions"
import { multiply, divide, formatSignificant } from "@/lib/precision-math"

export default function PumpPowerCalculator() {
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  const [efficiency, setEfficiency] = useState<string>("75")
  
  const [resultUnit, setResultUnit] = useState<string>("kw")

  // Validation states
  const [sgError, setSgError] = useState<string>("")
  const [efficiencyError, setEfficiencyError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string
    calculated: boolean
    steps: string[]
  }>({
    value: "",
    valueSI: "",
    calculated: false,
    steps: []
  })

  // Validate Specific Gravity
  const validateSG = (value: string) => {
    if (value === "") {
      setSgError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setSgError("Please enter a valid number")
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
    setSpecificGravity(value)
    validateSG(value)
  }

  // Handle Efficiency change
  const handleEfficiencyChange = (value: string) => {
    setEfficiency(value)
    validateEfficiency(value)
  }

  const handleCalculate = () => {
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const H_input = head ? parseFloat(head) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null
    const eta = efficiency ? parseFloat(efficiency) : null

    // Check for validation errors
    if (sgError || efficiencyError) {
      setResult({
        value: "",
        valueSI: "",
        calculated: false,
        steps: ["Please fix validation errors before calculating"]
      })
      return
    }

    if (!Q_input || !H_input || !SG || !eta) {
      setResult({
        value: "",
        valueSI: "",
        calculated: false,
        steps: ["Please enter all required values"]
      })
      return
    }

    if (eta < 0.01 || eta > 100) {
      setResult({
        value: "",
        valueSI: "",
        calculated: false,
        steps: ["Pump efficiency must be between 0.01% and 100%"]
      })
      return
    }

    if (SG < 0.01 || SG > 23) {
      setResult({
        value: "",
        valueSI: "",
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
      value: formatSignificant(power_output.toString(), 6),
      valueSI: formatSignificant(power_SI_str, 6),
      calculated: true,
      steps
    })
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

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel - Inputs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col">
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-3 border-b border-border">
             <h2 className="font-bold text-base uppercase text-foreground">Inputs & Parameters (Pump Power)</h2>
          </div>

          <div className="p-4">
            
            {/* Flow Rate Input with Unit Selector */}
            <div className="mb-4">
              <label className="block font-bold text-foreground mb-1.5 text-sm">Flow Rate (Q):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={flowRate}
                  onChange={e => setFlowRate(e.target.value)}
                  placeholder="100"
                  className="flex-1 border-2 border-border bg-background rounded-lg px-3 py-2 text-right text-base focus:border-blue-500 focus:outline-none"
                />
                <Select value={flowUnit} onValueChange={setFlowUnit}>
                  <SelectTrigger className="w-32 border-2 border-border bg-background text-sm">
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
            </div>

            {/* Differential Head Input with Unit Selector */}
            <div className="mb-4">
              <label className="block font-bold text-foreground mb-1.5 text-sm">Differential Head (H):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={head}
                  onChange={e => setHead(e.target.value)}
                  placeholder="50"
                  className="flex-1 border-2 border-border bg-background rounded-lg px-3 py-2 text-right text-base focus:border-blue-500 focus:outline-none"
                />
                <Select value={headUnit} onValueChange={setHeadUnit}>
                  <SelectTrigger className="w-32 border-2 border-border bg-background text-sm">
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
            </div>

            {/* Specific Gravity Input */}
            <div className="mb-4">
              <label className="block font-bold text-foreground mb-1.5 text-sm">Specific Gravity (SG):</label>
              <div className="relative flex items-center gap-3">
                <input 
                  type="number" 
                  value={specificGravity} 
                  onChange={e => handleSGChange(e.target.value)} 
                  placeholder="1.0"
                  step="0.01"
                  min="0.01"
                  max="23"
                  className={`flex-1 border-2 ${sgError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
              </div>
              {sgError ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{sgError}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Range: 0.01 to 23</p>
              )}
            </div>

            {/* Pump Efficiency Input */}
            <div className="mb-4">
              <label className="block font-bold text-foreground mb-1.5 text-sm">Pump Efficiency (η):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={efficiency} 
                  onChange={e => handleEfficiencyChange(e.target.value)} 
                  placeholder="75"
                  min="0.01"
                  max="100"
                  step="0.01"
                  className={`w-full border-2 ${efficiencyError ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-lg px-3 py-2 text-right pr-14 text-base focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">%</span>
              </div>
              {efficiencyError ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{efficiencyError}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Range: 0.01% to 100%</p>
              )}
            </div>

            {/* Result Unit Selector */}
            <div className="mb-4">
              <label className="block font-bold text-foreground mb-1.5 text-sm">Result Unit:</label>
              <Select value={resultUnit} onValueChange={setResultUnit}>
                <SelectTrigger className="w-full border-2 border-border bg-background text-base">
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

            {/* Formula Display */}
            <div className="mb-4 bg-muted rounded-lg p-4 border-2 border-border">
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
              Calculate Shaft Power
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full">
          <div className="bg-muted px-4 py-3 border-b border-border">
             <h2 className="font-bold text-base uppercase text-foreground">Calculation & Result (Shaft Power)</h2>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            
            {/* Given Values */}
            <div className="mb-4 bg-muted rounded-lg p-3 border border-border">
              <h4 className="font-bold text-foreground mb-2 uppercase text-xs">Given:</h4>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                <li>• Flow Rate (Q) = {flowRate || "?"} {flowUnits.find(u => u.value === flowUnit)?.label}</li>
                <li>• Differential Head (H) = {head || "?"} {headUnits.find(u => u.value === headUnit)?.label}</li>
                <li>• Specific Gravity (SG) = {specificGravity || "?"}</li>
                <li>• Pump Efficiency (η) = {efficiency || "?"}%</li>
              </ul>
            </div>

            <div className="mb-4 bg-muted rounded-lg p-3 border border-border">
              <h4 className="font-bold text-foreground mb-2 uppercase text-xs">To Find:</h4>
              <p className="text-xs text-muted-foreground">• Shaft Power (P<sub>s</sub>) = ?</p>
            </div>

            {/* Calculation Steps */}
            {result.steps.length > 0 && (
              <div className="mb-4 bg-muted rounded-lg p-3 border border-border">
                <h4 className="font-bold text-foreground mb-2 uppercase text-xs">Calculation:</h4>
                <div className="space-y-1">
                  {result.steps.map((step, index) => (
                    <p key={index} className="text-xs text-muted-foreground font-mono">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="mt-auto">
              <div className={`rounded-lg p-6 text-center text-white shadow-lg transition-all duration-500 ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 <div className="flex items-center justify-center mb-3">
                   {result.calculated && (
                     <div className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                   )}
                 </div>
                 
                 <h2 className="text-lg font-bold mb-3 uppercase opacity-90">
                   Result:
                 </h2>
                 
                 {result.calculated ? (
                   <div>
                     <div className="text-4xl font-black mb-2">
                       P<sub className="text-2xl">s</sub> = {result.value} {powerUnits.find(u => u.value === resultUnit)?.label}
                     </div>
                     <div className="text-sm opacity-80 mt-2">
                       ({result.valueSI} kW in SI units)
                     </div>
                   </div>
                 ) : (
                   <div className="text-base font-medium opacity-70 italic">
                     {result.steps[0] || "Enter values and click Calculate..."}
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
