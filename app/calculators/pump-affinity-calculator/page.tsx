"use client"

import { useState } from "react"
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

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const { toast } = useToast()
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

  const handleCalculate = () => {
    let steps: string[] = []
    let resultValue = ""
    let resultValueSI = ""
    let resultLabel = ""

    // Determine which values to use based on mode
    const isConstantDiameter = mode === "CONSTANT_DIAMETER"
    const symbol = isConstantDiameter ? "N" : "D"
    const unit = isConstantDiameter ? "RPM" : "mm"

    // FLOW SECTION CALCULATIONS
    if (activeSection === "flow") {
      const q1_input = q1 ? parseFloat(q1) : null
      const q2_input = q2 ? parseFloat(q2) : null
      
      // Get N or D values based on mode
      const v1_input = isConstantDiameter 
        ? (n1_flow ? parseFloat(n1_flow) : null)
        : (d1_flow ? parseFloat(d1_flow) : null)
      const v2_input = isConstantDiameter 
        ? (n2_flow ? parseFloat(n2_flow) : null)
        : (d2_flow ? parseFloat(d2_flow) : null)

      const allValues = [q1_input, q2_input, v1_input, v2_input]
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

      // Convert to SI
      const q1_SI = q1_input !== null ? convertToSI(q1_input, q1Unit, 'flow') : null
      const q2_SI = q2_input !== null ? convertToSI(q2_input, q2Unit, 'flow') : null
      const v1_SI = v1_input // RPM or mm is already SI
      const v2_SI = v2_input // RPM or mm is already SI

      steps.push("Step 1: Convert inputs to SI units")
      if (q1_input !== null) steps.push(`  Q₁ = ${q1_input} ${flowUnits.find(u => u.value === q1Unit)?.label} = ${formatSignificant(q1_SI.toString(), 6)} m³/h`)
      if (q2_input !== null) steps.push(`  Q₂ = ${q2_input} ${flowUnits.find(u => u.value === q2Unit)?.label} = ${formatSignificant(q2_SI.toString(), 6)} m³/h`)
      if (v1_input !== null) steps.push(`  ${symbol}₁ = ${v1_input} ${unit}`)
      if (v2_input !== null) steps.push(`  ${symbol}₂ = ${v2_input} ${unit}`)
      steps.push("")
      steps.push(`Step 2: Apply Affinity Law (Q₁/Q₂ = ${symbol}₁/${symbol}₂)`)

      // Use precision calculator
      const result = calculateFlowRate(q1_SI, q2_SI, v1_SI, v2_SI)
      
      if (result) {
        const calc_SI = parseFloat(result.value)
        
        if (result.variable === 'q2') {
          const calc_output = convertFromSI(calc_SI, q2Unit, 'flow')
          // Don't set the input field - only show in result area
          resultValue = formatResult(calc_output.toString())
          resultValueSI = formatResult(result.value)
          resultLabel = `Q₂ = ${formatResult(calc_output.toString())} ${flowUnits.find(u => u.value === q2Unit)?.label}`
          steps.push(`  Q₂ = Q₁ × (${symbol}₂ / ${symbol}₁)`)
          steps.push(`  Q₂ = ${formatSignificant(q1_SI!.toString(), 6)} × (${v2_SI} / ${v1_SI})`)
          steps.push(`  Q₂ = ${formatResult(result.value)} m³/h (SI)`)
          steps.push("")
          steps.push(`Step 3: Convert to ${flowUnits.find(u => u.value === q2Unit)?.label}`)
          steps.push(`  Q₂ = ${formatResult(calc_output.toString())} ${flowUnits.find(u => u.value === q2Unit)?.label}`)
        } else if (result.variable === 'q1') {
          const calc_output = convertFromSI(calc_SI, q1Unit, 'flow')
          // Don't set the input field - only show in result area
          resultValue = formatResult(calc_output.toString())
          resultValueSI = formatResult(result.value)
          resultLabel = `Q₁ = ${formatResult(calc_output.toString())} ${flowUnits.find(u => u.value === q1Unit)?.label}`
          steps.push(`  Q₁ = Q₂ × (${symbol}₁ / ${symbol}₂)`)
          steps.push(`  Q₁ = ${formatSignificant(q2_SI!.toString(), 6)} × (${v1_SI} / ${v2_SI})`)
          steps.push(`  Q₁ = ${formatResult(result.value)} m³/h (SI)`)
          steps.push("")
          steps.push(`Step 3: Convert to ${flowUnits.find(u => u.value === q1Unit)?.label}`)
          steps.push(`  Q₁ = ${formatResult(calc_output.toString())} ${flowUnits.find(u => u.value === q1Unit)?.label}`)
        } else if (result.variable === 'v2') {
          // Don't set the input field - only show in result area
          resultValue = formatResult(result.value)
          resultValueSI = formatResult(result.value)
          resultLabel = `${symbol}₂ = ${formatResult(result.value)} ${unit}`
          steps.push(`  ${symbol}₂ = ${symbol}₁ × (Q₂ / Q₁)`)
          steps.push(`  ${symbol}₂ = ${v1_SI} × (${formatSignificant(q2_SI!.toString(), 6)} / ${formatSignificant(q1_SI!.toString(), 6)})`)
          steps.push(`  ${symbol}₂ = ${formatResult(result.value)} ${unit}`)
        } else if (result.variable === 'v1') {
          // Don't set the input field - only show in result area
          resultValue = formatResult(result.value)
          resultValueSI = formatResult(result.value)
          resultLabel = `${symbol}₁ = ${formatResult(result.value)} ${unit}`
          steps.push(`  ${symbol}₁ = ${symbol}₂ × (Q₁ / Q₂)`)
          steps.push(`  ${symbol}₁ = ${v2_SI} × (${formatSignificant(q1_SI!.toString(), 6)} / ${formatSignificant(q2_SI!.toString(), 6)})`)
          steps.push(`  ${symbol}₁ = ${formatResult(result.value)} ${unit}`)
        }
      }
    }

    // HEAD SECTION CALCULATIONS
    if (activeSection === "head") {
      const h1_input = h1 ? parseFloat(h1) : null
      const h2_input = h2 ? parseFloat(h2) : null
      const n1_input = n1_head ? parseFloat(n1_head) : null
      const n2_input = n2_head ? parseFloat(n2_head) : null

      const allValues = [h1_input, h2_input, n1_input, n2_input]
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

      // Convert to SI
      const h1_SI = h1_input !== null ? convertToSI(h1_input, h1Unit, 'head') : null
      const h2_SI = h2_input !== null ? convertToSI(h2_input, h2Unit, 'head') : null
      const n1_SI = n1_input // RPM is already SI
      const n2_SI = n2_input // RPM is already SI

      steps.push("Step 1: Convert inputs to SI units")
      if (h1_input !== null) steps.push(`  H₁ = ${h1_input} ${headUnits.find(u => u.value === h1Unit)?.label} = ${h1_SI?.toFixed(2)} m`)
      if (h2_input !== null) steps.push(`  H₂ = ${h2_input} ${headUnits.find(u => u.value === h2Unit)?.label} = ${h2_SI?.toFixed(2)} m`)
      if (n1_input !== null) steps.push(`  N₁ = ${n1_input} RPM`)
      if (n2_input !== null) steps.push(`  N₂ = ${n2_input} RPM`)
      steps.push("")
      steps.push("Step 2: Apply Affinity Law (H₁/H₂ = (N₁/N₂)²)")

      // Head: H1/H2 = (N1/N2)^2
      if (n1_SI !== null && n2_SI !== null && h1_SI !== null && h2_SI === null) {
        // Calculate H2
        const calc_SI = (h1_SI * Math.pow(n2_SI / n1_SI, 2))
        const calc_output = convertFromSI(calc_SI, h2Unit, 'head')
        // Don't set the input field - only show in result area
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `H₂ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h2Unit)?.label}`
        steps.push(`  H₂ = H₁ × (N₂ / N₁)²`)
        steps.push(`  H₂ = ${h1_SI.toFixed(2)} × (${n2_SI} / ${n1_SI})²`)
        steps.push(`  H₂ = ${calc_SI.toFixed(2)} m (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${headUnits.find(u => u.value === h2Unit)?.label}`)
        steps.push(`  H₂ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h2Unit)?.label}`)
      } else if (n1_SI !== null && n2_SI !== null && h2_SI !== null && h1_SI === null) {
        // Calculate H1
        const calc_SI = (h2_SI * Math.pow(n1_SI / n2_SI, 2))
        const calc_output = convertFromSI(calc_SI, h1Unit, 'head')
        // Don't set the input field - only show in result area
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `H₁ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h1Unit)?.label}`
        steps.push(`  H₁ = H₂ × (N₁ / N₂)²`)
        steps.push(`  H₁ = ${h2_SI.toFixed(2)} × (${n1_SI} / ${n2_SI})²`)
        steps.push(`  H₁ = ${calc_SI.toFixed(2)} m (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${headUnits.find(u => u.value === h1Unit)?.label}`)
        steps.push(`  H₁ = ${calc_output.toFixed(2)} ${headUnits.find(u => u.value === h1Unit)?.label}`)
      } else if (n1_SI !== null && h1_SI !== null && h2_SI !== null && n2_SI === null) {
        // Calculate N2
        const calc = (n1_SI * Math.sqrt(h2_SI / h1_SI))
        // Don't set the input field - only show in result area
        resultValue = calc.toFixed(2)
        resultValueSI = calc.toFixed(2)
        resultLabel = `N₂ = ${calc.toFixed(2)} RPM`
        steps.push(`  N₂ = N₁ × √(H₂ / H₁)`)
        steps.push(`  N₂ = ${n1_SI} × √(${h2_SI.toFixed(2)} / ${h1_SI.toFixed(2)})`)
        steps.push(`  N₂ = ${calc.toFixed(2)} RPM`)
      } else if (n2_SI !== null && h1_SI !== null && h2_SI !== null && n1_SI === null) {
        // Calculate N1
        const calc = (n2_SI * Math.sqrt(h1_SI / h2_SI))
        // Don't set the input field - only show in result area
        resultValue = calc.toFixed(2)
        resultValueSI = calc.toFixed(2)
        resultLabel = `N₁ = ${calc.toFixed(2)} RPM`
        steps.push(`  N₁ = N₂ × √(H₁ / H₂)`)
        steps.push(`  N₁ = ${n2_SI} × √(${h1_SI.toFixed(2)} / ${h2_SI.toFixed(2)})`)
        steps.push(`  N₁ = ${calc.toFixed(2)} RPM`)
      }
    }

    // POWER SECTION CALCULATIONS
    if (activeSection === "power") {
      const p1_input = p1 ? parseFloat(p1) : null
      const p2_input = p2 ? parseFloat(p2) : null
      const n1_input = n1_power ? parseFloat(n1_power) : null
      const n2_input = n2_power ? parseFloat(n2_power) : null

      const allValues = [p1_input, p2_input, n1_input, n2_input]
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

      // Convert to SI
      const p1_SI = p1_input !== null ? convertToSI(p1_input, p1Unit, 'power') : null
      const p2_SI = p2_input !== null ? convertToSI(p2_input, p2Unit, 'power') : null
      const n1_SI = n1_input // RPM is already SI
      const n2_SI = n2_input // RPM is already SI

      steps.push("Step 1: Convert inputs to SI units")
      if (p1_input !== null) steps.push(`  P₁ = ${p1_input} ${powerUnits.find(u => u.value === p1Unit)?.label} = ${p1_SI?.toFixed(2)} kW`)
      if (p2_input !== null) steps.push(`  P₂ = ${p2_input} ${powerUnits.find(u => u.value === p2Unit)?.label} = ${p2_SI?.toFixed(2)} kW`)
      if (n1_input !== null) steps.push(`  N₁ = ${n1_input} RPM`)
      if (n2_input !== null) steps.push(`  N₂ = ${n2_input} RPM`)
      steps.push("")
      steps.push("Step 2: Apply Affinity Law (P₁/P₂ = (N₁/N₂)³)")

      // Power: P1/P2 = (N1/N2)^3
      if (n1_SI !== null && n2_SI !== null && p1_SI !== null && p2_SI === null) {
        // Calculate P2
        const calc_SI = (p1_SI * Math.pow(n2_SI / n1_SI, 3))
        const calc_output = convertFromSI(calc_SI, p2Unit, 'power')
        // Don't set the input field - only show in result area
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `P₂ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p2Unit)?.label}`
        steps.push(`  P₂ = P₁ × (N₂ / N₁)³`)
        steps.push(`  P₂ = ${p1_SI.toFixed(2)} × (${n2_SI} / ${n1_SI})³`)
        steps.push(`  P₂ = ${calc_SI.toFixed(2)} kW (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${powerUnits.find(u => u.value === p2Unit)?.label}`)
        steps.push(`  P₂ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p2Unit)?.label}`)
      } else if (n1_SI !== null && n2_SI !== null && p2_SI !== null && p1_SI === null) {
        // Calculate P1
        const calc_SI = (p2_SI * Math.pow(n1_SI / n2_SI, 3))
        const calc_output = convertFromSI(calc_SI, p1Unit, 'power')
        // Don't set the input field - only show in result area
        resultValue = calc_output.toFixed(2)
        resultValueSI = calc_SI.toFixed(2)
        resultLabel = `P₁ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p1Unit)?.label}`
        steps.push(`  P₁ = P₂ × (N₁ / N₂)³`)
        steps.push(`  P₁ = ${p2_SI.toFixed(2)} × (${n1_SI} / ${n2_SI})³`)
        steps.push(`  P₁ = ${calc_SI.toFixed(2)} kW (SI)`)
        steps.push("")
        steps.push(`Step 3: Convert to ${powerUnits.find(u => u.value === p1Unit)?.label}`)
        steps.push(`  P₁ = ${calc_output.toFixed(2)} ${powerUnits.find(u => u.value === p1Unit)?.label}`)
      } else if (n1_SI !== null && p1_SI !== null && p2_SI !== null && n2_SI === null) {
        // Calculate N2
        const calc = (n1_SI * Math.cbrt(p2_SI / p1_SI))
        // Don't set the input field - only show in result area
        resultValue = calc.toFixed(2)
        resultValueSI = calc.toFixed(2)
        resultLabel = `N₂ = ${calc.toFixed(2)} RPM`
        steps.push(`  N₂ = N₁ × ∛(P₂ / P₁)`)
        steps.push(`  N₂ = ${n1_SI} × ∛(${p2_SI.toFixed(2)} / ${p1_SI.toFixed(2)})`)
        steps.push(`  N₂ = ${calc.toFixed(2)} RPM`)
      } else if (n2_SI !== null && p1_SI !== null && p2_SI !== null && n1_SI === null) {
        // Calculate N1
        const calc = (n2_SI * Math.cbrt(p1_SI / p2_SI))
        // Don't set the input field - only show in result area
        resultValue = calc.toFixed(2)
        resultValueSI = calc.toFixed(2)
        resultLabel = `N₁ = ${calc.toFixed(2)} RPM`
        steps.push(`  N₁ = N₂ × ∛(P₁ / P₂)`)
        steps.push(`  N₁ = ${n2_SI} × ∛(${p1_SI.toFixed(2)} / ${p2_SI.toFixed(2)})`)
        steps.push(`  N₁ = ${calc.toFixed(2)} RPM`)
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

  const copyResult = () => {
    const resultText = result.label
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard!",
      description: resultText,
    })
  }


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
          
          <div className="flex border-b border-border">
            <button
              onClick={() => setMode("CONSTANT_SPEED")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-r border-border transition-colors ${
                mode === "CONSTANT_SPEED" 
                  ? "bg-card text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-muted text-muted-foreground hover:bg-card"
              }`}
            >
              Constant Speed <span className="text-[10px] lowercase opacity-70">(Change Diameter)</span>
            </button>
            <button
              onClick={() => setMode("CONSTANT_DIAMETER")}
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
                  <div className="pt-4 space-y-4">
                    {/* Formula Box - On Top */}
                    <div className="bg-muted p-4 flex justify-center border border-border rounded">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">Q₁</span>
                            <span>Q₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                            <span>{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
                          </div>
                       </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                       {/* Q1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">Q₁:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={q1} 
                              onChange={e => setQ1(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={q1Unit} onValueChange={setQ1Unit}>
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
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN1Flow(e.target.value) : setD1Flow(e.target.value)} 
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
                              onChange={e => setQ2(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={q2Unit} onValueChange={setQ2Unit}>
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
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN2Flow(e.target.value) : setD2Flow(e.target.value)} 
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
                    <div className="bg-muted p-4 flex justify-center border border-border rounded">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">H₁</span>
                            <span>H₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-muted-foreground font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-1">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                              <span>{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
                            </div>
                            <span className="text-4xl text-muted-foreground font-light">)</span>
                            <sup className="text-sm font-bold mb-6">2</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap- 4 w-full">
                       {/* H1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₁:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={h1} 
                              onChange={e => setH1(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={h1Unit} onValueChange={setH1Unit}>
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
                       </div>

                       {/* N1 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_head : d1_head} 
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN1Head(e.target.value) : setD1Head(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>

                       {/* H2 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">H₂:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={h2} 
                              onChange={e => setH2(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={h2Unit} onValueChange={setH2Unit}>
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
                       </div>

                       {/* N2 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_head : d2_head} 
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN2Head(e.target.value) : setD2Head(e.target.value)} 
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


              {/* POWER SECTION */}
              <AccordionItem value="power" className="border border-border rounded-lg px-4 bg-card mb-1">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">3. Power (P)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    <div className="bg-muted p-4 flex justify-center border border-border rounded">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-foreground px-1">P₁</span>
                            <span>P₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-muted-foreground font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-foreground px-1">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                              <span>{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
                            </div>
                            <span className="text-4xl text-muted-foreground font-light">)</span>
                            <sup className="text-sm font-bold mb-6">3</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                       {/* P1 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₁:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={p1} 
                              onChange={e => setP1(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={p1Unit} onValueChange={setP1Unit}>
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
                       </div>

                       {/* N1 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n1_power : d1_power} 
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN1Power(e.target.value) : setD1Power(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <div className="w-24 h-8 flex items-center justify-center border border-border bg-muted rounded text-xs text-muted-foreground font-medium">
                              {mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"}
                            </div>
                          </div>
                       </div>

                       {/* P2 with unit selector */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">P₂:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={p2} 
                              onChange={e => setP2(e.target.value)} 
                              placeholder="?" 
                              className="w-24 border border-border bg-background rounded px-2 py-1 text-center text-sm"
                            />
                            <Select value={p2Unit} onValueChange={setP2Unit}>
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
                       </div>

                       {/* N2 - Fixed RPM */}
                       <div>
                          <label className="text-xs font-bold mb-1 block">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}:</label>
                          <div className="flex gap- 2">
                            <input 
                              type="number" 
                              value={mode === "CONSTANT_DIAMETER" ? n2_power : d2_power} 
                              onChange={e => mode === "CONSTANT_DIAMETER" ? setN2Power(e.target.value) : setD2Power(e.target.value)} 
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
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full relative">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="bg-muted px-6 py-4 border-b border-border relative z-10">
             <h2 className="font-bold text-xl uppercase text-foreground">Calculation & Result</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col relative z-10">
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
                      <span className="border-b-2 border-foreground px-2">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                      <span className="mt-1">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
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
                        <span className="border-b-2 border-foreground px-2">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                        <span className="mt-1">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
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
                        <span className="border-b-2 border-foreground px-2">{mode === "CONSTANT_DIAMETER" ? "N₁" : "D₁"}</span>
                        <span className="mt-1">{mode === "CONSTANT_DIAMETER" ? "N₂" : "D₂"}</span>
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
              <div className={`rounded-lg p-8 text-center text-white shadow-lg transition-all duration-500 relative ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 {result.calculated && (
                   <button
                     onClick={copyResult}
                     className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                     title="Copy result"
                   >
                     {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                   </button>
                 )}
                 
                 <h2 className="text-2xl font-bold mb-4 uppercase opacity-90">
                   {result.calculated ? "Calculated Value" : "Result"}
                 </h2>
                 
                 {result.calculated ? (
                   <div>
                     <div className="text-sm uppercase opacity-80 mb-2">{result.label}</div>
                     <div className="text-5xl font-black mb-2">{result.value}</div>
                     {result.valueSI && result.valueSI !== result.value && (
                       <div className="text-sm opacity-80 mt-2">
                         ({result.valueSI} in SI units)
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="text-lg font-medium opacity-70 italic text-muted-foreground">
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












