"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  convertToSI, 
  flowUnits, 
  headUnits 
} from "@/lib/unit-conversions"

export function PumpSpecificSpeedCalculatorWidget() {
  const [speed, setSpeed] = useState<string>("")
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  const [result, setResult] = useState<string>("")

  const handleCalculate = () => {
    const N_input = speed ? parseFloat(speed) : null
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const H_input = head ? parseFloat(head) : null

    if (!N_input || !Q_input || !H_input || N_input <= 0 || Q_input <= 0 || H_input <= 0) {
      setResult("Invalid inputs")
      return
    }

    const Q_SI = convertToSI(Q_input, flowUnit, 'flow')
    const H_SI = convertToSI(H_input, headUnit, 'head')
    const sqrt_Q = Math.sqrt(Q_SI)
    const numerator = N_input * sqrt_Q
    const denominator = Math.pow(H_SI, 0.75)
    const ns_exact = numerator / denominator

    setResult(`Ns = ${Math.round(ns_exact)}`)
  }

  return (
    <div className="space-y-3 p-4 overflow-visible">
      <h3 className="font-bold text-sm text-foreground mb-3">Pump Specific Speed</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">Speed (N):</label>
          <input
            type="number"
            value={speed}
            onChange={e => setSpeed(e.target.value)}
            placeholder="1450"
            className="flex-1 border border-border bg-background rounded px-2 py-1 text-xs"
          />
          <span className="text-xs text-muted-foreground w-20">RPM</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">Flow (Q):</label>
          <input
            type="number"
            value={flowRate}
            onChange={e => setFlowRate(e.target.value)}
            placeholder="150"
            className="flex-1 border border-border bg-background rounded px-2 py-1 text-xs"
          />
          <Select value={flowUnit} onValueChange={setFlowUnit}>
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {flowUnits.slice(0, 4).map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">Head (H):</label>
          <input
            type="number"
            value={head}
            onChange={e => setHead(e.target.value)}
            placeholder="100"
            className="flex-1 border border-border bg-background rounded px-2 py-1 text-xs"
          />
          <Select value={headUnit} onValueChange={setHeadUnit}>
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {headUnits.slice(0, 3).map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-xs"
      >
        Calculate
      </button>

      {result && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded">
          <div className="text-xs font-semibold text-green-700 dark:text-green-300">
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
