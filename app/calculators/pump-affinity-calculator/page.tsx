"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")
  const [activeSection, setActiveSection] = useState<string>("flow") // Track which accordion is open

  // All inputs start empty - separate D1/D2 for each section
  const [flowVal1, setFlowVal1] = useState<string>("")
  const [flowVal2, setFlowVal2] = useState<string>("")
  const [headVal1, setHeadVal1] = useState<string>("")
  const [headVal2, setHeadVal2] = useState<string>("")
  const [powerVal1, setPowerVal1] = useState<string>("")
  const [powerVal2, setPowerVal2] = useState<string>("")
  
  const [q1, setQ1] = useState<string>("")
  const [q2, setQ2] = useState<string>("")
  const [h1, setH1] = useState<string>("")
  const [h2, setH2] = useState<string>("")
  const [p1, setP1] = useState<string>("")
  const [p2, setP2] = useState<string>("")

  const [result, setResult] = useState<{
    value: string
    label: string
    calculated: boolean
  }>({
    value: "", label: "", calculated: false
  })

  const handleCalculate = () => {
    // Get values based on active section
    let v1: number | null = null
    let v2: number | null = null
    
    if (activeSection === "flow") {
      v1 = flowVal1 ? parseFloat(flowVal1) : null
      v2 = flowVal2 ? parseFloat(flowVal2) : null
    } else if (activeSection === "head") {
      v1 = headVal1 ? parseFloat(headVal1) : null
      v2 = headVal2 ? parseFloat(headVal2) : null
    } else if (activeSection === "power") {
      v1 = powerVal1 ? parseFloat(powerVal1) : null
      v2 = powerVal2 ? parseFloat(powerVal2) : null
    }

    const flow1 = q1 ? parseFloat(q1) : null
    const flow2 = q2 ? parseFloat(q2) : null
    const head1 = h1 ? parseFloat(h1) : null
    const head2 = h2 ? parseFloat(h2) : null
    const power1 = p1 ? parseFloat(p1) : null
    const power2 = p2 ? parseFloat(p2) : null

    // Count filled values in active section
    const values = [v1, v2]
    let sectionValues: (number | null)[] = []
    
    if (activeSection === "flow") {
      sectionValues = [flow1, flow2]
    } else if (activeSection === "head") {
      sectionValues = [head1, head2]
    } else if (activeSection === "power") {
      sectionValues = [power1, power2]
    }

    const allValues = [...values, ...sectionValues]
    const filledCount = allValues.filter(v => v !== null).length

    // Need exactly 3 values filled
    if (filledCount < 3) {
      setResult({ value: "", label: "Please enter any 3 values to calculate the 4th", calculated: false })
      return
    }

    if (filledCount > 3) {
      setResult({ value: "", label: "Please leave ONE value empty to calculate", calculated: false })
      return
    }

    // Now we have exactly 3 values, calculate the missing one
    if (activeSection === "flow") {
      // Flow Rate: Q1/Q2 = N1/N2 (or D1/D2)
      if (v1 !== null && v2 !== null && flow1 !== null && flow2 === null) {
        // Calculate Q2
        const calc = (flow1 * (v2 / v1)).toFixed(2)
        setQ2(calc)
        setResult({ value: calc, label: "Q₂ (m³/h)", calculated: true })
      } else if (v1 !== null && v2 !== null && flow2 !== null && flow1 === null) {
        // Calculate Q1
        const calc = (flow2 * (v1 / v2)).toFixed(2)
        setQ1(calc)
        setResult({ value: calc, label: "Q₁ (m³/h)", calculated: true })
      } else if (v1 !== null && flow1 !== null && flow2 !== null && v2 === null) {
        // Calculate N2/D2: N2 = N1 * (Q2/Q1)
        const calc = (v1 * (flow2 / flow1)).toFixed(2)
        setFlowVal2(calc)
        setResult({ value: calc, label: `${symbol}₂ (${unit})`, calculated: true })
      } else if (v2 !== null && flow1 !== null && flow2 !== null && v1 === null) {
        // Calculate N1/D1: N1 = N2 * (Q1/Q2)
        const calc = (v2 * (flow1 / flow2)).toFixed(2)
        setFlowVal1(calc)
        setResult({ value: calc, label: `${symbol}₁ (${unit})`, calculated: true })
      }
    }

    if (activeSection === "head") {
      // Head: H1/H2 = (N1/N2)^2 (or (D1/D2)^2)
      if (v1 !== null && v2 !== null && head1 !== null && head2 === null) {
        // Calculate H2
        const calc = (head1 * Math.pow(v2 / v1, 2)).toFixed(2)
        setH2(calc)
        setResult({ value: calc, label: "H₂ (m)", calculated: true })
      } else if (v1 !== null && v2 !== null && head2 !== null && head1 === null) {
        // Calculate H1
        const calc = (head2 * Math.pow(v1 / v2, 2)).toFixed(2)
        setH1(calc)
        setResult({ value: calc, label: "H₁ (m)", calculated: true })
      } else if (v1 !== null && head1 !== null && head2 !== null && v2 === null) {
        // Calculate N2/D2: N2 = N1 * sqrt(H2/H1)
        const calc = (v1 * Math.sqrt(head2 / head1)).toFixed(2)
        setHeadVal2(calc)
        setResult({ value: calc, label: `${symbol}₂ (${unit})`, calculated: true })
      } else if (v2 !== null && head1 !== null && head2 !== null && v1 === null) {
        // Calculate N1/D1: N1 = N2 * sqrt(H1/H2)
        const calc = (v2 * Math.sqrt(head1 / head2)).toFixed(2)
        setHeadVal1(calc)
        setResult({ value: calc, label: `${symbol}₁ (${unit})`, calculated: true })
      }
    }

    if (activeSection === "power") {
      // Power: P1/P2 = (N1/N2)^3 (or (D1/D2)^3)
      if (v1 !== null && v2 !== null && power1 !== null && power2 === null) {
        // Calculate P2
        const calc = (power1 * Math.pow(v2 / v1, 3)).toFixed(2)
        setP2(calc)
        setResult({ value: calc, label: "P₂ (kW)", calculated: true })
      } else if (v1 !== null && v2 !== null && power2 !== null && power1 === null) {
        // Calculate P1
        const calc = (power2 * Math.pow(v1 / v2, 3)).toFixed(2)
        setP1(calc)
        setResult({ value: calc, label: "P₁ (kW)", calculated: true })
      } else if (v1 !== null && power1 !== null && power2 !== null && v2 === null) {
        // Calculate N2/D2: N2 = N1 * cbrt(P2/P1)
        const calc = (v1 * Math.cbrt(power2 / power1)).toFixed(2)
        setPowerVal2(calc)
        setResult({ value: calc, label: `${symbol}₂ (${unit})`, calculated: true })
      } else if (v2 !== null && power1 !== null && power2 !== null && v1 === null) {
        // Calculate N1/D1: N1 = N2 * cbrt(P1/P2)
        const calc = (v2 * Math.cbrt(power1 / power2)).toFixed(2)
        setPowerVal1(calc)
        setResult({ value: calc, label: `${symbol}₁ (${unit})`, calculated: true })
      }
    }
  }

  const symbol = mode === "CONSTANT_DIAMETER" ? "N" : "D"
  const unit = mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"

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
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col">
          
          <div className="flex border-b border-border">
            <button
              onClick={() => { setMode("CONSTANT_SPEED"); setResult({...result, calculated: false}); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-r border-border transition-colors ${
                mode === "CONSTANT_SPEED" 
                  ? "bg-card text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-muted text-muted-foreground hover:bg-card"
              }`}
            >
              Constant Speed <span className="text-[10px] lowercase opacity-70">(Change Diameter)</span>
            </button>
            <button
              onClick={() => { setMode("CONSTANT_DIAMETER"); setResult({...result, calculated: false}); }}
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

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">Q₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={q1} onChange={e => setQ1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">m³/h</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={flowVal1} onChange={e => setFlowVal1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">Q₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={q2} onChange={e => setQ2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">m³/h</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={flowVal2} onChange={e => setFlowVal2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

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

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">H₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={h1} onChange={e => setH1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">m</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={headVal1} onChange={e => setHeadVal1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">H₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={h2} onChange={e => setH2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">m</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={headVal2} onChange={e => setHeadVal2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

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

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">P₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={p1} onChange={e => setP1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">kW</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={powerVal1} onChange={e => setPowerVal1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">P₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={p2} onChange={e => setP2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">kW</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={powerVal2} onChange={e => setPowerVal2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">{unit}</span>
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

        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full">
          <div className="bg-muted px-6 py-4 border-b border-border">
             <h2 className="font-bold text-xl uppercase text-foreground">Calculation & Result</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <h4 className="font-bold text-foreground mb-2 uppercase text-sm">Instructions:</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter any 3 values . Leave the value you want to find empty. Click Calculate.
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

            <div className="mt-auto">
              <div className={`rounded-lg p-8 text-center text-white shadow-lg transition-all duration-500 ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-muted"}`}>
                 <h2 className="text-2xl font-bold mb-4 uppercase opacity-90">
                   {result.calculated ? "Calculated Value" : "Result"}
                 </h2>
                 
                 {result.calculated ? (
                   <div>
                     <div className="text-sm uppercase opacity-80 mb-2">{result.label}</div>
                     <div className="text-5xl font-black mb-2">{result.value}</div>
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
