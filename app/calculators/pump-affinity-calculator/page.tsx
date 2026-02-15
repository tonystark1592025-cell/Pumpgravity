"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  convertToSI, 
  convertFromSI, 
  flowUnits, 
  headUnits, 
  powerUnits,
  speedUnits,
  diameterUnits
} from "@/lib/unit-conversions"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")
  const [activeSection, setActiveSection] = useState<string>("flow")

  // Flow section states with units
  const [q1, setQ1] = useState<string>("")
  const [q1Unit, setQ1Unit] = useState<string>("m3h")
  const [q2, setQ2] = useState<string>("")
  const [q2Unit, setQ2Unit] = useState<string>("m3h")
  const [flowVal1, setFlowVal1] = useState<string>("")
  const [flowVal1Unit, setFlowVal1Unit] = useState<string>("rpm")
  const [flowVal2, setFlowVal2] = useState<string>("")
  const [flowVal2Unit, setFlowVal2Unit] = useState<string>("rpm")

  // Head section states with units
  const [h1, setH1] = useState<string>("")
  const [h1Unit, setH1Unit] = useState<string>("m")
  const [h2, setH2] = useState<string>("")
  const [h2Unit, setH2Unit] = useState<string>("m")
  const [headVal1, setHeadVal1] = useState<string>("")
  const [headVal1Unit, setHeadVal1Unit] = useState<string>("rpm")
  const [headVal2, setHeadVal2] = useState<string>("")
  const [headVal2Unit, setHeadVal2Unit] = useState<string>("rpm")

  // Power section states with units
  const [p1, setP1] = useState<string>("")
  const [p1Unit, setP1Unit] = useState<string>("kw")
  const [p2, setP2] = useState<string>("")
  const [p2Unit, setP2Unit] = useState<string>("kw")
  const [powerVal1, setPowerVal1] = useState<string>("")
  const [powerVal1Unit, setPowerVal1Unit] = useState<string>("rpm")
  const [powerVal2, setPowerVal2] = useState<string>("")
  const [powerVal2Unit, setPowerVal2Unit] = useState<string>("rpm")

  const [result, setResult] = useState<{
    value: string
    valueSI: string
    label: string
    calculated: boolean
    steps: string[]
  }>({
    value: "", 
    valueSI: "",
    label: "", 
    calculated: false,
    steps: []
  })

  // Update units when mode changes
  const handleModeChange = (newMode: LawMode) => {
    setMode(newMode)
    const newUnit = newMode === "CONSTANT_DIAMETER" ? "rpm" : "mm"
    
    // Update all speed/diameter units
    setFlowVal1Unit(newUnit)
    setFlowVal2Unit(newUnit)
    setHeadVal1Unit(newUnit)
    setHeadVal2Unit(newUnit)
    setPowerVal1Unit(newUnit)
    setPowerVal2Unit(newUnit)
    
    setResult({...result, calculated: false})
  }

  const handleCalculate = () => {
    // Get current section's values and units
    let v1_input: number | null = null
    let v2_input: number | null = null
    let v1_unit = ""
    let v2_unit = ""
    
    if (activeSection === "flow") {
      v1_input = flowVal1 ? parseFloat(flowVal1) : null
      v2_input = flowVal2 ? parseFloat(flowVal2) : null
      v1_unit = flowVal1Unit
      v2_unit = flowVal2Unit
    } else if (activeSection === "head") {
      v1_input = headVal1 ? parseFloat(headVal1) : null
      v2_input = headVal2 ? parseFloat(headVal2) : null
      v1_unit = headVal1Unit
      v2_unit = headVal2Unit
    } else if (activeSection === "power") {
      v1_input = powerVal1 ? parseFloat(powerVal1) : null
      v2_input = powerVal2 ? parseFloat(powerVal2) : null
      v1_unit = powerVal1Unit
      v2_unit = powerVal2Unit
    }

    const flow1_input = q1 ? parseFloat(q1) : null
    const flow2_input = q2 ? parseFloat(q2) : null
    const head1_input = h1 ? parseFloat(h1) : null
    const head2_input = h2 ? parseFloat(h2) : null
    const power1_input = p1 ? parseFloat(p1) : null
    const power2_input = p2 ? parseFloat(p2) : null

    // Count filled values
    const values = [v1_input, v2_input]
    let sectionValues: (number | null)[] = []
    
    if (activeSection === "flow") {
      sectionValues = [flow1_input, flow2_input]
    } else if (activeSection === "head") {
      sectionValues = [head1_input, head2_input]
    } else if (activeSection === "power") {
      sectionValues = [power1_input, power2_input]
    }

    const allValues = [...values, ...sectionValues]
    const filledCount = allValues.filter(v => v !== null).length

    if (filledCount < 3) {
      setResult({ 
        value: "", 
        valueSI: "",
        label: "Please enter any 3 values to calculate the 4th", 
        calculated: false,
        steps: []
      })
      return
    }

    if (filledCount > 3) {
      setResult({ 
        value: "", 
        valueSI: "",
        label: "Please leave ONE value empty to calculate", 
        calculated: false,
        steps: []
      })
      return
    }

    const symbol = mode === "CONSTANT_DIAMETER" ? "N" : "D"
    const unitType = mode === "CONSTANT_DIAMETER" ? "speed" : "diameter"
    const unitLabel = mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"

    let steps: string[] = []
    let resultValue = ""
    let resultValueSI = ""
    let resultLabel = ""

    // FLOW SECTION CALCULATIONS
    if (activeSection === "flow") {
      // Convert inputs to SI
      const v1_SI = v1_input !== null ? convertToSI(v1_input, v1_unit, unitType) : null
      const v2_SI = v2_input !== null ? convertToSI(v2_input, v2_unit, unitType) : null
      const flow1_SI = flow1_input !== null ? convertToSI(flow1_input, q1Unit, 'flow') : null
      const flow2_SI = flow2_input !== null ? convertToSI(flow2_input, q2Unit, 'flow') : null

      steps.push("Step 1: Convert inputs to SI units")
      if (v1_input !== null) steps.push(`  ${symbol}₁ = ${v1_input} ${v1_unit} = ${v1_SI?.toFixed(2)} ${unitLabel}`)
      if (v2_input !== null) steps.push(`  ${symbol}₂ = ${v2_input} ${v2_unit} = ${v2_SI?.toFixed(2)} ${unitLabel}`)
      if (flow1_input !== null) steps.push(`  Q₁ = ${flow1_input} ${flowUnits.find(u => u.value === q1Unit)?.label} = ${flow1_SI?.toFixed(2)} m³/h`)
      if (flow2_input !== null) steps.push(`  Q₂ = ${flow2_input} ${flowUnits.find(u => u.value === q2Unit)?.label} = ${flow2_SI?.toFixed(2)} m³/h`)
      steps.push("")
      steps.push("Step 2: Apply Affinity Law (Q₁/Q₂ = N₁/N₂)")

      // Flow Rate: Q1/Q2 = N1/N2 (or D1/D2)
      if (v1_SI !== null && v2_SI !== null && flow1_SI !== null && flow2_SI === null) {
        // Calculate Q2
        const calc_SI = (flow1_SI * (v2_SI / v1_SI))
        const calc_output = convertFromSI(calc_SI, q2Unit, 'flow')
        setQ2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `Q₂ = ${calc_output.toFixed(2)} ${flowUnits.find(u => u.value === q2Unit)?.label}`
        steps.push(`  Q₂ = Q₁ × (${symbol}₂ / ${symbol}₁)`)
        steps.push(`  Q₂ = ${flow1_SI.toFixed(2)} × (${v2_SI.toFixed(2)} / ${v1_SI.toFixed(2)})`)
        steps.push(`  Q₂ = ${calc_SI.toFixed(2)} m³/h (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${flowUnits.find(u => u.value === q2Unit)?.label}`)
        steps.push(`  Q₂ = ${calc_output.toFixed(2)} ${flowUnits.find(u => u.value === q2Unit)?.label}`)
      } else if (v1_SI !== null && v2_SI !== null && flow2_SI !== null && flow1_SI === null) {
        // Calculate Q1
        const calc_SI = (flow2_SI * (v1_SI / v2_SI))
        const calc_output = convertFromSI(calc_SI, q1Unit, 'flow')
        setQ1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `Q₁ = ${calc_output.toFixed(2)} ${flowUnits.find(u => u.value === q1Unit)?.label}`
        steps.push(`  Q₁ = Q₂ × (${symbol}₁ / ${symbol}₂)`)
        steps.push(`  Q₁ = ${flow2_SI.toFixed(2)} × (${v1_SI.toFixed(2)} / ${v2_SI.toFixed(2)})`)
        steps.push(`  Q₁ = ${calc_SI.toFixed(2)} m³/h (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${flowUnits.find(u => u.value === q1Unit)?.label}`)
        steps.push(`  Q₁ = ${calc_output.toFixed(2)} ${flowUnits.find(u => u.value === q1Unit)?.label}`)
      } else if (v1_SI !== null && flow1_SI !== null && flow2_SI !== null && v2_SI === null) {
        // Calculate N2/D2
        const calc_SI = (v1_SI * (flow2_SI / flow1_SI))
        const calc_output = convertFromSI(calc_SI, v2_unit, unitType)
        setFlowVal2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`
        steps.push(`  ${symbol}₂ = ${symbol}₁ × (Q₂ / Q₁)`)
        steps.push(`  ${symbol}₂ = ${v1_SI.toFixed(2)} × (${flow2_SI.toFixed(2)} / ${flow1_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₂ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v2_unit}`)
        steps.push(`  ${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`)
      } else if (v2_SI !== null && flow1_SI !== null && flow2_SI !== null && v1_SI === null) {
        // Calculate N1/D1
        const calc_SI = (v2_SI * (flow1_SI / flow2_SI))
        const calc_output = convertFromSI(calc_SI, v1_unit, unitType)
        setFlowVal1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`
        steps.push(`  ${symbol}₁ = ${symbol}₂ × (Q₁ / Q₂)`)
        steps.push(`  ${symbol}₁ = ${v2_SI.toFixed(2)} × (${flow1_SI.toFixed(2)} / ${flow2_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₁ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v1_unit}`)
        steps.push(`  ${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`)
      }
    }

    // HEAD SECTION CALCULATIONS
    if (activeSection === "head") {
      // Convert inputs to SI
      const v1_SI = v1_input !== null ? convertToSI(v1_input, v1_unit, unitType) : null
      const v2_SI = v2_input !== null ? convertToSI(v2_input, v2_unit, unitType) : null
      const head1_SI = head1_input !== null ? convertToSI(head1_input, h1Unit, 'head') : null
      const head2_SI = head2_input !== null ? convertToSI(head2_input, h2Unit, 'head') : null

      steps.push("Step 1: Convert inputs to SI units")
      if (v1_input !== null) steps.push(`  ${symbol}₁ = ${v1_input} ${v1_unit} = ${v1_SI?.toFixed(2)} ${unitLabel}`)
      if (v2_input !== null) steps.push(`  ${symbol}₂ = ${v2_input} ${v2_unit} = ${v2_SI?.toFixed(2)} ${unitLabel}`)
      if (head1_input !== null) steps.push(`  H₁ = ${head1_input} ${headUnits.find(u => u.value === h1Unit)?.label} = ${head1_SI?.toFixed(2)} m`)
      if (head2_input !== null) steps.push(`  H₂ = ${head2_input} ${headUnits.find(u => u.value === h2Unit)?.label} = ${head2_SI?.toFixed(2)} m`)
      steps.push("")
      steps.push("Step 2: Apply Affinity Law (H₁/H₂ = (N₁/N₂)²)")

      // Head: H1/H2 = (N1/N2)^2 (or (D1/D2)^2)
      if (v1_SI !== null && v2_SI !== null && head1_SI !== null && head2_SI === null) {
        // Calculate H2
        const calc_SI = (head1_SI * Math.pow(v2_SI / v1_SI, 2))
        const calc_output = convertFromSI(calc_SI, h2Unit, 'head')
        setH2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `H₂ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h2Unit)?.label}`
        steps.push(`  H₂ = H₁ × (${symbol}₂ / ${symbol}₁)²`)
        steps.push(`  H₂ = ${head1_SI.toFixed(2)} × (${v2_SI.toFixed(2)} / ${v1_SI.toFixed(2)})²`)
        steps.push(`  H₂ = ${calc_SI.toFixed(2)} m (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${headUnits.find(u => u.value === h2Unit)?.label}`)
        steps.push(`  H₂ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h2Unit)?.label}`)
      } else if (v1_SI !== null && v2_SI !== null && head2_SI !== null && head1_SI === null) {
        // Calculate H1
        const calc_SI = (head2_SI * Math.pow(v1_SI / v2_SI, 2))
        const calc_output = convertFromSI(calc_SI, h1Unit, 'head')
        setH1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `H₁ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h1Unit)?.label}`
        steps.push(`  H₁ = H₂ × (${symbol}₁ / ${symbol}₂)²`)
        steps.push(`  H₁ = ${head2_SI.toFixed(2)} × (${v1_SI.toFixed(2)} / ${v2_SI.toFixed(2)})²`)
        steps.push(`  H₁ = ${calc_SI.toFixed(2)} m (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${headUnits.find(u => u.value === h1Unit)?.label}`)
        steps.push(`  H₁ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h1Unit)?.label}`)
      } else if (v1_SI !== null && head1_SI !== null && head2_SI !== null && v2_SI === null) {
        // Calculate N2/D2
        const calc_SI = (v1_SI * Math.sqrt(head2_SI / head1_SI))
        const calc_output = convertFromSI(calc_SI, v2_unit, unitType)
        setHeadVal2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`
        steps.push(`  ${symbol}₂ = ${symbol}₁ × √(H₂ / H₁)`)
        steps.push(`  ${symbol}₂ = ${v1_SI.toFixed(2)} × √(${head2_SI.toFixed(2)} / ${head1_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₂ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v2_unit}`)
        steps.push(`  ${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`)
      } else if (v2_SI !== null && head1_SI !== null && head2_SI !== null && v1_SI === null) {
        // Calculate N1/D1
        const calc_SI = (v2_SI * Math.sqrt(head1_SI / head2_SI))
        const calc_output = convertFromSI(calc_SI, v1_unit, unitType)
        setHeadVal1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`
        steps.push(`  ${symbol}₁ = ${symbol}₂ × √(H₁ / H₂)`)
        steps.push(`  ${symbol}₁ = ${v2_SI.toFixed(2)} × √(${head1_SI.toFixed(2)} / ${head2_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₁ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v1_unit}`)
        steps.push(`  ${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`)
      }
    }

    // POWER SECTION CALCULATIONS
    if (activeSection === "power") {
      // Convert inputs to SI
      const v1_SI = v1_input !== null ? convertToSI(v1_input, v1_unit, unitType) : null
      const v2_SI = v2_input !== null ? convertToSI(v2_input, v2_unit, unitType) : null
      const power1_SI = power1_input !== null ? convertToSI(power1_input, p1Unit, 'power') : null
      const power2_SI = power2_input !== null ? convertToSI(power2_input, p2Unit, 'power') : null

      steps.push("Step 1: Convert inputs to SI units")
      if (v1_input !== null) steps.push(`  ${symbol}₁ = ${v1_input} ${v1_unit} = ${v1_SI?.toFixed(2)} ${unitLabel}`)
      if (v2_input !== null) steps.push(`  ${symbol}₂ = ${v2_input} ${v2_unit} = ${v2_SI?.toFixed(2)} ${unitLabel}`)
      if (power1_input !== null) steps.push(`  P₁ = ${power1_input} ${powerUnits.find(u => u.value === p1Unit)?.label} = ${power1_SI?.toFixed(2)} kW`)
      if (power2_input !== null) steps.push(`  P₂ = ${power2_input} ${powerUnits.find(u => u.value === p2Unit)?.label} = ${power2_SI?.toFixed(2)} kW`)
      steps.push("")
      steps.push("Step 2: Apply Affinity Law (P₁/P₂ = (N₁/N₂)³)")

      // Power: P1/P2 = (N1/N2)^3 (or (D1/D2)^3)
      if (v1_SI !== null && v2_SI !== null && power1_SI !== null && power2_SI === null) {
        // Calculate P2
        const calc_SI = (power1_SI * Math.pow(v2_SI / v1_SI, 3))
        const calc_output = convertFromSI(calc_SI, p2Unit, 'power')
        setP2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `P₂ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p2Unit)?.label}`
        steps.push(`  P₂ = P₁ × (${symbol}₂ / ${symbol}₁)³`)
        steps.push(`  P₂ = ${power1_SI.toFixed(2)} × (${v2_SI.toFixed(2)} / ${v1_SI.toFixed(2)})³`)
        steps.push(`  P₂ = ${calc_SI.toFixed(2)} kW (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${powerUnits.find(u => u.value === p2Unit)?.label}`)
        steps.push(`  P₂ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p2Unit)?.label}`)
      } else if (v1_SI !== null && v2_SI !== null && power2_SI !== null && power1_SI === null) {
        // Calculate P1
        const calc_SI = (power2_SI * Math.pow(v1_SI / v2_SI, 3))
        const calc_output = convertFromSI(calc_SI, p1Unit, 'power')
        setP1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `P₁ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p1Unit)?.label}`
        steps.push(`  P₁ = P₂ × (${symbol}₁ / ${symbol}₂)³`)
        steps.push(`  P₁ = ${power2_SI.toFixed(2)} × (${v1_SI.toFixed(2)} / ${v2_SI.toFixed(2)})³`)
        steps.push(`  P₁ = ${calc_SI.toFixed(2)} kW (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${powerUnits.find(u => u.value === p1Unit)?.label}`)
        steps.push(`  P₁ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p1Unit)?.label}`)
      } else if (v1_SI !== null && power1_SI !== null && power2_SI !== null && v2_SI === null) {
        // Calculate N2/D2
        const calc_SI = (v1_SI * Math.cbrt(power2_SI / power1_SI))
        const calc_output = convertFromSI(calc_SI, v2_unit, unitType)
        setPowerVal2(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`
        steps.push(`  ${symbol}₂ = ${symbol}₁ × ∛(P₂ / P₁)`)
        steps.push(`  ${symbol}₂ = ${v1_SI.toFixed(2)} × ∛(${power2_SI.toFixed(2)} / ${power1_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₂ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v2_unit}`)
        steps.push(`  ${symbol}₂ = ${calc_output.toFixed(2)} ${v2_unit}`)
      } else if (v2_SI !== null && power1_SI !== null && power2_SI !== null && v1_SI === null) {
        // Calculate N1/D1
        const calc_SI = (v2_SI * Math.cbrt(power1_SI / power2_SI))
        const calc_output = convertFromSI(calc_SI, v1_unit, unitType)
        setPowerVal1(calc_output.toFixed(2))
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`
        steps.push(`  ${symbol}₁ = ${symbol}₂ × ∛(P₁ / P₂)`)
        steps.push(`  ${symbol}₁ = ${v2_SI.toFixed(2)} × ∛(${power1_SI.toFixed(2)} / ${power2_SI.toFixed(2)})`)
        steps.push(`  ${symbol}₁ = ${calc_SI.toFixed(2)} ${unitLabel} (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${v1_unit}`)
        steps.push(`  ${symbol}₁ = ${calc_output.toFixed(2)} ${v1_unit}`)
      }
    }

    setResult({
      value: resultValue,
      valueSI: resultValueSI,
      label: resultLabel,
      calculated: true,
      steps
    })
  }

  const symbol = mode === "CONSTANT_DIAMETER" ? "N" : "D"
  const unitType = mode === "CONSTANT_DIAMETER" ? "speed" : "diameter"
  const currentUnits = mode === "CONSTANT_DIAMETER" ? speedUnits : diameterUnits


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
            Auto Unit Conversion - Enter values in any unit!
          </span>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col">
          
          <div className="flex border-b border-border">
            <button
              onClick={() => handleModeChange("CONSTANT_SPEED")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-r border-border transition-colors ${
                mode === "CONSTANT_SPEED" 
                  ? "bg-card text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-muted text-muted-foreground hover:bg-card"
              }`}
            >
              Constant Speed <span className="text-[10px] lowercase opacity-70">(Change Diameter)</span>
            </button>
            <button
              onClick={() => handleModeChange("CONSTANT_DIAMETER")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                mode === "CONSTANT_DIAMETER" 
                  ? "bg-card text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-muted text-muted-foreground hover:bg-card"
              }`}
            >
              Constant Diameter <span className="text-[10px] lowercase opacity-70">(Change Speed)</span>
            </button>
          </div>

          <div className="p-6">
            
            <Accordion type="single" value={activeSection} onValueChange={(value) => setActiveSection(value || "flow")} className="space-y-2 [&>*]:!border-b-0">
              
              {/* FLOW SECTION */}
              <AccordionItem value="flow" className="border border-border rounded-lg px-4 bg-card [&:not(:last-child)]:mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">1. Flow Rate (Q)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    <div className="bg-muted p-4 flex justify-center border border-border rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">Q₁</span>
                            <span>Q₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">{symbol}₁</span>
                            <span>{symbol}₂</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                       {/* Q1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={q1} 
                              onChange={e => setQ1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={q1Unit} onValueChange={setQ1Unit}>
                              <SelectTrigger className="w-24 text-xs">
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

                       {/* N1/D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={flowVal1} 
                              onChange={e => setFlowVal1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={flowVal1Unit} onValueChange={setFlowVal1Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* Q2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={q2} 
                              onChange={e => setQ2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={q2Unit} onValueChange={setQ2Unit}>
                              <SelectTrigger className="w-24 text-xs">
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

                       {/* N2/D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={flowVal2} 
                              onChange={e => setFlowVal2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={flowVal2Unit} onValueChange={setFlowVal2Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    <div className="bg-muted p-4 flex justify-center border border-border rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">H₁</span>
                            <span>H₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-muted-foreground font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-1">{symbol}₁</span>
                              <span>{symbol}₂</span>
                            </div>
                            <span className="text-4xl text-muted-foreground font-light">)</span>
                            <sup className="text-sm font-bold mb-6">2</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                       {/* H1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={h1} 
                              onChange={e => setH1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={h1Unit} onValueChange={setH1Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N1/D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={headVal1} 
                              onChange={e => setHeadVal1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={headVal1Unit} onValueChange={setHeadVal1Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* H2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={h2} 
                              onChange={e => setH2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={h2Unit} onValueChange={setH2Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {headUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N2/D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={headVal2} 
                              onChange={e => setHeadVal2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={headVal2Unit} onValueChange={setHeadVal2Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
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
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    <div className="bg-muted p-4 flex justify-center border border-border rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">P₁</span>
                            <span>P₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-muted-foreground font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-1">{symbol}₁</span>
                              <span>{symbol}₂</span>
                            </div>
                            <span className="text-4xl text-muted-foreground font-light">)</span>
                            <sup className="text-sm font-bold mb-6">3</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                       {/* P1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={p1} 
                              onChange={e => setP1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={p1Unit} onValueChange={setP1Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N1/D1 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={powerVal1} 
                              onChange={e => setPowerVal1(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={powerVal1Unit} onValueChange={setPowerVal1Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* P2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={p2} 
                              onChange={e => setP2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={p2Unit} onValueChange={setP2Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {powerUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {/* N2/D2 */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{symbol}₂:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={powerVal2} 
                              onChange={e => setPowerVal2(e.target.value)} 
                              placeholder="?" 
                              className="flex-1 border border-border bg-background rounded px-2 py-1.5 text-right"
                            />
                            <Select value={powerVal2Unit} onValueChange={setPowerVal2Unit}>
                              <SelectTrigger className="w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {currentUnits.map(u => (
                                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-lg tracking-wide shadow-md active:translate-y-0.5 transition-all mt-6"
            >
              CALCULATE
            </button>
          </div>
        </div>


        {/* RIGHT PANEL - RESULTS */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full">
          <div className="bg-muted px-6 py-4 border-b border-border">
             <h2 className="font-bold text-xl uppercase text-foreground">Calculation & Result</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <h4 className="font-bold text-foreground mb-2 uppercase text-sm">Instructions:</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter any 3 values. Leave the value you want to find empty. Click Calculate.
              </p>
            </div>

            {/* Formula Display based on active section */}
            <div className="mb-6 bg-muted rounded-lg p-6 border border-border">
              <h4 className="font-bold text-foreground mb-4 uppercase text-sm text-center">Active Formula</h4>
              
              {activeSection === "flow" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="font-serif text-3xl flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-foreground px-2">Q₁</span>
                      <span className="mt-1">Q₂</span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-foreground px-2">{symbol}₁</span>
                      <span className="mt-1">{symbol}₂</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Flow Rate (Linear Relationship)</p>
                </div>
              )}

              {activeSection === "head" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="font-serif text-3xl flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-foreground px-2">H₁</span>
                      <span className="mt-1">H₂</span>
                    </div>
                    <span>=</span>
                    <div className="flex items-center">
                      <span className="text-5xl text-muted-foreground font-light">(</span>
                      <div className="flex flex-col items-center">
                        <span className="border-b-2 border-foreground px-2">{symbol}₁</span>
                        <span className="mt-1">{symbol}₂</span>
                      </div>
                      <span className="text-5xl text-muted-foreground font-light">)</span>
                      <sup className="text-lg font-bold -ml-1" style={{verticalAlign: 'super'}}>2</sup>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Head (Square Relationship)</p>
                </div>
              )}

              {activeSection === "power" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="font-serif text-3xl flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-foreground px-2">P₁</span>
                      <span className="mt-1">P₂</span>
                    </div>
                    <span>=</span>
                    <div className="flex items-center">
                      <span className="text-5xl text-muted-foreground font-light">(</span>
                      <div className="flex flex-col items-center">
                        <span className="border-b-2 border-foreground px-2">{symbol}₁</span>
                        <span className="mt-1">{symbol}₂</span>
                      </div>
                      <span className="text-5xl text-muted-foreground font-light">)</span>
                      <sup className="text-lg font-bold -ml-1" style={{verticalAlign: 'super'}}>3</sup>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Power (Cubic Relationship)</p>
                </div>
              )}
            </div>

            {/* Calculation Steps */}
            {result.steps.length > 0 && (
              <div className="mb-4 bg-muted rounded-lg p-4 border border-border max-h-64 overflow-y-auto">
                <h4 className="font-bold text-foreground mb-2 uppercase text-xs">Calculation Steps:</h4>
                <div className="space-y-1">
                  {result.steps.map((step, index) => (
                    <p key={index} className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto">
              <div className={`rounded-lg p-8 text-center text-white shadow-lg transition-all duration-500 ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 <h2 className="text-2xl font-bold mb-4 uppercase opacity-90">
                   {result.calculated ? "Calculated Value" : "Result"}
                 </h2>
                 
                 {result.calculated ? (
                   <div>
                     <div className="text-sm uppercase opacity-80 mb-2">{result.label}</div>
                     <div className="text-5xl font-black mb-2">{result.value}</div>
                     {result.valueSI && (
                       <div className="text-sm opacity-80 mt-2">
                         ({result.valueSI} in SI units)
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="text-lg font-medium opacity-70 italic">
                     {result.label || "Enter values and click Calculate..."}
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

