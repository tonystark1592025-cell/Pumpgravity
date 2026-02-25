"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { converters } from "@/lib/converters-data"

interface ConverterWidgetProps {
  categoryId: string
}

function newRound(num: number, keta: number = 6): number {
  const shift = Math.pow(10, keta)
  return Math.round(num * shift) / shift
}

export function ConverterWidget({ categoryId }: ConverterWidgetProps) {
  const converter = converters[categoryId]
  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")
  const [result, setResult] = useState("")

  useEffect(() => {
    if (converter && converter.units.length > 0) {
      setFromUnit(converter.units[0].value)
      setToUnit(converter.units[1]?.value || converter.units[0].value)
    }
  }, [converter])

  useEffect(() => {
    if (!converter || !fromUnit || !toUnit || !fromValue) return

    const fromUnitData = converter.units.find(u => u.value === fromUnit)
    const toUnitData = converter.units.find(u => u.value === toUnit)

    if (!fromUnitData || !toUnitData) return

    const numValue = parseFloat(fromValue)
    if (isNaN(numValue)) {
      setResult("")
      return
    }

    const baseValue = numValue * fromUnitData.multiplier
    const convertedValue = baseValue / toUnitData.multiplier
    const rounded = newRound(convertedValue, 6)
    
    setResult(rounded.toString())
  }, [fromValue, fromUnit, toUnit, converter])

  if (!converter) {
    return <div className="p-4 text-xs text-muted-foreground">Converter not found</div>
  }

  return (
    <div className="space-y-3 p-4 overflow-visible">
      <h3 className="font-bold text-sm text-foreground mb-3">{converter.name}</h3>
      
      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          <input
            type="number"
            value={fromValue}
            onChange={e => setFromValue(e.target.value)}
            placeholder="1"
            className="w-full border border-border bg-background rounded px-3 py-2 text-sm mb-2"
          />
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48 z-[100]">
              {converter.units.map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          <div className="w-full border border-border bg-muted/50 rounded px-3 py-2 text-sm mb-2 font-medium">
            {result || "0"}
          </div>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48 z-[100]">
              {converter.units.map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-xs">
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
