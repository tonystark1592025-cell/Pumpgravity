"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")
  const [activeSection, setActiveSection] = useState<string>("flow") // Track which accordion is open

  // All inputs start empty
  const [val1, setVal1] = useState<string>("")
  const [val2, setVal2] = useState<string>("")
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
    const v1 = val1 ? parseFloat(val1) : null
    const v2 = val2 ? parseFloat(val2) : null
    const flow1 = q1 ? parseFloat(q1) : null
    const flow2 = q2 ? parseFloat(q2) : null
    const head1 = h1 ? parseFloat(h1) : null
    const head2 = h2 ? parseFloat(h2) : null
    const power1 = p1 ? parseFloat(p1) : null
    const power2 = p2 ? parseFloat(p2) : null

    if (!v1 || !v2) {
      setResult({ value: "", label: `Please enter both ${symbol}₁ and ${symbol}₂`, calculated: false })
      return
    }

    const ratio = v2 / v1

    // Count filled values in each section
    const flowFilled = [flow1, flow2].filter(v => v !== null).length
    const headFilled = [head1, head2].filter(v => v !== null).length
    const powerFilled = [power1, power2].filter(v => v !== null).length

    // Check if user filled both values in a section (error case)
    if (flowFilled === 2) {
      setResult({ value: "", label: "Please leave ONE value empty in Flow Rate section", calculated: false })
      return
    }
    if (headFilled === 2) {
      setResult({ value: "", label: "Please leave ONE value empty in Head section", calculated: false })
      return
    }
    if (powerFilled === 2) {
      setResult({ value: "", label: "Please leave ONE value empty in Power section", calculated: false })
      return
    }

    // Check if no values filled in any section
    if (flowFilled === 0 && headFilled === 0 && powerFilled === 0) {
      setResult({ value: "", label: "Please enter at least one value from Flow/Head/Power", calculated: false })
      return
    }

    // Flow Rate calculations
    if (flow1 !== null && flow2 === null) {
      const calc = (flow1 * ratio).toFixed(2)
      setQ2(calc)
      setResult({ value: calc, label: "Q₂ (m³/h)", calculated: true })
      return
    } else if (flow2 !== null && flow1 === null) {
      const calc = (flow2 / ratio).toFixed(2)
      setQ1(calc)
      setResult({ value: calc, label: "Q₁ (m³/h)", calculated: true })
      return
    }

    // Head calculations
    if (head1 !== null && head2 === null) {
      const calc = (head1 * Math.pow(ratio, 2)).toFixed(2)
      setH2(calc)
      setResult({ value: calc, label: "H₂ (m)", calculated: true })
      return
    } else if (head2 !== null && head1 === null) {
      const calc = (head2 / Math.pow(ratio, 2)).toFixed(2)
      setH1(calc)
      setResult({ value: calc, label: "H₁ (m)", calculated: true })
      return
    }

    // Power calculations
    if (power1 !== null && power2 === null) {
      const calc = (power1 * Math.pow(ratio, 3)).toFixed(2)
      setP2(calc)
      setResult({ value: calc, label: "P₂ (kW)", calculated: true })
      return
    } else if (power2 !== null && power1 === null) {
      const calc = (power2 / Math.pow(ratio, 3)).toFixed(2)
      setP1(calc)
      setResult({ value: calc, label: "P₁ (kW)", calculated: true })
      return
    }

    setResult({ value: "", label: "Please enter exactly 3 values (both speeds + 1 other value)", calculated: false })
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
                            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
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
                            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} placeholder="?" className="w-full border border-border bg-background rounded px-2 py-1.5 text-right pr-12" />
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
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val1} placeholder="?" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-right pr-12 text-muted-foreground" />
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
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val2} placeholder="?" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-right pr-12 text-muted-foreground" />
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
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val1} placeholder="?" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-right pr-12 text-muted-foreground" />
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
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val2} placeholder="?" className="w-full bg-muted border border-border rounded px-2 py-1.5 text-right pr-12 text-muted-foreground" />
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
