"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  convertToSI, 
  flowUnits, 
  headUnits, 
  powerUnits 
} from "@/lib/unit-conversions"
import { multiply, divide } from "@/lib/precision-math"

export function PumpEfficiencyCalculatorWidget() {
  const [flowRate, setFlowRate] = useState<string>("")
  const [flowUnit, setFlowUnit] = useState<string>("m3h")
  const [head, setHead] = useState<string>("")
  const [headUnit, setHeadUnit] = useState<string>("m")
  const [power, setPower] = useState<string>("")
  const [powerUnit, setPowerUnit] = useState<string>("kw")
  const [specificGravity, setSpecificGravity] = useState<string>("1.0")
  const [result, setResult] = useState<string>("")

  const handleCalculate = () => {
    const Q_input = flowRate ? parseFloat(flowRate) : null
    const H_input = head ? parseFloat(head) : null
    const P_input = power ? parseFloat(power) : null
    const SG = specificGravity ? parseFloat(specificGravity) : null

    if (!Q_input || !H_input || !SG || !P_input || Q_input === 0 || H_input === 0 || P_input === 0 || SG === 0) {
      setResult("Invalid inputs")
      return
    }

    const Q_SI = convertToSI(Q_input, flowUnit, 'flow')
    const Q_m3s = divide(Q_SI.toString(), '3600')
    const H_SI = convertToSI(H_input, headUnit, 'head')
    const P_W = convertToSI(P_input, powerUnit, 'power')
    const rho = multiply('1000', SG.toString())
    const g = '9.81'

    const rho_g = multiply(rho, g)
    const Q_H = multiply(Q_m3s, H_SI.toString())
    const numerator = multiply(rho_g, Q_H)
    const eta_decimal_str = divide(numerator, P_W.toString())
    const eta_percent_str = multiply(eta_decimal_str, '100')

    setResult(`${parseFloat(eta_percent_str).toFixed(2)} %`)
  }

  return (
    <div className="space-y-3 p-4 overflow-visible">
      <h3 className="font-bold text-sm text-foreground mb-3">Pump Efficiency Calculator</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">Flow (Q):</label>
          <input
            type="number"
            value={flowRate}
            onChange={e => setFlowRate(e.target.value)}
            placeholder="100"
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
            placeholder="50"
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

        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">Power (P):</label>
          <input
            type="number"
            value={power}
            onChange={e => setPower(e.target.value)}
            placeholder="25"
            className="flex-1 border border-border bg-background rounded px-2 py-1 text-xs"
          />
          <Select value={powerUnit} onValueChange={setPowerUnit}>
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {powerUnits.slice(0, 3).map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs w-16 flex-shrink-0">SG:</label>
          <input
            type="number"
            value={specificGravity}
            onChange={e => setSpecificGravity(e.target.value)}
            placeholder="1.0"
            step="0.01"
            className="flex-1 border border-border bg-background rounded px-2 py-1 text-xs"
          />
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
            Efficiency: {result}
          </div>
        </div>
      )}
    </div>
  )
}
