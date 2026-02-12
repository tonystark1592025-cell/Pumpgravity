"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PumpPowerCalculator() {
  const [flowRate, setFlowRate] = useState<string>("")
  const [head, setHead] = useState<string>("")
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  const [efficiency, setEfficiency] = useState<string>("75")

  const [result, setResult] = useState<{
    value: string
    calculated: boolean
    steps: string[]
  }>({
    value: "",
    calculated: false,
    steps: []
  })

  const handleCalculate = () => {
    const Q = flowRate ? parseFloat(flowRate) : null
    const H = head ? parseFloat(head) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null
    const eta = efficiency ? parseFloat(efficiency) : null

    if (!Q || !H || !SG || !eta) {
      setResult({
        value: "",
        calculated: false,
        steps: ["Please enter all required values"]
      })
      return
    }

    if (eta <= 0 || eta > 100) {
      setResult({
        value: "",
        calculated: false,
        steps: ["Pump efficiency must be between 0 and 100%"]
      })
      return
    }

    // Formula: Ps = (Q × H × SG) / (367.2 × η)
    // Where η is efficiency as decimal (75% = 0.75)
    const etaDecimal = eta / 100
    const numerator = Q * H * SG
    const denominator = 367.2 * etaDecimal
    const power = numerator / denominator

    const steps = [
      `Ps = (Q × H × SG) / (367.2 × η)`,
      `Ps = (${Q} × ${H} × ${SG}) / (367.2 × ${etaDecimal})`,
      `Ps = ${numerator.toFixed(1)} / ${denominator.toFixed(1)}`,
      `Ps = ${power.toFixed(2)} kW`
    ]

    setResult({
      value: power.toFixed(2),
      calculated: true,
      steps
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-white p-4 md:p-8 font-sans text-slate-900 flex flex-col items-center">
      
      <div className="text-center mb-6">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
          World-Class Engineering Tool for Professionals
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
          Pump Power Calculator
        </h1>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel - Inputs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden flex flex-col">
          <div className="bg-blue-50 px-4 py-3 border-b border-slate-200">
             <h2 className="font-bold text-base uppercase text-slate-800">Inputs & Parameters (Pump Power)</h2>
          </div>

          <div className="p-4">
            
            {/* Flow Rate Input */}
            <div className="mb-4">
              <label className="block font-bold text-slate-900 mb-1.5 text-sm">Flow Rate (Q):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={flowRate} 
                  onChange={e => setFlowRate(e.target.value)} 
                  placeholder="100"
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-right pr-14 text-base focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">m³/h</span>
              </div>
            </div>

            {/* Differential Head Input */}
            <div className="mb-4">
              <label className="block font-bold text-slate-900 mb-1.5 text-sm">Differential Head (H):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={head} 
                  onChange={e => setHead(e.target.value)} 
                  placeholder="50"
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-right pr-14 text-base focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">m</span>
              </div>
            </div>

            {/* Specific Gravity Input */}
            <div className="mb-4">
              <label className="block font-bold text-slate-900 mb-1.5 text-sm">Specific Gravity (SG):</label>
              <div className="relative flex items-center gap-3">
                <input 
                  type="number" 
                  value={specificGravity} 
                  onChange={e => setSpecificGravity(e.target.value)} 
                  placeholder="1.0"
                  step="0.1"
                  className="flex-1 border-2 border-slate-300 rounded-lg px-3 py-2 text-center text-base focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pump Efficiency Input */}
            <div className="mb-4">
              <label className="block font-bold text-slate-900 mb-1.5 text-sm">Pump Efficiency (η):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={efficiency} 
                  onChange={e => setEfficiency(e.target.value)} 
                  placeholder="75"
                  min="0"
                  max="100"
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-right pr-14 text-base focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">%</span>
              </div>
            </div>

            {/* Formula Display */}
            <div className="mb-4 bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 uppercase text-xs text-center">Formula:</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="font-serif text-xl flex items-center gap-2">
                  <span className="font-bold">P<sub className="text-xs">s</sub></span>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-2 border-black px-2 pb-0.5 text-base">Q × H × SG</span>
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden flex flex-col h-full">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
             <h2 className="font-bold text-base uppercase text-slate-800">Calculation & Result (Shaft Power)</h2>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            
            {/* Given Values */}
            <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Given:</h4>
              <ul className="space-y-0.5 text-xs text-slate-700">
                <li>• Flow Rate (Q) = {flowRate || "?"} m³/h</li>
                <li>• Differential Head (H) = {head || "?"} m</li>
                <li>• Specific Gravity (SG) = {specificGravity || "?"}</li>
                <li>• Pump Efficiency (η) = {efficiency || "?"}%</li>
              </ul>
            </div>

            <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">To Find:</h4>
              <p className="text-xs text-slate-700">• Shaft Power (P<sub>s</sub>) = ?</p>
            </div>

            {/* Calculation Steps */}
            {result.steps.length > 0 && (
              <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Calculation:</h4>
                <div className="space-y-1">
                  {result.steps.map((step, index) => (
                    <p key={index} className="text-xs text-slate-700 font-mono">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="mt-auto">
              <div className={`rounded-lg p-6 text-center text-white shadow-lg transition-all duration-500 ${result.calculated ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-slate-300"}`}>
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
                       P<sub className="text-2xl">s</sub> = {result.value} kW
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
