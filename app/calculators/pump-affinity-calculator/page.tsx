"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type LawMode = "CONSTANT_DIAMETER" | "CONSTANT_SPEED"

export default function PumpAffinityCalculator() {
  // --- STATE ---
  // Mode: Constant Diameter (Change Speed) OR Constant Speed (Change Diameter)
  const [mode, setMode] = useState<LawMode>("CONSTANT_DIAMETER")

  // Inputs
  const [val1, setVal1] = useState<string>("1450") // N1 or D1
  const [val2, setVal2] = useState<string>("1750") // N2 or D2
  
  const [q1, setQ1] = useState<string>("80")  // Initial Flow
  const [h1, setH1] = useState<string>("25")  // Initial Head
  const [p1, setP1] = useState<string>("12")  // Initial Power

  // Calculation State (triggered by button)
  const [result, setResult] = useState<{
    q2: number | null,
    h2: number | null,
    p2: number | null,
    ratio: number,
    calculated: boolean
  }>({
    q2: null, h2: null, p2: null, ratio: 1, calculated: false
  })

  // --- LOGIC ---
  const handleCalculate = () => {
    const v1 = parseFloat(val1)
    const v2 = parseFloat(val2)
    const flow1 = parseFloat(q1)
    const head1 = parseFloat(h1)
    const power1 = parseFloat(p1)

    if (!v1 || !v2) return

    // Calculate Ratio
    // If Constant Dia: Ratio = N2 / N1
    // If Constant Speed: Ratio = D2 / D1
    const ratio = v2 / v1

    // 1. Flow (Linear)
    const q2 = flow1 ? flow1 * ratio : 0
    // 2. Head (Square)
    const h2 = head1 ? head1 * Math.pow(ratio, 2) : 0
    // 3. Power (Cubic)
    const p2 = power1 ? power1 * Math.pow(ratio, 3) : 0

    setResult({
      q2, h2, p2, ratio, calculated: true
    })
  }

  // --- HELPERS ---
  const symbol = mode === "CONSTANT_DIAMETER" ? "N" : "D" // N for Speed, D for Diameter
  const unit = mode === "CONSTANT_DIAMETER" ? "RPM" : "mm"
  
  // Math formatting helper
  const fmt = (n: number | null) => n ? n.toLocaleString('en-US', { maximumFractionDigits: 1 }) : "0"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-white p-4 md:p-8 font-sans text-slate-900 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">
          A World-Class Engineering Tool
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
          Pump Affinity Law Calculator
        </h1>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === LEFT COLUMN: INPUTS & LAWS === */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden flex flex-col">
          
          {/* TABS */}
          <div className="flex border-b border-slate-300">
            <button
              onClick={() => { setMode("CONSTANT_SPEED"); setResult({...result, calculated: false}); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-r border-slate-300 transition-colors ${
                mode === "CONSTANT_SPEED" 
                  ? "bg-white text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-slate-100 text-slate-500 hover:bg-white"
              }`}
            >
              Constant Speed <span className="text-[10px] lowercase opacity-70">(Change Diameter)</span>
            </button>
            <button
              onClick={() => { setMode("CONSTANT_DIAMETER"); setResult({...result, calculated: false}); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                mode === "CONSTANT_DIAMETER" 
                  ? "bg-white text-blue-600 border-t-4 border-t-blue-600" 
                  : "bg-slate-100 text-slate-500 hover:bg-white"
              }`}
            >
              Constant Diameter <span className="text-[10px] lowercase opacity-70">(Change Speed)</span>
            </button>
          </div>

          <div className="p-6">
            
            {/* ACCORDION FOR INPUT SECTIONS */}
            <Accordion type="multiple" defaultValue={["flow"]} className="space-y-2 [&>*]:!border-b-0">
              
              {/* INPUT SECTION 1: FLOW */}
              <AccordionItem value="flow" className="border border-slate-200 rounded-lg px-4 bg-white [&:not(:last-child)]:mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">1. Flow Rate (Q)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    {/* Math Formula */}
                    <div className="bg-white p-4 flex justify-center border border-white rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-black px-1">Q₁</span>
                            <span>Q₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-black px-1">{symbol}₁</span>
                            <span>{symbol}₂</span>
                          </div>
                       </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       {/* Row 1 */}
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">Q₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={q1} onChange={e => setQ1(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">m³/h</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
                          </div>
                       </div>
                       {/* Row 2 */}
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">Q₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="text" disabled placeholder="?" className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 italic text-slate-400" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">m³/h</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* INPUT SECTION 2: HEAD */}
              <AccordionItem value="head" className="border border-slate-200 rounded-lg px-4 bg-white [&:not(:last-child)]:mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">2. Head (H)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    <div className="bg-white p-4 flex justify-center border border-white rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-black px-1">H₁</span>
                            <span>H₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-slate-300 font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-black px-1">{symbol}₁</span>
                              <span>{symbol}₂</span>
                            </div>
                            <span className="text-4xl text-slate-300 font-light">)</span>
                            <sup className="text-sm font-bold mb-6">2</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">H₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={h1} onChange={e => setH1(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">m</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val1} className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 text-slate-500" />
                             <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">H₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="text" disabled placeholder="?" className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 italic text-slate-400" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">m</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val2} className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 text-slate-500" />
                             <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* INPUT SECTION 3: POWER */}
              <AccordionItem value="power" className="border border-slate-200 rounded-lg px-4 bg-white mb-1">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="font-bold text-lg">3. Power (P)</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-4">
                    <div className="bg-white p-4 flex justify-center border border-white rounded shrink-0">
                       <div className="font-serif text-2xl flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-black px-1">P₁</span>
                            <span>P₂</span>
                          </div>
                          <span>=</span>
                          <div className="flex items-center">
                            <span className="text-4xl text-slate-300 font-light">(</span>
                            <div className="flex flex-col items-center">
                              <span className="border-b border-black px-1">{symbol}₁</span>
                              <span>{symbol}₂</span>
                            </div>
                            <span className="text-4xl text-slate-300 font-light">)</span>
                            <sup className="text-sm font-bold mb-6">3</sup>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className="font-serif font-bold w-8 shrink-0">P₁=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="number" value={p1} onChange={e => setP1(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-right pr-12" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">kW</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₁=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val1} className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 text-slate-500" />
                             <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">P₂=</span>
                          <div className="relative flex-1 min-w-0">
                            <input type="text" disabled placeholder="?" className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 italic text-slate-400" />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-400">kW</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-50">
                          <span className="font-serif font-bold w-8 shrink-0">{symbol}₂=</span>
                          <div className="relative flex-1 min-w-0">
                             <input type="text" disabled value={val2} className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-right pr-12 text-slate-500" />
                             <span className="absolute right-2 top-1.5 text-xs text-slate-400">{unit}</span>
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

        {/* === RIGHT COLUMN: RESULTS === */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden flex flex-col h-full">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
             <h2 className="font-bold text-xl uppercase text-slate-800">Calculation & Result</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-sm">Given:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Initial Flow (Q₁) = <strong>{q1} m³/h</strong></li>
                <li>Initial Head (H₁) = <strong>{h1} m</strong></li>
                <li>Initial Power (P₁) = <strong>{p1} kW</strong></li>
                <li>Initial {mode === "CONSTANT_DIAMETER" ? "Speed" : "Diameter"} ({symbol}₁) = <strong>{val1} {unit}</strong></li>
                <li>New {mode === "CONSTANT_DIAMETER" ? "Speed" : "Diameter"} ({symbol}₂) = <strong>{val2} {unit}</strong></li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-sm">To Find:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>New Flow (Q₂), Head (H₂), Power (P₂)</li>
              </ul>
            </div>

            <div className="mt-auto">
              <div className="text-center mb-4">
                 <h4 className="font-bold text-sm mb-4">Calculation at {mode === "CONSTANT_DIAMETER" ? "Constant Diameter" : "Constant Speed"}</h4>
                 
                 {/* Math Steps Visualization */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-serif text-lg">
                    {/* Flow Math */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="flex flex-col items-center leading-none">
                                <span className="border-b border-black">Q₁</span>
                                <span>Q₂</span>
                             </div>
                             <span>=</span>
                             <div className="flex flex-col items-center leading-none">
                                <span className="border-b border-black">{symbol}₁</span>
                                <span>{symbol}₂</span>
                             </div>
                        </div>
                        <div className="flex items-center gap-2 text-base text-slate-500">
                             <span>Q₂ = {q1} × </span>
                             <div className="flex flex-col items-center leading-none">
                                <span className="border-b border-slate-400">{val2}</span>
                                <span>{val1}</span>
                             </div>
                        </div>
                    </div>

                    {/* Head Math */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="flex flex-col items-center leading-none">
                                <span className="border-b border-black">H₁</span>
                                <span>H₂</span>
                             </div>
                             <span>=</span>
                             <span>(Ratio)²</span>
                        </div>
                        <div className="flex items-center gap-2 text-base text-slate-500">
                             <span>H₂ = {h1} × ({fmt(result.ratio)})²</span>
                        </div>
                    </div>
                 </div>
              </div>

              {/* FINAL RESULT BOX */}
              <div className={`rounded-lg p-6 text-center text-white shadow-md transition-all duration-500 ${result.calculated ? "bg-[#35A047]" : "bg-slate-300"}`}>
                 <h2 className="text-2xl font-bold mb-2 uppercase opacity-90">Results:</h2>
                 
                 {result.calculated ? (
                   <div className="grid grid-cols-3 gap-4 divide-x divide-white/30">
                     <div>
                       <div className="text-sm uppercase opacity-80">Flow (Q₂)</div>
                       <div className="text-2xl md:text-3xl font-bold">{fmt(result.q2)}</div>
                       <div className="text-xs">m³/h</div>
                     </div>
                     <div>
                       <div className="text-sm uppercase opacity-80">Head (H₂)</div>
                       <div className="text-2xl md:text-3xl font-bold">{fmt(result.h2)}</div>
                       <div className="text-xs">m</div>
                     </div>
                     <div>
                       <div className="text-sm uppercase opacity-80">Power (P₂)</div>
                       <div className="text-2xl md:text-3xl font-bold">{fmt(result.p2)}</div>
                       <div className="text-xs">kW</div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-xl font-medium opacity-70 italic">
                     Click Calculate...
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