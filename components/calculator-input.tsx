"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UnitDefinition } from "@/lib/unit-conversions"

interface CalculatorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  unit: string
  onUnitChange: (unit: string) => void
  units: UnitDefinition[]
  placeholder?: string
  disabled?: boolean
}

export function CalculatorInput({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  placeholder = "0",
  disabled = false
}: CalculatorInputProps) {
  return (
    <div className="mb-4">
      <label className="block font-bold text-foreground mb-1.5 text-sm">{label}:</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-2 border-border bg-background rounded-lg px-3 py-2 text-right text-base focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Select value={unit} onValueChange={onUnitChange} disabled={disabled}>
          <SelectTrigger className="w-32 border-2 border-border bg-background text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u.value} value={u.value}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
