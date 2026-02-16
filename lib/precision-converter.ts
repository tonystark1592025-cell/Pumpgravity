/**
 * Precision Converter Utility
 * 
 * Provides high-precision unit conversions using Math.js
 * to ensure Casio calculator-level accuracy
 */

import { multiply, divide, add, subtract, format, formatSignificant } from './precision-math'

/**
 * Convert between units using high-precision arithmetic
 * 
 * @param value - The value to convert
 * @param fromFactor - Conversion factor from source unit to base unit
 * @param toFactor - Conversion factor from base unit to target unit
 * @returns Converted value as string
 */
export function precisionConvert(
  value: number | string,
  fromFactor: number | string,
  toFactor: number | string
): string {
  // Convert to base unit
  const baseValue = multiply(value.toString(), fromFactor.toString())
  
  // Convert from base unit to target unit
  const result = divide(baseValue, toFactor.toString())
  
  return result
}

/**
 * Temperature conversion with high precision
 * Handles Celsius, Fahrenheit, Kelvin, and Rankine
 */
export function convertTemperature(
  value: number | string,
  fromUnit: string,
  toUnit: string
): string {
  const val = value.toString()
  
  // First convert to Celsius
  let celsius: string
  
  switch (fromUnit.toLowerCase()) {
    case 'c':
    case 'celsius':
      celsius = val
      break
    case 'f':
    case 'fahrenheit':
      // (F - 32) / 1.8
      celsius = divide(subtract(val, '32'), '1.8')
      break
    case 'k':
    case 'kelvin':
      // K - 273.15
      celsius = subtract(val, '273.15')
      break
    case 'r':
    case 'rankine':
      // (R - 491.67) / 1.8
      celsius = divide(subtract(val, '491.67'), '1.8')
      break
    default:
      celsius = val
  }
  
  // Then convert from Celsius to target unit
  let result: string
  
  switch (toUnit.toLowerCase()) {
    case 'c':
    case 'celsius':
      result = celsius
      break
    case 'f':
    case 'fahrenheit':
      // (C * 1.8) + 32
      result = add(multiply(celsius, '1.8'), '32')
      break
    case 'k':
    case 'kelvin':
      // C + 273.15
      result = add(celsius, '273.15')
      break
    case 'r':
    case 'rankine':
      // (C * 1.8) + 491.67
      result = add(multiply(celsius, '1.8'), '491.67')
      break
    default:
      result = celsius
  }
  
  return result
}

/**
 * Round result to appropriate precision
 * Uses smart rounding based on magnitude
 */
export function smartRound(value: string, maxDecimals: number = 6): string {
  const num = parseFloat(value)
  
  if (isNaN(num)) return '0'
  
  // For very small numbers, use more decimal places
  if (Math.abs(num) < 0.01 && Math.abs(num) > 0) {
    return formatSignificant(value, maxDecimals)
  }
  
  // For normal numbers, use fixed decimal places
  if (Math.abs(num) < 1000) {
    return format(value, Math.min(4, maxDecimals))
  }
  
  // For large numbers, use fewer decimal places
  if (Math.abs(num) < 1000000) {
    return format(value, Math.min(2, maxDecimals))
  }
  
  // For very large numbers, use scientific notation
  return formatSignificant(value, maxDecimals)
}

/**
 * Format number for display with proper precision
 */
export function displayFormat(value: string, decimals: number = 4): string {
  try {
    const num = parseFloat(value)
    
    if (isNaN(num)) return '0'
    if (!isFinite(num)) return 'Error'
    
    // Use smart rounding
    return smartRound(value, decimals)
  } catch (error) {
    return '0'
  }
}
