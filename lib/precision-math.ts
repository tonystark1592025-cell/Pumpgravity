/**
 * Precision Math Library
 * 
 * This library provides scientifically accurate calculations using Math.js
 * to overcome JavaScript's native floating-point precision limitations.
 * 
 * Mimics Casio calculator precision with arbitrary-precision decimal arithmetic.
 */

import { create, all, ConfigOptions, MathJsInstance } from 'mathjs'

// Configure Math.js with high precision (similar to Casio calculators)
const config: ConfigOptions = {
  number: 'BigNumber',      // Use BigNumber for arbitrary precision
  precision: 64,            // 64 significant digits (Casio uses ~15-16)
}

// Create a Math.js instance with our configuration
const math: MathJsInstance = create(all, config)

/**
 * Precision calculator class
 * Manages calculator state and provides high-precision operations
 */
export class PrecisionCalculator {
  private memory: any = math.bignumber(0)
  private angleMode: 'deg' | 'rad' = 'deg'
  
  /**
   * Set angle mode for trigonometric functions
   */
  setAngleMode(mode: 'deg' | 'rad') {
    this.angleMode = mode
  }
  
  /**
   * Get current angle mode
   */
  getAngleMode(): 'deg' | 'rad' {
    return this.angleMode
  }
  
  /**
   * Store value in memory
   */
  memoryStore(value: number | string) {
    this.memory = math.bignumber(value)
  }
  
  /**
   * Add to memory
   */
  memoryAdd(value: number | string) {
    this.memory = math.add(this.memory, math.bignumber(value))
  }
  
  /**
   * Subtract from memory
   */
  memorySubtract(value: number | string) {
    this.memory = math.subtract(this.memory, math.bignumber(value))
  }
  
  /**
   * Recall memory value
   */
  memoryRecall(): string {
    return this.memory.toString()
  }
  
  /**
   * Clear memory
   */
  memoryClear() {
    this.memory = math.bignumber(0)
  }
}

/**
 * High-precision addition
 */
export function add(a: number | string, b: number | string): string {
  return math.add(math.bignumber(a), math.bignumber(b)).toString()
}

/**
 * High-precision subtraction
 */
export function subtract(a: number | string, b: number | string): string {
  return math.subtract(math.bignumber(a), math.bignumber(b)).toString()
}

/**
 * High-precision multiplication
 */
export function multiply(a: number | string, b: number | string): string {
  return math.multiply(math.bignumber(a), math.bignumber(b)).toString()
}

/**
 * High-precision division
 */
export function divide(a: number | string, b: number | string): string {
  if (parseFloat(b.toString()) === 0) {
    throw new Error('Division by zero')
  }
  return math.divide(math.bignumber(a), math.bignumber(b)).toString()
}

/**
 * High-precision power/exponentiation
 */
export function power(base: number | string, exponent: number | string): string {
  return math.pow(math.bignumber(base), math.bignumber(exponent)).toString()
}

/**
 * High-precision square root
 */
export function sqrt(value: number | string): string {
  return math.sqrt(math.bignumber(value)).toString()
}

/**
 * High-precision cube root
 */
export function cbrt(value: number | string): string {
  return math.cbrt(math.bignumber(value)).toString()
}

/**
 * High-precision sine (handles both degrees and radians)
 */
export function sin(value: number | string, angleMode: 'deg' | 'rad' = 'rad'): string {
  const val = math.bignumber(value)
  if (angleMode === 'deg') {
    // Convert degrees to radians
    const radians = math.multiply(val, math.divide(math.pi, math.bignumber(180)))
    return math.sin(radians).toString()
  }
  return math.sin(val).toString()
}

/**
 * High-precision cosine (handles both degrees and radians)
 */
export function cos(value: number | string, angleMode: 'deg' | 'rad' = 'rad'): string {
  const val = math.bignumber(value)
  if (angleMode === 'deg') {
    const radians = math.multiply(val, math.divide(math.pi, math.bignumber(180)))
    return math.cos(radians).toString()
  }
  return math.cos(val).toString()
}

/**
 * High-precision tangent (handles both degrees and radians)
 */
export function tan(value: number | string, angleMode: 'deg' | 'rad' = 'rad'): string {
  const val = math.bignumber(value)
  if (angleMode === 'deg') {
    const radians = math.multiply(val, math.divide(math.pi, math.bignumber(180)))
    return math.tan(radians).toString()
  }
  return math.tan(val).toString()
}

/**
 * High-precision natural logarithm
 */
export function ln(value: number | string): string {
  return math.log(math.bignumber(value)).toString()
}

/**
 * High-precision base-10 logarithm
 */
export function log10(value: number | string): string {
  return math.log10(math.bignumber(value)).toString()
}

/**
 * High-precision absolute value
 */
export function abs(value: number | string): string {
  return math.abs(math.bignumber(value)).toString()
}

/**
 * Evaluate a mathematical expression with high precision
 * Supports complex expressions like "2 + 3 * 4 / 2"
 */
export function evaluate(expression: string): string {
  try {
    const result = math.evaluate(expression)
    return result.toString()
  } catch (error) {
    throw new Error(`Invalid expression: ${expression}`)
  }
}

/**
 * Format a number to a specific number of decimal places
 * Uses proper rounding (not truncation)
 */
export function format(value: number | string, decimals: number = 2): string {
  const val = math.bignumber(value)
  return math.format(val, { notation: 'fixed', precision: decimals })
}

/**
 * Format a number with significant figures
 */
export function formatSignificant(value: number | string, significantDigits: number = 6): string {
  const val = math.bignumber(value)
  return math.format(val, { notation: 'auto', precision: significantDigits })
}

/**
 * Convert to number (for display purposes)
 * Note: This may lose precision for very large/small numbers
 */
export function toNumber(value: string): number {
  return parseFloat(value)
}

/**
 * Check if a value is zero (within precision tolerance)
 */
export function isZero(value: number | string): boolean {
  return math.equal(math.bignumber(value), math.bignumber(0))
}

/**
 * Compare two values with high precision
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compare(a: number | string, b: number | string): number {
  const result = math.compare(math.bignumber(a), math.bignumber(b))
  return typeof result === 'number' ? result : parseInt(result.toString())
}

/**
 * Round to nearest integer
 */
export function round(value: number | string): string {
  return math.round(math.bignumber(value)).toString()
}

/**
 * Floor function
 */
export function floor(value: number | string): string {
  return math.floor(math.bignumber(value)).toString()
}

/**
 * Ceiling function
 */
export function ceil(value: number | string): string {
  return math.ceil(math.bignumber(value)).toString()
}

/**
 * Modulo operation
 */
export function mod(a: number | string, b: number | string): string {
  return math.mod(math.bignumber(a), math.bignumber(b)).toString()
}

/**
 * Percentage calculation
 */
export function percentage(value: number | string, percent: number | string): string {
  return multiply(value, divide(percent, '100'))
}

// Export the math instance for advanced usage
export { math }

// Export a singleton calculator instance
export const calculator = new PrecisionCalculator()
