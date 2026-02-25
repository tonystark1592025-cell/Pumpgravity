"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
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
import { calculateFlowRate, calculateHead, calculatePower } from "@/lib/affinity-calculator"
import { formatDisplayNumber } from "@/lib/number-formatter"
import { formatExact, formatValue } from "@/lib/format-exact"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const { toast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")
  const [activeSection, setActiveSection] = useState<string>("flow")
  const[copied, setCopied] = useState(false)
  const [showStep1, setShowStep1] = useState(false)

  // Flow section states with units
  const [q1, setQ1] = useState<string>("")
  const [q1Unit, setQ1Unit] = useState<string>("m3h")
  const [q2, setQ2] = useState<string>("")
  const[q2Unit, setQ2Unit] = useState<string>("m3h")
  const[n1_flow, setN1Flow] = useState<string>("")
  const [n2_flow, setN2Flow] = useState<string>("")
  const [d1_flow, setD1Flow] = useState<string>("")
  const[d2_flow, setD2Flow] = useState<string>("")

  // Head section states with units
  const [h1, setH1] = useState<string>("")
  const[h1Unit, setH1Unit] = useState<string>("m")
  const [h2, setH2] = useState<string>("")
  const [h2Unit, setH2Unit] = useState<string>("m")
  const[n1_head, setN1Head] = useState<string>("")
  const[n2_head, setN2Head] = useState<string>("")
  const [d1_head, setD1Head] = useState<string>("")
  const [d2_head, setD2Head] = useState<string>("")

  // Power section states with units
  const [p1, setP1] = useState<string>("")
  const [p1Unit, setP1Unit] = useState<string>("kw")
  const [p2, setP2] = useState<string>("")
  const[p2Unit, setP2Unit] = useState<string>("kw")
  const[n1_power, setN1Power] = useState<string>("")
  const [n2_power, setN2Power] = useState<string>("")
  const [d1_power, setD1Power] = useState<string>("")
  const [d2_power, setD2Power] = useState<string>("")

  // Validation states
  const [h1Error, setH1Error] = useState<string>("")
  const[h2Error, setH2Error] = useState<string>("")
  const [p1Error, setP1Error] = useState<string>("")
  const [p2Error, setP2Error] = useState<string>("")
  const[n1HeadError, setN1HeadError] = useState<string>("")
  const[n2HeadError, setN2HeadError] = useState<string>("")
  const[n1PowerError, setN1PowerError] = useState<string>("")
  const [n2PowerError, setN2PowerError] = useState<string>("")
  const [d1HeadError, setD1HeadError] = useState<string>("")
  const[d2HeadError, setD2HeadError] = useState<string>("")
  const[d1PowerError, setD1PowerError] = useState<string>("")
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
      conversions?: string[]
      baseFormula?: {
        leftNum: string
        leftDenom: string
        rightNum: string
        rightDenom: string
        exponent?: string
      }
    }
  }>({
    value: "", 
    valueSI: "",
    fullValue: "",
    fullValueSI: "",
    label: "", 
    calculated: false,
    steps:[]
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
    let steps: string[] =[]
    let resultValue = ""
    let resultValueSI = ""
    let fullResultValue = ""
    let fullResultValueSI = ""
    let resultLabel = ""
    let displayData: any = {}
    let conversionsList: string[] =[]

    const isConstantDiameter = mode === "CONSTANT_DIAMETER"
    const symbol = isConstantDiameter ? "N" : "D"
    const unit = isConstantDiameter ? "RPM" : "mm"

    // FLOW SECTION CALCULATIONS
    if (activeSection === "flow") {
      const q1_input = q1 ? parseFloat(q1) : null
      const q2_input = q2 ? parseFloat(q2) : null
      const v1_input = isConstantDiameter ? (n1_flow ? parseFloat(n1_flow) : null) : (d1_flow ? parseFloat(d1_flow) : null)
      const v2_input = isConstantDiameter ? (n2_flow ? parseFloat(n2_flow) : null) : (d2_flow ? parseFloat(d2_flow) : null)

      const allValues =[q1_input, q2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps:[] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps:[] })
        return
      }

      if (q1_input === 0 || q2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps:[] })
        return
      }

      const q1_SI = q1_input !== null ? convertToSI(q1_input, q1Unit, 'flow') : null
      const q2_SI = q2_input !== null ? convertToSI(q2_input, q2Unit, 'flow') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      if (q1_input !== null) conversionsList.push(`Q₁ = ${q1_input} ${flowUnits.find(u=>u.value===q1Unit)?.label} = ${parseFloat(q1_SI!.toString()).toFixed(4)} m³/h`)
      if (q2_input !== null) conversionsList.push(`Q₂ = ${q2_input} ${flowUnits.find(u=>u.value===q2Unit)?.label} = ${parseFloat(q2_SI!.toString()).toFixed(4)} m³/h`)
      if (v1_input !== null) conversionsList.push(`${symbol}₁ = ${v1_input} ${unit}`)
      if (v2_input !== null) conversionsList.push(`${symbol}₂ = ${v2_input} ${unit}`)

      const baseFlow = { leftNum: 'Q₁', leftDenom: 'Q₂', rightNum: `${symbol}₁`, rightDenom: `${symbol}₂` }
      const calc_result = calculateFlowRate(q1_SI, q2_SI, v1_SI, v2_SI)
      
      if (calc_result) {
        const calc_SI = parseFloat(calc_result.value)
        
        if (calc_result.variable === 'q2') {
          const calc_output = convertFromSI(calc_SI, q2Unit, 'flow')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = parseFloat(calc_output.toString()).toFixed(3)
          resultValueSI = parseFloat(calc_result.value).toFixed(3)
          const finalUnit = flowUnits.find(u => u.value === q2Unit)?.label || ""
          resultLabel = `Q₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'simple_fraction', targetVariable: 'Q₂', varNum1: 'Q₁', varNum2: `${symbol}₂`, varDenom: `${symbol}₁`, num1: formatExact(q1_SI!), num2: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), result: resultValue, resultUnit: finalUnit, baseFormula: baseFlow, conversions: conversionsList }
        } else if (calc_result.variable === 'q1') {
          const calc_output = convertFromSI(calc_SI, q1Unit, 'flow')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = parseFloat(calc_output.toString()).toFixed(3)
          resultValueSI = parseFloat(calc_result.value).toFixed(3)
          const finalUnit = flowUnits.find(u => u.value === q1Unit)?.label || ""
          resultLabel = `Q₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'simple_fraction', targetVariable: 'Q₁', varNum1: 'Q₂', varNum2: `${symbol}₁`, varDenom: `${symbol}₂`, num1: formatExact(q2_SI!), num2: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), result: resultValue, resultUnit: finalUnit, baseFormula: baseFlow, conversions: conversionsList }
        } else if (calc_result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : parseFloat(calc_result.value).toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'simple_fraction', targetVariable: `${symbol}₂`, varNum1: `${symbol}₁`, varNum2: 'Q₂', varDenom: 'Q₁', num1: formatValue(v1_SI!, isConstantDiameter), num2: formatExact(q2_SI!), denom: formatExact(q1_SI!), result: resultValue, resultUnit: unit, baseFormula: baseFlow, conversions: conversionsList }
        } else if (calc_result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : parseFloat(calc_result.value).toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'simple_fraction', targetVariable: `${symbol}₁`, varNum1: `${symbol}₂`, varNum2: 'Q₁', varDenom: 'Q₂', num1: formatValue(v2_SI!, isConstantDiameter), num2: formatExact(q1_SI!), denom: formatExact(q2_SI!), result: resultValue, resultUnit: unit, baseFormula: baseFlow, conversions: conversionsList }
        }
      }
    }

    // HEAD SECTION CALCULATIONS
    if (activeSection === "head") {
      const h1_input = h1 ? parseFloat(h1) : null
      const h2_input = h2 ? parseFloat(h2) : null
      const v1_input = isConstantDiameter ? (n1_head ? parseFloat(n1_head) : null) : (d1_head ? parseFloat(d1_head) : null)
      const v2_input = isConstantDiameter ? (n2_head ? parseFloat(n2_head) : null) : (d2_head ? parseFloat(d2_head) : null)

      const allValues =[h1_input, h2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps:[] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps:[] })
        return
      }

      if (h1_input === 0 || h2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps:[] })
        return
      }

      const h1_SI = h1_input !== null ? convertToSI(h1_input, h1Unit, 'head') : null
      const h2_SI = h2_input !== null ? convertToSI(h2_input, h2Unit, 'head') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      if (h1_input !== null) conversionsList.push(`H₁ = ${h1_input} ${headUnits.find(u=>u.value===h1Unit)?.label} = ${parseFloat(h1_SI!.toString()).toFixed(4)} m`)
      if (h2_input !== null) conversionsList.push(`H₂ = ${h2_input} ${headUnits.find(u=>u.value===h2Unit)?.label} = ${parseFloat(h2_SI!.toString()).toFixed(4)} m`)
      if (v1_input !== null) conversionsList.push(`${symbol}₁ = ${v1_input} ${unit}`)
      if (v2_input !== null) conversionsList.push(`${symbol}₂ = ${v2_input} ${unit}`)

      const baseHead = { leftNum: 'H₁', leftDenom: 'H₂', rightNum: `${symbol}₁`, rightDenom: `${symbol}₂`, exponent: "2" }
      const calc_result = calculateHead(h1_SI, h2_SI, v1_SI, v2_SI)
      
      if (calc_result) {
        const calc_SI = parseFloat(calc_result.value)
        
        if (calc_result.variable === 'h2') {
          const calc_output = convertFromSI(calc_SI, h2Unit, 'head')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = headUnits.find(u => u.value === h2Unit)?.label || ""
          resultLabel = `H₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'H₂', varMultiplier: 'H₁', varNum: `${symbol}₂`, varDenom: `${symbol}₁`, multiplier: formatExact(h1_SI!), num: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), exponent: "2", result: resultValue, resultUnit: finalUnit, baseFormula: baseHead, conversions: conversionsList }
        } else if (calc_result.variable === 'h1') {
          const calc_output = convertFromSI(calc_SI, h1Unit, 'head')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = headUnits.find(u => u.value === h1Unit)?.label || ""
          resultLabel = `H₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'H₁', varMultiplier: 'H₂', varNum: `${symbol}₁`, varDenom: `${symbol}₂`, multiplier: formatExact(h2_SI!), num: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), exponent: "2", result: resultValue, resultUnit: finalUnit, baseFormula: baseHead, conversions: conversionsList }
        } else if (calc_result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₂`, varMultiplier: `${symbol}₁`, varNum: 'H₂', varDenom: 'H₁', multiplier: formatValue(v1_SI!, isConstantDiameter), num: formatExact(h2_SI!), denom: formatExact(h1_SI!), exponent: "2", result: resultValue, resultUnit: unit, baseFormula: baseHead, conversions: conversionsList }
        } else if (calc_result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₁`, varMultiplier: `${symbol}₂`, varNum: 'H₁', varDenom: 'H₂', multiplier: formatValue(v2_SI!, isConstantDiameter), num: formatExact(h1_SI!), denom: formatExact(h2_SI!), exponent: "2", result: resultValue, resultUnit: unit, baseFormula: baseHead, conversions: conversionsList }
        }
      }
    }

    // POWER SECTION CALCULATIONS
    if (activeSection === "power") {
      const p1_input = p1 ? parseFloat(p1) : null
      const p2_input = p2 ? parseFloat(p2) : null
      const v1_input = isConstantDiameter ? (n1_power ? parseFloat(n1_power) : null) : (d1_power ? parseFloat(d1_power) : null)
      const v2_input = isConstantDiameter ? (n2_power ? parseFloat(n2_power) : null) : (d2_power ? parseFloat(d2_power) : null)

      const allValues =[p1_input, p2_input, v1_input, v2_input]
      const filledCount = allValues.filter(v => v !== null).length

      if (filledCount < 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please enter any 3 values to calculate the 4th", calculated: false, steps:[] })
        return
      }

      if (filledCount > 3) {
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Please leave ONE value empty to calculate", calculated: false, steps:[] })
        return
      }

      if (p1_input === 0 || p2_input === 0 || v1_input === 0 || v2_input === 0) {
        toast({ title: "Invalid Input", description: "Values cannot be zero.", variant: "destructive" })
        setResult({ value: "", valueSI: "", fullValue: "", fullValueSI: "", label: "Values cannot be zero", calculated: false, steps:[] })
        return
      }

      const p1_SI = p1_input !== null ? convertToSI(p1_input, p1Unit, 'power') : null
      const p2_SI = p2_input !== null ? convertToSI(p2_input, p2Unit, 'power') : null
      const v1_SI = v1_input 
      const v2_SI = v2_input 

      if (p1_input !== null) conversionsList.push(`P₁ = ${p1_input} ${powerUnits.find(u=>u.value===p1Unit)?.label} = ${parseFloat(p1_SI!.toString()).toFixed(4)} kW`)
      if (p2_input !== null) conversionsList.push(`P₂ = ${p2_input} ${powerUnits.find(u=>u.value===p2Unit)?.label} = ${parseFloat(p2_SI!.toString()).toFixed(4)} kW`)
      if (v1_input !== null) conversionsList.push(`${symbol}₁ = ${v1_input} ${unit}`)
      if (v2_input !== null) conversionsList.push(`${symbol}₂ = ${v2_input} ${unit}`)

      const basePower = { leftNum: 'P₁', leftDenom: 'P₂', rightNum: `${symbol}₁`, rightDenom: `${symbol}₂`, exponent: "3" }
      const calc_result = calculatePower(p1_SI, p2_SI, v1_SI, v2_SI)
      
      if (calc_result) {
        const calc_SI = parseFloat(calc_result.value)
        
        if (calc_result.variable === 'p2') {
          const calc_output = convertFromSI(calc_SI, p2Unit, 'power')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = powerUnits.find(u => u.value === p2Unit)?.label || ""
          resultLabel = `P₂ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'P₂', varMultiplier: 'P₁', varNum: `${symbol}₂`, varDenom: `${symbol}₁`, multiplier: formatExact(p1_SI!), num: formatValue(v2_SI!, isConstantDiameter), denom: formatValue(v1_SI!, isConstantDiameter), exponent: "3", result: resultValue, resultUnit: finalUnit, baseFormula: basePower, conversions: conversionsList }
        } else if (calc_result.variable === 'p1') {
          const calc_output = convertFromSI(calc_SI, p1Unit, 'power')
          fullResultValue = calc_output.toString()
          fullResultValueSI = calc_result.value
          resultValue = calc_output.toFixed(3)
          resultValueSI = calc_SI.toFixed(3)
          const finalUnit = powerUnits.find(u => u.value === p1Unit)?.label || ""
          resultLabel = `P₁ = ${resultValue} ${finalUnit}`
          displayData = { type: 'power', targetVariable: 'P₁', varMultiplier: 'P₂', varNum: `${symbol}₁`, varDenom: `${symbol}₂`, multiplier: formatExact(p2_SI!), num: formatValue(v1_SI!, isConstantDiameter), denom: formatValue(v2_SI!, isConstantDiameter), exponent: "3", result: resultValue, resultUnit: finalUnit, baseFormula: basePower, conversions: conversionsList }
        } else if (calc_result.variable === 'v2') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₂ ≈ ${resultValue} ${unit}` : `${symbol}₂ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₂`, varMultiplier: `${symbol}₁`, varNum: 'P₂', varDenom: 'P₁', multiplier: formatValue(v1_SI!, isConstantDiameter), num: formatExact(p2_SI!), denom: formatExact(p1_SI!), exponent: "3", result: resultValue, resultUnit: unit, baseFormula: basePower, conversions: conversionsList }
        } else if (calc_result.variable === 'v1') {
          const calc_rounded = isConstantDiameter ? Math.round(parseFloat(calc_result.value)) : parseFloat(calc_result.value)
          fullResultValue = isConstantDiameter ? calc_rounded.toString() : calc_result.value
          fullResultValueSI = fullResultValue
          resultValue = isConstantDiameter ? calc_rounded.toString() : calc_SI.toFixed(3)
          resultValueSI = resultValue
          resultLabel = isConstantDiameter ? `${symbol}₁ ≈ ${resultValue} ${unit}` : `${symbol}₁ = ${resultValue} ${unit}`
          displayData = { type: 'root', targetVariable: `${symbol}₁`, varMultiplier: `${symbol}₂`, varNum: 'P₁', varDenom: 'P₂', multiplier: formatValue(v2_SI!, isConstantDiameter), num: formatExact(p1_SI!), denom: formatExact(p2_SI!), exponent: "3", result: resultValue, resultUnit: unit, baseFormula: basePower, conversions: conversionsList }
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
        steps:[],
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
    <span className="bg-yellow-100 dark:bg-yellow-900/60 dark:text-yellow-100 px-1 py-0.5 rounded font-sans mx-[2px]">
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-3 md:p-6 font-sans text-foreground flex flex-col items-center">
      
      <div className="text-center mb-5">
        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          World-Class Engineering Tool for Professionals
        </p>
        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">
          Pump Affinity Law Calculator
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
        
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full">
          
          {/* Mode Selector - High Contrast Segmented Control UI */}
          <div className="p-2.5 md:p-3 bg-muted/40 border-b border-border">
            <div className="flex flex-col sm:flex-row bg-muted/70 p-1.5 rounded-xl border border-border/50 shadow-inner gap-1">
              <button
                onClick={() => { setMode("CONSTANT_SPEED"); resetCalculation(); }}
                className={`flex-1 py-2.5 px-2 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  mode === "CONSTANT_SPEED" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500 md:scale-[1.02] z-10" 
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {mode === "CONSTANT_SPEED" ? (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  ) : (
                    <div className="w-2 h-2 rounded-full border-[1.5px] border-muted-foreground/50" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider">Constant Speed</span>
                </div>
                <span className={`text-[9px] font-medium ${mode === "CONSTANT_SPEED" ? "text-blue-100" : "opacity-60"}`}>
                  ( Solving for Change in Diameter - D )
                </span>
              </button>
              
              <button
                onClick={() => { setMode("CONSTANT_DIAMETER"); resetCalculation(); }}
                className={`flex-1 py-2.5 px-2 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  mode === "CONSTANT_DIAMETER" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500 md:scale-[1.02] z-10" 
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {mode === "CONSTANT_DIAMETER" ? (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  ) : (
                    <div className="w-2 h-2 rounded-full border-[1.5px] border-muted-foreground/50" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider">Constant Diameter</span>
                </div>
                <span className={`text-[9px] font-medium ${mode === "CONSTANT_DIAMETER" ? "text-blue-100" : "opacity-60"}`}>
                  ( Solving for Change in Speed - N )
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5 flex flex-col flex-1">
            
            {/* Contextual Instructions Box */}
            <div className="mb-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50 p-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/50 p-1 rounded text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-0.5 uppercase text-xs tracking-wide">
                    Active Mode: <span className="text-blue-600 dark:text-blue-400">{mode === "CONSTANT_SPEED" ? "Varying Impeller Diameter (D)" : "Varying Pump Speed (N)"}</span>
                  </h4>
                  <p className="text-blue-800/80 dark:text-blue-200/70 text-[11px] leading-relaxed">
                    {mode === "CONSTANT_SPEED" 
                      ? "Evaluating the effect of trimming the impeller diameter while keeping RPM constant. Enter any 3 known values below to calculate the missing 4th value."
                      : "Evaluating the effect of changing the pump speed (RPM) while keeping diameter constant. Enter any 3 known values below to calculate the missing 4th value."}
                  </p>
                </div>
              </div>
            </div>

            <Accordion type="single" value={activeSection} onValueChange={(value) => setActiveSection(value || "flow")} className="space-y-2 [&>*]:!border-b-0">
              
              {/* FLOW SECTION */}
              <AccordionItem value="flow" className="border border-border rounded-md px-3 bg-card [&:not(:last-child)]:mb-1.5">
                <AccordionTrigger className="hover:no-underline py-2.5">
                  <h3 className="font-bold text-sm">1. Flow Rate (Q)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 w-full">
                       {/* Q1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₁:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={q1} 
                              onChange={e => { setQ1(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 h-9 flex-1 border border-border bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <Select value={q1Unit} onValueChange={(value) => { setQ1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {flowUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N1/D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Flow(e.target.value) : setD1Flow(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 h-9 flex-1 border border-border bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>

                       {/* Q2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₂:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={q2} 
                              onChange={e => { setQ2(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 h-9 flex-1 border border-border bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <Select value={q2Unit} onValueChange={(value) => { setQ2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {flowUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N2/D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Flow(e.target.value) : setD2Flow(e.target.value); resetCalculation(); }} 
                              placeholder="?" 
                              className="w-24 h-9 flex-1 border border-border bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* HEAD SECTION */}
              <AccordionItem value="head" className="border border-border rounded-md px-3 bg-card [&:not(:last-child)]:mb-1.5">
                <AccordionTrigger className="hover:no-underline py-2.5">
                  <h3 className="font-bold text-sm">2. Head (H)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 w-full">
                       {/* H1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₁:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={h1} 
                              onChange={e => { setH1(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setH1Error, "H₁")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${h1Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <Select value={h1Unit} onValueChange={(value) => { setH1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {h1Error && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{h1Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N1 / D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_head : d1_head} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Head(e.target.value) : setD1Head(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN1HeadError, "N₁") : validateOnBlur(e.target.value, setD1HeadError, "D₁")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${(mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError) && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n1HeadError : d1HeadError}</span>
                            </div>
                          )}
                       </div>

                       {/* H2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₂:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={h2} 
                              onChange={e => { setH2(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setH2Error, "H₂")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${h2Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <Select value={h2Unit} onValueChange={(value) => { setH2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {h2Error && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{h2Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N2 / D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_head : d2_head} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Head(e.target.value) : setD2Head(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN2HeadError, "N₂") : validateOnBlur(e.target.value, setD2HeadError, "D₂")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${(mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError) && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n2HeadError : d2HeadError}</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* POWER SECTION */}
              <AccordionItem value="power" className="border border-border rounded-md px-3 bg-card mb-1">
                <AccordionTrigger className="hover:no-underline py-2.5">
                  <h3 className="font-bold text-sm">3. Power (P)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 w-full">
                       {/* P1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₁:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={p1} 
                              onChange={e => { setP1(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setP1Error, "P₁")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${p1Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <Select value={p1Unit} onValueChange={(value) => { setP1Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {p1Error && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{p1Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N1 / D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_power : d1_power} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN1Power(e.target.value) : setD1Power(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN1PowerError, "N₁") : validateOnBlur(e.target.value, setD1PowerError, "D₁")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${(mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError) && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{mode === "CONSTANT_DIAMETER" ? n1PowerError : d1PowerError}</span>
                            </div>
                          )}
                       </div>

                       {/* P2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₂:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={p2} 
                              onChange={e => { setP2(e.target.value); resetCalculation(); }} 
                              onBlur={e => validateOnBlur(e.target.value, setP2Error, "P₂")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${p2Error ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <Select value={p2Unit} onValueChange={(value) => { setP2Unit(value); resetCalculation(); }}>
                              <SelectTrigger className="w-20 h-9 text-xs border border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value} className="text-sm">{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {p2Error && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{p2Error}</span>
                            </div>
                          )}
                       </div>

                       {/* N2 / D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_power : d2_power} 
                              onChange={e => { mode === "CONSTANT_DIAMETER" ? setN2Power(e.target.value) : setD2Power(e.target.value); resetCalculation(); }} 
                              onBlur={e => mode === "CONSTANT_DIAMETER" ? validateOnBlur(e.target.value, setN2PowerError, "N₂") : validateOnBlur(e.target.value, setD2PowerError, "D₂")}
                              placeholder="?" 
                              className={`w-24 h-9 flex-1 border ${(mode === "CONSTANT_DIAMETER" ? n2PowerError : d2PowerError) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'} bg-background rounded-md px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none`}
                            />
                            <div className="w-20 h-9 flex items-center justify-center border border-border bg-muted rounded-md text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                          {(mode === "CONSTANT_DIAMETER" ? n2PowerError : d2PowerError) && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all mt-auto uppercase"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - RESULTS */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="bg-muted px-4 py-2.5 border-b border-border relative z-10">
             <h2 className="font-bold text-sm uppercase text-foreground tracking-wide">Calculation & Result</h2>
          </div>

          <div className="p-3.5 flex-1 flex flex-col relative z-10">
            
            {/* Given Data Section */}
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm mb-3">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">Given Data</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {activeSection === "flow" && (
                    <>
                      {q1 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₁</strong> 
                          <span className="text-foreground">= {q1} {flowUnits.find(u => u.value === q1Unit)?.label}</span>
                        </div>
                      )}
                      {q2 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">Q₂</strong> 
                          <span className="text-foreground">= {q2} {flowUnits.find(u => u.value === q2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "head" && (
                    <>
                      {h1 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₁</strong> 
                          <span className="text-foreground">= {h1} {headUnits.find(u => u.value === h1Unit)?.label}</span>
                        </div>
                      )}
                      {h2 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">H₂</strong> 
                          <span className="text-foreground">= {h2} {headUnits.find(u => u.value === h2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_head : d1_head) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_head : d1_head} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_head : d2_head) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n2_head : d2_head} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "power" && (
                    <>
                      {p1 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₁</strong> 
                          <span className="text-foreground">= {p1} {powerUnits.find(u => u.value === p1Unit)?.label}</span>
                        </div>
                      )}
                      {p2 && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">P₂</strong> 
                          <span className="text-foreground">= {p2} {powerUnits.find(u => u.value === p2Unit)?.label}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n1_power : d1_power) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1.5">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong> 
                          <span className="text-foreground">= {mode === "CONSTANT_DIAMETER" ? n1_power : d1_power} {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}</span>
                        </div>
                      )}
                      {(mode === "CONSTANT_DIAMETER" ? n2_power : d2_power) && (
                        <div className="inline-flex items-center bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 font-mono text-xs shadow-sm">
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
            <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm mb-3">
              <div className="bg-muted px-3 py-1.5 border-b border-border">
                <h4 className="font-bold text-foreground uppercase text-[11px]">To Find</h4>
              </div>
              <div className="p-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeSection === "flow" && (
                    <>
                      {!q1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">Q₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!q2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">Q₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_flow : d1_flow) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_flow : d2_flow) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "head" && (
                    <>
                      {!h1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">H₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!h2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">H₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_head : d1_head) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_head : d2_head) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                  {activeSection === "power" && (
                    <>
                      {!p1 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">P₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!p2 && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">P₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n1_power : d1_power) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₁</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                      {!(mode === "CONSTANT_DIAMETER" ? n2_power : d2_power) && (
                        <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-400 dark:border-blue-600 rounded px-2 py-1 font-mono text-xs shadow-sm">
                          <strong className="text-blue-600 dark:text-blue-400 mr-1">{mode === "CONSTANT_DIAMETER" ? "N" : "D"}₂</strong>
                          <span className="text-foreground">= ?</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mathematical Step-by-Step Calculation Block */}
            {result.calculated && result.displayData ? (
              <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm mb-3 transition-all">
                <div className="bg-muted px-3 py-1.5 border-b border-border">
                  <h4 className="font-bold text-foreground uppercase text-[11px]">Calculation</h4>
                </div>
                
                {/* Step 1: Collapsible Unit Conversions */}
                {result.displayData.conversions && result.displayData.conversions.length > 0 && (
                  <div className="border-b border-border">
                    <button
                      onClick={() => setShowStep1(!showStep1)}
                      className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${showStep1 ? 'bg-muted/30' : ''}`}
                    >
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                        Step 1: Standardize Units
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-blue-700 dark:text-blue-300 transition-transform ${showStep1 ? 'rotate-180' : ''}`} />
                    </button>
                    {showStep1 && (
                      <div className="px-4 pb-3 space-y-1 text-xs font-mono bg-blue-50/50 dark:bg-blue-950/20 pt-1">
                        {result.displayData.conversions.map((conv, idx) => (
                          <div key={idx}>{conv}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 overflow-x-auto">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">
                    Step 2: Calculate Missing Value
                  </div>
                  <div className="grid grid-cols-[auto_auto_1fr] items-center gap-y-3 gap-x-3 font-serif text-base min-w-max">
                    
                    {/* Base Formula Render Block */}
                    {result.displayData.baseFormula && (
                      <>
                        <div className="flex flex-col items-center justify-self-end font-bold pr-1">
                          <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                            {result.displayData.baseFormula.leftNum}
                          </span>
                          <span className="pt-0.5 text-sm whitespace-nowrap">
                            {result.displayData.baseFormula.leftDenom}
                          </span>
                        </div>
                        <span className="text-center">=</span>
                        <div className="flex items-center justify-self-start font-bold">
                          {result.displayData.baseFormula.exponent ? (
                            <>
                              <span className="text-2xl text-muted-foreground font-light mr-0.5 leading-none mb-1">(</span>
                              <div className="flex flex-col items-center">
                                <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                                  {result.displayData.baseFormula.rightNum}
                                </span>
                                <span className="pt-0.5 text-sm whitespace-nowrap">
                                  {result.displayData.baseFormula.rightDenom}
                                </span>
                              </div>
                              <span className="text-2xl text-muted-foreground font-light ml-0.5 leading-none mb-1">)</span>
                              <sup className="text-[9px] font-bold -ml-0.5 mt-[-10px]">{result.displayData.baseFormula.exponent}</sup>
                            </>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="border-b-2 border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                                {result.displayData.baseFormula.rightNum}
                              </span>
                              <span className="pt-0.5 text-sm whitespace-nowrap">
                                {result.displayData.baseFormula.rightDenom}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Simple Fraction Block */}
                    {result.displayData.type === 'simple_fraction' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right justify-self-end pr-1 mt-2">{result.displayData.targetVariable}</div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex flex-col items-center justify-self-start mt-2">
                          <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap flex items-center font-bold">
                            <span>{result.displayData.varNum1}</span>
                            <span className="mx-2 text-sm font-sans opacity-70">×</span>
                            <span>{result.displayData.varNum2}</span>
                          </span>
                          <span className="pt-1 text-sm whitespace-nowrap font-bold">
                            <span>{result.displayData.varDenom}</span>
                          </span>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div className="justify-self-end mt-2"></div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex flex-wrap items-center justify-self-start mt-2 gap-y-2">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-3 pb-1 text-sm whitespace-nowrap flex items-center">
                              <MathPill>{result.displayData.num1}</MathPill>
                              <span className="mx-2 text-sm font-sans opacity-70">×</span>
                              <MathPill>{result.displayData.num2}</MathPill>
                            </span>
                            <span className="pt-1 text-sm whitespace-nowrap">
                              <MathPill>{result.displayData.denom}</MathPill>
                            </span>
                          </div>
                          {/* Compact "Step 1" Indicator */}
                          {result.displayData.conversions && result.displayData.conversions.length > 0 && (
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
                      </>
                    )}

                    {/* Power Formula Block */}
                    {result.displayData.type === 'power' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right justify-self-end pr-1 mt-2">{result.displayData.targetVariable}</div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex items-center justify-self-start font-bold mt-2">
                          <span>{result.displayData.varMultiplier}</span>
                          <span className="mx-2 text-sm font-sans opacity-70">×</span>
                          <span className="text-2xl text-muted-foreground font-light mr-0.5 leading-none mb-1">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                              <span>{result.displayData.varNum}</span>
                            </span>
                            <span className="pt-0.5 text-sm whitespace-nowrap">
                              <span>{result.displayData.varDenom}</span>
                            </span>
                          </div>
                          <span className="text-2xl text-muted-foreground font-light ml-0.5 leading-none mb-1">)</span>
                          <sup className="text-[9px] font-bold -ml-0.5 mt-[-10px]">{result.displayData.exponent}</sup>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div className="justify-self-end mt-2"></div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex flex-wrap items-center justify-self-start mt-2 gap-y-2">
                          <div className="flex items-center">
                            <MathPill>{result.displayData.multiplier}</MathPill>
                            <span className="mx-2 text-sm font-sans opacity-70">×</span>
                            <span className="text-2xl text-muted-foreground font-light mr-0.5 leading-none mb-1">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                                <MathPill>{result.displayData.num}</MathPill>
                              </span>
                              <span className="pt-0.5 text-sm whitespace-nowrap">
                                <MathPill>{result.displayData.denom}</MathPill>
                              </span>
                            </div>
                            <span className="text-2xl text-muted-foreground font-light ml-0.5 leading-none mb-1">)</span>
                            <sup className="text-[9px] font-bold -ml-0.5 mt-[-10px]">{result.displayData.exponent}</sup>
                          </div>
                          {/* Compact "Step 1" Indicator */}
                          {result.displayData.conversions && result.displayData.conversions.length > 0 && (
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
                      </>
                    )}

                    {/* Root Formula Block */}
                    {result.displayData.type === 'root' && (
                      <>
                        {/* Step 1: Variable Formula */}
                        <div className="font-bold text-right justify-self-end pr-1 mt-2">{result.displayData.targetVariable}</div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex items-center justify-self-start font-bold mt-2">
                          <span>{result.displayData.varMultiplier}</span>
                          <span className="mx-2 text-sm font-sans opacity-70">×</span>
                          <span className="text-2xl text-muted-foreground font-light mr-0.5 leading-none mb-1">(</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                              <span>{result.displayData.varNum}</span>
                            </span>
                            <span className="pt-0.5 text-sm whitespace-nowrap">
                              <span>{result.displayData.varDenom}</span>
                            </span>
                          </div>
                          <span className="text-2xl text-muted-foreground font-light ml-0.5 leading-none mb-1">)</span>
                          <sup className="text-[9px] font-bold -ml-0.5 mt-[-10px]">1/{result.displayData.exponent}</sup>
                        </div>

                        {/* Step 2: Substituted Numbers */}
                        <div className="justify-self-end mt-2"></div>
                        <span className="text-center mt-2">=</span>
                        <div className="flex flex-wrap items-center justify-self-start mt-2 gap-y-2">
                          <div className="flex items-center">
                            <MathPill>{result.displayData.multiplier}</MathPill>
                            <span className="mx-2 text-sm font-sans opacity-70">×</span>
                            <span className="text-2xl text-muted-foreground font-light mr-0.5 leading-none mb-1">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-2 pb-0.5 text-sm whitespace-nowrap">
                                <MathPill>{result.displayData.num}</MathPill>
                              </span>
                              <span className="pt-0.5 text-sm whitespace-nowrap">
                                <MathPill>{result.displayData.denom}</MathPill>
                              </span>
                            </div>
                            <span className="text-2xl text-muted-foreground font-light ml-0.5 leading-none mb-1">)</span>
                            <sup className="text-[9px] font-bold -ml-0.5 mt-[-10px]">1/{result.displayData.exponent}</sup>
                          </div>
                          {/* Compact "Step 1" Indicator */}
                          {result.displayData.conversions && result.displayData.conversions.length > 0 && (
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
                      </>
                    )}

                    {/* Final Result Evaluation Row */}
                    <div className="justify-self-end"></div>
                    <span className="text-center font-bold mt-3">≈</span>
                    <div className="font-bold text-base justify-self-start mt-3 text-blue-600 dark:text-blue-400">
                      {result.displayData.result} <span className="font-sans opacity-90">{result.displayData.resultUnit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-background rounded-md border border-border overflow-hidden shadow-sm mb-3">
                <div className="bg-muted px-3 py-1.5 border-b border-border">
                  <h4 className="font-bold text-foreground uppercase text-[11px]">Calculation</h4>
                </div>
                <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground min-h-[120px]">
                  <svg className="w-8 h-8 opacity-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Enter values and click calculate to see breakdown...</span>
                </div>
              </div>
            )}

            {/* Final Result Container - Fixed height */}
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
                       <div className="text-2xl font-black truncate min-w-0 tracking-tight" title={result.label}>
                         {result.label}
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