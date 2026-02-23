"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
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
import { calculateFlowRate, calculateHead, calculatePower, formatResult } from "@/lib/affinity-calculator"
import { formatSignificant } from "@/lib/precision-math"
import { formatDisplayNumber } from "@/lib/number-formatter"
import { formatExact, formatValue } from "@/lib/format-exact"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")
  const [activeSection, setActiveSection] = useState<string>("flow")
  const [copied, setCopied] = useState(false)

  // Flow section states with units (for CONSTANT_DIAMETER mode - uses N)
  const [q1, setQ1] = useState<string>("")
  const [q1Unit, setQ1Unit] = useState<string>("m3h")
  const [q2, setQ2] = useState<string>("")
  const [q2Unit, setQ2Unit] = useState<string>("m3h")
  const [n1_flow, setN1Flow] = useState<string>("")
  const [n2_flow, setN2Flow] = useState<string>("")

  // Flow section for CONSTANT_SPEED mode (uses D)
  const [d1_flow, setD1Flow] = useState<string>("")
  const [d2_flow, setD2Flow] = useState<string>("")

  // Head section states with units (for CONSTANT_DIAMETER mode - uses N)
  const [h1, setH1] = useState<string>("")
  const [h1Unit, setH1Unit] = useState<string>("m")
  const [h2, setH2] = useState<string>("")
  const [h2Unit, setH2Unit] = useState<string>("m")
  const [n1_head, setN1Head] = useState<string>("")
  const [n2_head, setN2Head] = useState<string>("")

  // Head section for CONSTANT_SPEED mode (uses D)
  const [d1_head, setD1Head] = useState<string>("")
  const [d2_head, setD2Head] = useState<string>("")

  // Power section states with units (for CONSTANT_DIAMETER mode - uses N)
  const [p1, setP1] = useState<string>("")
  const [p1Unit, setP1Unit] = useState<string>("kw")
  const [p2, setP2] = useState<string>("")
  const [p2Unit, setP2Unit] = useState<string>("kw")
  const [n1_power, setN1Power] = useState<string>("")
  const [n2_power, setN2Power] = useState<string>("")

  // Power section for CONSTANT_SPEED mode (uses D)
  const [d1_power, setD1Power] = useState<string>("")
  const [d2_power, setD2Power] = useState<string>("")

  // Validation states
  const [q1Error, setQ1Error] = useState<string>("")
  const [q2Error, setQ2Error] = useState<string>("")
  const [h1Error, setH1Error] = useState<string>("")
  const [h2Error, setH2Error] = useState<string>("")
  const [p1Error, setP1Error] = useState<string>("")
  const [p2Error, setP2Error] = useState<string>("")
  const [n1FlowError, setN1FlowError] = useState<string>("")
  const [n2FlowError, setN2FlowError] = useState<string>("")
  const [n1HeadError, setN1HeadError] = useState<string>("")
  const [n2HeadError, setN2HeadError] = useState<string>("")
  const [n1PowerError, setN1PowerError] = useState<string>("")
  const [n2PowerError, setN2PowerError] = useState<string>("")
  const [d1FlowError, setD1FlowError] = useState<string>("")
  const [d2FlowError, setD2FlowError] = useState<string>("")
  const [d1HeadError, setD1HeadError] = useState<string>("")
  const [d2HeadError, setD2HeadError] = useState<string>("")
  const [d1PowerError, setD1PowerError] = useState<string>("")
  const [d2PowerError, setD2PowerError] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    valueSI: string
    fullValue: string
    fullValueSI: string
    label: string
    calculated: boolean
    steps: string[]
    displayData?: {
      type?: 'simple_fraction' | 'power' | 'root'
      targetVariable?: string
      varNum1?: string
      varNum2?: string
      varDenom?: string
      varMultiplier?: string
      varNum?: string
      num1?: string
      num2?: string
      num?: string
      denom?: string
      multiplier?: string
      exponent?: string
      result?: string
      resultUnit?: string
    }
  }>({
    value: "", 
    valueSI: "",
    fullValue: "",
    fullValueSI: "",
    label: "", 
    calculated: false,
    steps: []
  })

  // Simple validation on blur (when focus is removed)
  const validateOnBlur = (value: string, setError: (error: string) => void, fieldName: string) => {
    if (value === "") {
      setError("")
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      setError("Please enter a valid number")
    } else if (num === 0) {
      setError(`${fieldName} cannot be zero`)
    } else if (num < 0) {
      setError(`${fieldName} must be positive`)
    } else {
      setError("")
    }
  }

  const handleCalculate = () => {
    let steps: string[] = []
    let resultValue = ""
    let resultValueSI = ""
    let fullResultValue = ""
    let fullResultValueSI = ""
    let resultLabel = ""
    let displayData: any = {}

    // Determine which values to use based on mode
    const isConstantDiameter = mode === "CONSTANT_DIAMETER"
    const symbol = isConstantDiameter ? "N" : "D"
    const unit = isConstantDiameter ? "RPM" : "mm"

    // FLOW SECTION CALCULATIONS
    if (activeSection === "flow") {
      const q1_input = q1 ? parseFloat(q1) : null
      const q2_input = q2 ? parseFloat(q2) : null
      
      const v1_input = isConstantDiameter ? (n1_flow ? parseFloat(n1_flow) : null) : (d1_flow ? parseFloat(d1_flow) : null)
      const v2_input = isConstantDiameter ? (n2_flow ? parseFloat(n2_flow) : null) : (d2_flow ? parseFloat(d2_flow) : null)

      const allValues = [q1_input, q2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps: [] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps: [] })
        return
      }

      if (q1_input === 0 || q2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps: [] })
        return
      }

      const q1_SI = q1_input !== null ? convertToSI(q1_input, q1Unit, 'flow') : null
      const q2_SI = q2_input !== null ? convertToSI(q2_input, q2Unit, 'flow') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      steps.push("Step 1: Converted inputs to SI units")

      const result = calculateFlowRate(q1_SI, q2_SI, v1_SI, v2_SI)
      
      if (result) {
        const calc_SI = parseFloat(result.value)
        
        if (result.variable === 'q2') {
          const calc_output = convertFromSI(calc_SI, q2Unit, 'flow')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = parseFloat(calc_output.toString()).toFixed(3)
          resultValueSI = parseFloat(result.value).toFixed(3)
          const finalUnit = flowUnits.find(u => u.value === q2Unit)?.label || ""
          resultLabel = `Q₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'simple_fraction', targetVariable: 'Q₂', varNum1: 'Q₁', varNum2: `${symbol}₂`, varDenom: `${symbol}₁`, num1: formatExact(q1_SI!), num2: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'q1') {
          const calc_output = convertFromSI(calc_SI, q1Unit, 'flow')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = parseFloat(calc_output.toString()).toFixed(3)
          resultValueSI = parseFloat(result.value).toFixed(3)
          const finalUnit = flowUnits.find(u => u.value === q1Unit)?.label || ""
          resultLabel = `Q₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'simple_fraction', targetVariable: 'Q₁', varNum1: 'Q₂', varNum2: `${symbol}₁`, varDenom: `${symbol}₂`, num1: formatExact(q2_SI!), num2: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : parseFloat(result.value).toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'simple_fraction', targetVariable: `${symbol}₂`, varNum1: `${symbol}₁`, varNum2: 'Q₂', varDenom: 'Q₁', num1: formatValue(v1_SI!, isConstantDiameter), num2: formatExact(q2_SI!), denom: formatExact(q1_SI!), result: resultValue, resultUnit: unit }
        } else if (result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : parseFloat(result.value).toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'simple_fraction', targetVariable: `${symbol}₁`, varNum1: `${symbol}₂`, varNum2: 'Q₁', varDenom: 'Q₂', num1: formatValue(v2_SI!, isConstantDiameter), num2: formatExact(q1_SI!), denom: formatExact(q2_SI!), result: resultValue, resultUnit: unit }
        }
      }
    }

    // HEAD SECTION CALCULATIONS
    if (activeSection === "head") {
      const h1_input = h1 ? parseFloat(h1) : null
      const h2_input = h2 ? parseFloat(h2) : null
      const v1_input = isConstantDiameter ? (n1_head ? parseFloat(n1_head) : null) : (d1_head ? parseFloat(d1_head) : null)
      const v2_input = isConstantDiameter ? (n2_head ? parseFloat(n2_head) : null) : (d2_head ? parseFloat(d2_head) : null)

      const allValues = [h1_input, h2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps: [] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps: [] })
        return
      }

      if (h1_input === 0 || h2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps: [] })
        return
      }

      const h1_SI = h1_input !== null ? convertToSI(h1_input, h1Unit, 'head') : null
      const h2_SI = h2_input !== null ? convertToSI(h2_input, h2Unit, 'head') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      steps.push("Step 1: Converted inputs to SI units")

      const result = calculateHead(h1_SI, h2_SI, v1_SI, v2_SI)
      
      if (result) {
        const calc_SI = parseFloat(result.value)
        
        if (result.variable === 'h2') {
          const calc_output = convertFromSI(calc_SI, h2Unit, 'head')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = headUnits.find(u => u.value === h2Unit)?.label || ""
          resultLabel = `H₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'H₂', varMultiplier: 'H₁', varNum: `${symbol}₂`, varDenom: `${symbol}₁`, multiplier: formatExact(h1_SI!), num: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), exponent: "2", result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'h1') {
          const calc_output = convertFromSI(calc_SI, h1Unit, 'head')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = headUnits.find(u => u.value === h1Unit)?.label || ""
          resultLabel = `H₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'H₁', varMultiplier: 'H₂', varNum: `${symbol}₁`, varDenom: `${symbol}₂`, multiplier: formatExact(h2_SI!), num: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), exponent: "2", result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₂`, varMultiplier: `${symbol}₁`, varNum: 'H₂', varDenom: 'H₁', multiplier: formatValue(v1_SI!, isConstantDiameter), num: formatExact(h2_SI!), denom: formatExact(h1_SI!), exponent: "2", result: resultValue, resultUnit: unit }
        } else if (result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₁`, varMultiplier: `${symbol}₂`, varNum: 'H₁', varDenom: 'H₂', multiplier: formatValue(v2_SI!, isConstantDiameter), num: formatExact(h1_SI!), denom: formatExact(h2_SI!), exponent: "2", result: resultValue, resultUnit: unit }
        }
      }
    }

    // POWER SECTION CALCULATIONS
    if (activeSection === "power") {
      const p1_input = p1 ? parseFloat(p1) : null
      const p2_input = p2 ? parseFloat(p2) : null
      const v1_input = isConstantDiameter ? (n1_power ? parseFloat(n1_power) : null) : (d1_power ? parseFloat(d1_power) : null)
      const v2_input = isConstantDiameter ? (n2_power ? parseFloat(n2_power) : null) : (d2_power ? parseFloat(d2_power) : null)

      const allValues = [p1_input, p2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps: [] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps: [] })
        return
      }

      if (p1_input === 0 || p2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps: [] })
        return
      }

      const p1_SI = p1_input !== null ? convertToSI(p1_input, p1Unit, 'power') : null
      const p2_SI = p2_input !== null ? convertToSI(p2_input, p2Unit, 'power') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      steps.push("Step 1: Converted inputs to SI units")

      const result = calculatePower(p1_SI, p2_SI, v1_SI, v2_SI)
      
      if (result) {
        const calc_SI = parseFloat(result.value)
        
        if (result.variable === 'p2') {
          const calc_output = convertFromSI(calc_SI, p2Unit, 'power')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = powerUnits.find(u => u.value === p2Unit)?.label || ""
          resultLabel = `P₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'P₂', varMultiplier: 'P₁', varNum: `${symbol}₂`, varDenom: `${symbol}₁`, multiplier: formatExact(p1_SI!), num: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), exponent: "3", result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'p1') {
          const calc_output = convertFromSI(calc_SI, p1Unit, 'power')
          fullResultValue = calc_output.toString()
          fullResultValueSI = result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = powerUnits.find(u => u.value === p1Unit)?.label || ""
          resultLabel = `P₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'P₁', varMultiplier: 'P₂', varNum: `${symbol}₁`, varDenom: `${symbol}₂`, multiplier: formatExact(p2_SI!), num: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), exponent: "3", result: resultValue, resultUnit: finalUnit }
        } else if (result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₂`, varMultiplier: `${symbol}₁`, varNum: 'P₂', varDenom: 'P₁', multiplier: formatValue(v1_SI!, isConstantDiameter), num: formatExact(p2_SI!), denom: formatExact(p1_SI!), exponent: "3", result: resultValue, resultUnit: unit }
        } else if (result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(result.value)) : parseFloat(result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₁`, varMultiplier: `${symbol}₂`, varNum: 'P₁', varDenom: 'P₂', multiplier: formatValue(v2_SI!, isConstantDiameter), num: formatExact(p1_SI!), denom: formatExact(p2_SI!), exponent: "3", result: resultValue, resultUnit: unit }
        }
      }
    }

    setResult({
      value: resultValue,
      valueSI: resultValueSI,
      fullValue: fullResultValue,
      fullValueSI: fullResultValueSI,
      label: resultLabel,
      calculated: true,
      steps,
      displayData
    })

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  const copyResult = () => {
    const labelParts = result.label.split(' = ')
    const valuePart = labelParts[1] || ''
    const displayValue = parseFloat(result.fullValue).toFixed(8)
    const unitMatch = valuePart.match(/[\d.]+\s*(.+)/)
    const unit = unitMatch ? unitMatch[1] : ''
    
    const resultText = `${displayValue} ${unit}`.trim()
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
        label: "",
        calculated: false,
        steps: [],
        displayData: undefined
      })
      toast({
        title: "Input Modified",
        description: "Please click Calculate again to see updated results.",
        variant: "default",
      })
    }
  }

  const MathPill = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-amber-100/80 text-amber-900 dark:bg-[#38260a] dark:text-[#eebb77] px-2 py-0.5 rounded text-[16px] font-mono mx-[2px] shadow-sm">
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8 font-sans text-foreground flex flex-col items-center">
      
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
          A World-Class Engineering Tool
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
          Pump Affinity Law Calculator
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
        
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col">
          
          {/* Mode Selector - High Contrast Segmented Control UI */}
          <div className="p-3 md:p-4 bg-muted/40 border-b border-border">
            <div className="flex flex-col sm:flex-row bg-muted/70 p-1.5 rounded-xl border border-border/50 shadow-inner gap-1">
              <button
                onClick={() => { setMode("CONSTANT_SPEED"); resetCalculation(); }}
                className={`flex-1 py-3 px-2 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  mode === "CONSTANT_SPEED" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500 md:scale-[1.02] z-10" 
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {mode === "CONSTANT_SPEED" ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-muted-foreground/50" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">Constant Speed</span>
                </div>
                <span className={`text-[11px] font-medium ${mode === "CONSTANT_SPEED" ? "text-blue-100" : "opacity-60"}`}>
                  ( Solving for Change in Diameter - D )
                </span>
              </button>
              
              <button
                onClick={() => { setMode("CONSTANT_DIAMETER"); resetCalculation(); }}
                className={`flex-1 py-3 px-2 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  mode === "CONSTANT_DIAMETER" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500 md:scale-[1.02] z-10" 
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {mode === "CONSTANT_DIAMETER" ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-muted-foreground/50" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">Constant Diameter</span>
                </div>
                <span className={`text-[11px] font-medium ${mode === "CONSTANT_DIAMETER" ? "text-blue-100" : "opacity-60"}`}>
                  ( Solving for Change in Speed - N )
                </span>
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1">
            
            {/* Contextual Instructions Box */}
            <div className="mb-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1 uppercase text-sm tracking-wide">
                    Active Mode: <span className="text-blue-600 dark:text-blue-400">{mode === "CONSTANT_SPEED" ? "Varying Impeller Diameter (D)" : "Varying Pump Speed (N)"}</span>
                  </h4>
                  <p className="text-blue-800/80 dark:text-blue-200/70 text-sm leading-relaxed">
                    {mode === "CONSTANT_SPEED" 
                      ? "You are evaluating the effect of trimming or changing the impeller diameter while keeping the RPM constant. Enter any 3 known values below to calculate the missing 4th value."
                      : "You are evaluating the effect of changing the pump speed (RPM) while keeping the impeller diameter constant. Enter any 3 known values below to calculate the missing 4th value."}
                  </p>
                </div>
              </div>
            </div>

            <Accordion type="single" value={activeSection} onValueChange={(value) => setActiveSection(value || "flow")} className="space-y-2 [&>*]:!border-b-0">
              
              {/* FLOW SECTION */}
              <AccordionItem value="flow" className="border border-border rounded-lg px-4 bg-card [&:not(:last-child)]:mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">1. Flow Rate (Q)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                       {/* Q1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={q1} 
                              onChange={e => { setQ1(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={q1Unit} onValueChange={(value) => { setQ1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {flowUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N1/D1 - Fixed RPM or mm */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Flow(e.target.value) : setD1Flow(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>

                       {/* Q2 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={q2} 
                              onChange={e => { setQ2(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={q2Unit} onValueChange={(value) => { setQ2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {flowUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N2/D2 - Fixed RPM or mm */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Flow(e.target.value) : setD2Flow(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* HEAD SECTION */}
              <AccordionItem value="head" className="border border-border rounded-lg px-4 bg-card [&:not(:last-child)]:mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">2. Head (H)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 w-full">
                       {/* H1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={h1} 
                              onChange={e => { setH1(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setH1Error, "H₁")}
                              placeholder="?" 
                              className={`w-24 border-2 ${h1Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <Select value={h1Unit} onValueChange={(value) => { setH1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {h1Error && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{h1Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N1 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_head : d1_head} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Head(e.target.value) : setD1Head(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN1HeadError, "N₁") : validateOnBlur(e.target.value, setD1HeadError, "D₁")}
                              placeholder="?" 
                              className={`w-24 border-2 ${(mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError}</span>
                            </div>
                          )}
                       </div>

                       {/* H2 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={h2} 
                              onChange={e => { setH2(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setH2Error, "H₂")}
                              placeholder="?" 
                              className={`w-24 border-2 ${h2Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <Select value={h2Unit} onValueChange={(value) => { setH2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {h2Error && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{h2Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N2 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_head : d2_head} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Head(e.target.value) : setD2Head(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN2HeadError, "N₂") : validateOnBlur(e.target.value, setD2HeadError, "D₂")}
                              placeholder="?" 
                              className={`w-24 border-2 ${(mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError}</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* POWER SECTION */}
              <AccordionItem value="power" className="border border-border rounded-lg px-4 bg-card mb-1">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">3. Power (P)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 w-full">
                       {/* P1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={p1} 
                              onChange={e => { setP1(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setP1Error, "P₁")}
                              placeholder="?" 
                              className={`w-24 border-2 ${p1Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <Select value={p1Unit} onValueChange={(value) => { setP1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {p1Error && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{p1Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N1 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_power : d1_power} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Power(e.target.value) : setD1Power(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN1PowerError, "N₁") : validateOnBlur(e.target.value, setD1PowerError, "D₁")}
                              placeholder="?" 
                              className={`w-24 border-2 ${(mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError}</span>
                            </div>
                          )}
                       </div>

                       {/* P2 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={p2} 
                              onChange={e => { setP2(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setP2Error, "P₂")}
                              placeholder="?" 
                              className={`w-24 border-2 ${p2Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <Select value={p2Unit} onValueChange={(value) => { setP2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-24 h-8 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {p2Error && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{p2Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N2 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_power : d2_power} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Power(e.target.value) : setD2Power(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN2PowerError, "N₂") : validateOnBlur(e.target.value, setD2PowerError, "D₂")}
                              placeholder="?" 
                              className={`w-24 border-2 ${(mode === "CONSTANT_DIAMETER" ? n2PowerError : d2PowerError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded px-2 py-1 text-center text-sm`}
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n2PowerError : d2PowerError) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n2PowerError : d2PowerError}</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-lg tracking-wide shadow-md active:translate-y-0.5 transition-all mt-auto"
            >
              CALCULATE
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - RESULTS */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="bg-muted px-6 py-4 border-b border-border relative z-10">
             <h2 className="font-bold text-xl uppercase text-foreground">Calculation & Result</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm mb-4">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">Given Data</h4>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {activeSection === "flow" && (
                    <>
                      {q1 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₁</strong> 
                          <span className="text-foreground">= {q1} {flowUnits.find(u => u.value === q1Unit)?.label}</span>
                        </div>
                      )}
                      {q2 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₂</strong> 
                          <span className="text-foreground">= {q2} {flowUnits.find(u => u.value === q2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "head" && (
                    <>
                      {h1 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₁</strong> 
                          <span className="text-foreground">= {h1} {headUnits.find(u => u.value === h1Unit)?.label}</span>
                        </div>
                      )}
                      {h2 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₂</strong> 
                          <span className="text-foreground">= {h2} {headUnits.find(u => u.value === h2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_head : d1_head) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_head : d1_head} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_head : d2_head) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n2_head : d2_head} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "power" && (
                    <>
                      {p1 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₁</strong> 
                          <span className="text-foreground">= {p1} {powerUnits.find(u => u.value === p1Unit)?.label}</span>
                        </div>
                      )}
                      {p2 && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₂</strong> 
                          <span className="text-foreground">= {p2} {powerUnits.find(u => u.value === p2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_power : d1_power) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_power : d1_power} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_power : d2_power) && (
                        <div className="inline-flex items-center bg-background border border-blue-300 dark:border-blue-700 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n2_power : d2_power} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* To Find Section */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm mb-4">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">To Find</h4>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {activeSection === "flow" && (
                    <>
                      {!q1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!q2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "head" && (
                    <>
                      {!h1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!h2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_head : d1_head) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_head : d2_head) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "power" && (
                    <>
                      {!p1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!p2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_power : d1_power) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_power : d2_power) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 rounded px-3 py-1.5 font-mono text-sm shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mathematical Step-by-Step Calculation Block */}
            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm mb-4">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-xs">Step-by-Step Calculation</h4>
              </div>
              
              {result.calculated && result.displayData ? (
                <div className="p-6 overflow-x-auto flex justify-center w-full">
                  <div className="grid grid-cols-[minmax(0,auto)_auto_minmax(0,1fr)] items-center gap-y-4 gap-x-4 font-serif text-xl min-w-max">
                    
                    {/* Simple Fraction Block */}
                    {result.displayData.type === 'simple_fraction' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right pr-2">{result.displayData.targetVariable}</div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex flex-col items-center justify-self-start">
                          <span className="border-b-[3px] border-foreground px-6 pb-2 text-lg whitespace-nowrap flex items-center font-bold">
                            <span>{result.displayData.varNum1}</span>
                            <span className="mx-2 text-base font-sans opacity-70">×</span>
                            <span>{result.displayData.varNum2}</span>
                          </span>
                          <span className="pt-2 text-lg whitespace-nowrap font-bold">
                            <span>{result.displayData.varDenom}</span>
                          </span>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div></div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex flex-col items-center justify-self-start">
                          <span className="border-b-[3px] border-foreground px-6 pb-2 text-lg whitespace-nowrap flex items-center">
                            <MathPill>{result.displayData.num1}</MathPill>
                            <span className="mx-2 text-base font-sans opacity-70">×</span>
                            <MathPill>{result.displayData.num2}</MathPill>
                          </span>
                          <span className="pt-2 text-lg whitespace-nowrap">
                            <MathPill>{result.displayData.denom}</MathPill>
                          </span>
                        </div>
                      </>
                    )}

                    {/* Power Formula Block */}
                    {result.displayData.type === 'power' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right pr-2">{result.displayData.targetVariable}</div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex items-center justify-self-start font-bold">
                          <span>{result.displayData.varMultiplier}</span>
                          <span className="mx-3 text-base font-sans opacity-70">×</span>
                          <span className="text-[40px] text-muted-foreground font-light mr-1 leading-none mb-2">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b-[3px] border-foreground px-4 pb-1.5 text-lg whitespace-nowrap">
                              <span>{result.displayData.varNum}</span>
                            </span>
                            <span className="pt-1.5 text-lg whitespace-nowrap">
                              <span>{result.displayData.varDenom}</span>
                            </span>
                          </div>
                          <span className="text-[40px] text-muted-foreground font-light ml-1 leading-none mb-2">)</span>
                          <sup className="text-base font-bold -ml-1 mt-[-30px]">{result.displayData.exponent}</sup>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div></div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex items-center justify-self-start">
                          <MathPill>{result.displayData.multiplier}</MathPill>
                          <span className="mx-3 text-base font-sans opacity-70">×</span>
                          <span className="text-[40px] text-muted-foreground font-light mr-1 leading-none mb-2">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b-[3px] border-foreground px-4 pb-1.5 text-lg whitespace-nowrap">
                              <MathPill>{result.displayData.num}</MathPill>
                            </span>
                            <span className="pt-1.5 text-lg whitespace-nowrap">
                              <MathPill>{result.displayData.denom}</MathPill>
                            </span>
                          </div>
                          <span className="text-[40px] text-muted-foreground font-light ml-1 leading-none mb-2">)</span>
                          <sup className="text-base font-bold -ml-1 mt-[-30px]">{result.displayData.exponent}</sup>
                        </div>
                      </>
                    )}

                    {/* Root Formula Block */}
                    {result.displayData.type === 'root' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right pr-2">{result.displayData.targetVariable}</div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex items-center justify-self-start font-bold">
                          <span>{result.displayData.varMultiplier}</span>
                          <span className="mx-3 text-base font-sans opacity-70">×</span>
                          <span className="text-[40px] text-muted-foreground font-light mr-1 leading-none mb-2">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b-[3px] border-foreground px-4 pb-1.5 text-lg whitespace-nowrap">
                              <span>{result.displayData.varNum}</span>
                            </span>
                            <span className="pt-1.5 text-lg whitespace-nowrap">
                              <span>{result.displayData.varDenom}</span>
                            </span>
                          </div>
                          <span className="text-[40px] text-muted-foreground font-light ml-1 leading-none mb-2">)</span>
                          <sup className="text-sm font-bold -ml-1 mt-[-30px]">1/{result.displayData.exponent}</sup>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div></div>
                        <div className="text-center px-2 text-2xl">=</div>
                        <div className="flex items-center justify-self-start">
                          <MathPill>{result.displayData.multiplier}</MathPill>
                          <span className="mx-3 text-base font-sans opacity-70">×</span>
                          <span className="text-[40px] text-muted-foreground font-light mr-1 leading-none mb-2">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b-[3px] border-foreground px-4 pb-1.5 text-lg whitespace-nowrap">
                              <MathPill>{result.displayData.num}</MathPill>
                            </span>
                            <span className="pt-1.5 text-lg whitespace-nowrap">
                              <MathPill>{result.displayData.denom}</MathPill>
                            </span>
                          </div>
                          <span className="text-[40px] text-muted-foreground font-light ml-1 leading-none mb-2">)</span>
                          <sup className="text-sm font-bold -ml-1 mt-[-30px]">1/{result.displayData.exponent}</sup>
                        </div>
                      </>
                    )}

                    {/* Final Result Evaluation Row */}
                    <div></div>
                    <div className="text-center px-2 font-bold text-2xl mt-4">≈</div>
                    <div className="font-bold text-[22px] justify-self-start mt-4 tracking-tight">
                      {result.displayData.result} <span className="font-sans opacity-90">{result.displayData.resultUnit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground min-h-[120px]">
                  <svg className="w-8 h-8 opacity-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Enter values and click calculate to see step-by-step breakdown</span>
                </div>
              )}
            </div>

            {/* Final Result Container */}
            <div className="mt-auto" ref={resultRef}>
              <div className={`rounded-lg px-6 py-4 text-white shadow-lg transition-all duration-500 relative ${result.calculated ? "bg-[#0eb947]" : "bg-muted"}`}>
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
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     
                     <div className="flex items-center gap-3 min-w-0 flex-1">
                       <h2 className="text-xl font-bold uppercase opacity-90 whitespace-nowrap">Result:</h2>
                       <div className="text-[28px] font-black truncate min-w-0 tracking-tight" title={result.label}>
                         {result.label}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center">
                     <div className="text-base font-medium opacity-70 italic text-muted-foreground">
                       {result.label || "Enter values and click Calculate..."}
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