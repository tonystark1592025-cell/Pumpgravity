// Unit Conversion Library for Calculators
// All conversions go through SI base units

export type UnitType = 'flow' | 'head' | 'power' | 'speed' | 'diameter' | 'specificGravity'

export interface UnitDefinition {
  value: string
  label: string
  toSI: number // Multiplication factor to convert to SI
  fromSI: number // Multiplication factor to convert from SI
}

// Flow Rate Units (SI: m³/h)
export const flowUnits: UnitDefinition[] = [
  { value: 'm3h', label: 'm³/h', toSI: 1, fromSI: 1 },
  { value: 'lh', label: 'L/h', toSI: 0.001, fromSI: 1000 },
  { value: 'lmin', label: 'L/min', toSI: 0.06, fromSI: 16.6667 },
  { value: 'gpm', label: 'GPM (US)', toSI: 0.227124, fromSI: 4.40287 },
  { value: 'gph', label: 'GPH (US)', toSI: 0.00378541, fromSI: 264.172 },
  { value: 'cfm', label: 'CFM', toSI: 1.69901, fromSI: 0.588578 },
  { value: 'm3min', label: 'm³/min', toSI: 60, fromSI: 0.0166667 },
]

// Head/Length Units (SI: m)
export const headUnits: UnitDefinition[] = [
  { value: 'm', label: 'meters (m)', toSI: 1, fromSI: 1 },
  { value: 'ft', label: 'feet (ft)', toSI: 0.3048, fromSI: 3.28084 },
  { value: 'cm', label: 'centimeters (cm)', toSI: 0.01, fromSI: 100 },
  { value: 'mm', label: 'millimeters (mm)', toSI: 0.001, fromSI: 1000 },
  { value: 'in', label: 'inches (in)', toSI: 0.0254, fromSI: 39.3701 },
]

// Power Units (SI: kW)
export const powerUnits: UnitDefinition[] = [
  { value: 'kw', label: 'kW', toSI: 1, fromSI: 1 },
  { value: 'hp', label: 'HP', toSI: 0.745699, fromSI: 1.34102 },
  { value: 'w', label: 'Watts (W)', toSI: 0.001, fromSI: 1000 },
  { value: 'mw', label: 'MW', toSI: 1000, fromSI: 0.001 },
]

// Speed Units (SI: RPM)
export const speedUnits: UnitDefinition[] = [
  { value: 'rpm', label: 'RPM', toSI: 1, fromSI: 1 },
  { value: 'rps', label: 'RPS', toSI: 60, fromSI: 0.0166667 },
  { value: 'rads', label: 'rad/s', toSI: 9.5493, fromSI: 0.104720 },
]

// Diameter Units (SI: mm)
export const diameterUnits: UnitDefinition[] = [
  { value: 'mm', label: 'mm', toSI: 1, fromSI: 1 },
  { value: 'cm', label: 'cm', toSI: 10, fromSI: 0.1 },
  { value: 'm', label: 'm', toSI: 1000, fromSI: 0.001 },
  { value: 'in', label: 'inches', toSI: 25.4, fromSI: 0.0393701 },
  { value: 'ft', label: 'feet', toSI: 304.8, fromSI: 0.00328084 },
]

// Specific Gravity (dimensionless, no conversion needed)
export const specificGravityUnits: UnitDefinition[] = [
  { value: 'sg', label: 'SG', toSI: 1, fromSI: 1 },
]

/**
 * Convert a value from any unit to SI base unit
 */
export function convertToSI(value: number, unit: string, unitType: UnitType): number {
  const unitList = getUnitList(unitType)
  const unitDef = unitList.find(u => u.value === unit)
  if (!unitDef) return value
  return value * unitDef.toSI
}

/**
 * Convert a value from SI base unit to any unit
 */
export function convertFromSI(value: number, unit: string, unitType: UnitType): number {
  const unitList = getUnitList(unitType)
  const unitDef = unitList.find(u => u.value === unit)
  if (!unitDef) return value
  return value * unitDef.fromSI
}

/**
 * Get the appropriate unit list for a unit type
 */
export function getUnitList(unitType: UnitType): UnitDefinition[] {
  switch (unitType) {
    case 'flow': return flowUnits
    case 'head': return headUnits
    case 'power': return powerUnits
    case 'speed': return speedUnits
    case 'diameter': return diameterUnits
    case 'specificGravity': return specificGravityUnits
    default: return []
  }
}

/**
 * Get the SI unit label for a unit type
 */
export function getSIUnit(unitType: UnitType): string {
  switch (unitType) {
    case 'flow': return 'm³/h'
    case 'head': return 'm'
    case 'power': return 'kW'
    case 'speed': return 'RPM'
    case 'diameter': return 'mm'
    case 'specificGravity': return 'SG'
    default: return ''
  }
}
