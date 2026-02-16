/**
 * Pump Affinity Law Calculator with High Precision
 * 
 * Uses Math.js for scientifically accurate calculations
 */

import { multiply, divide, power, sqrt, cbrt, formatSignificant } from './precision-math'

/**
 * Calculate flow rate using affinity law: Q1/Q2 = N1/N2 or D1/D2
 */
export function calculateFlowRate(
  q1: number | null,
  q2: number | null,
  v1: number | null,
  v2: number | null
): { value: string; variable: 'q1' | 'q2' | 'v1' | 'v2' } | null {
  
  if (v1 !== null && v2 !== null && q1 !== null && q2 === null) {
    // Calculate Q2: Q2 = Q1 × (V2 / V1)
    const ratio = divide(v2.toString(), v1.toString())
    const result = multiply(q1.toString(), ratio)
    return { value: result, variable: 'q2' }
  }
  
  if (v1 !== null && v2 !== null && q2 !== null && q1 === null) {
    // Calculate Q1: Q1 = Q2 × (V1 / V2)
    const ratio = divide(v1.toString(), v2.toString())
    const result = multiply(q2.toString(), ratio)
    return { value: result, variable: 'q1' }
  }
  
  if (v1 !== null && q1 !== null && q2 !== null && v2 === null) {
    // Calculate V2: V2 = V1 × (Q2 / Q1)
    const ratio = divide(q2.toString(), q1.toString())
    const result = multiply(v1.toString(), ratio)
    return { value: result, variable: 'v2' }
  }
  
  if (v2 !== null && q1 !== null && q2 !== null && v1 === null) {
    // Calculate V1: V1 = V2 × (Q1 / Q2)
    const ratio = divide(q1.toString(), q2.toString())
    const result = multiply(v2.toString(), ratio)
    return { value: result, variable: 'v1' }
  }
  
  return null
}

/**
 * Calculate head using affinity law: H1/H2 = (N1/N2)² or (D1/D2)²
 */
export function calculateHead(
  h1: number | null,
  h2: number | null,
  v1: number | null,
  v2: number | null
): { value: string; variable: 'h1' | 'h2' | 'v1' | 'v2' } | null {
  
  if (v1 !== null && v2 !== null && h1 !== null && h2 === null) {
    // Calculate H2: H2 = H1 × (V2 / V1)²
    const ratio = divide(v2.toString(), v1.toString())
    const ratioSquared = power(ratio, '2')
    const result = multiply(h1.toString(), ratioSquared)
    return { value: result, variable: 'h2' }
  }
  
  if (v1 !== null && v2 !== null && h2 !== null && h1 === null) {
    // Calculate H1: H1 = H2 × (V1 / V2)²
    const ratio = divide(v1.toString(), v2.toString())
    const ratioSquared = power(ratio, '2')
    const result = multiply(h2.toString(), ratioSquared)
    return { value: result, variable: 'h1' }
  }
  
  if (v1 !== null && h1 !== null && h2 !== null && v2 === null) {
    // Calculate V2: V2 = V1 × √(H2 / H1)
    const ratio = divide(h2.toString(), h1.toString())
    const sqrtRatio = sqrt(ratio)
    const result = multiply(v1.toString(), sqrtRatio)
    return { value: result, variable: 'v2' }
  }
  
  if (v2 !== null && h1 !== null && h2 !== null && v1 === null) {
    // Calculate V1: V1 = V2 × √(H1 / H2)
    const ratio = divide(h1.toString(), h2.toString())
    const sqrtRatio = sqrt(ratio)
    const result = multiply(v2.toString(), sqrtRatio)
    return { value: result, variable: 'v1' }
  }
  
  return null
}

/**
 * Calculate power using affinity law: P1/P2 = (N1/N2)³ or (D1/D2)³
 */
export function calculatePower(
  p1: number | null,
  p2: number | null,
  v1: number | null,
  v2: number | null
): { value: string; variable: 'p1' | 'p2' | 'v1' | 'v2' } | null {
  
  if (v1 !== null && v2 !== null && p1 !== null && p2 === null) {
    // Calculate P2: P2 = P1 × (V2 / V1)³
    const ratio = divide(v2.toString(), v1.toString())
    const ratioCubed = power(ratio, '3')
    const result = multiply(p1.toString(), ratioCubed)
    return { value: result, variable: 'p2' }
  }
  
  if (v1 !== null && v2 !== null && p2 !== null && p1 === null) {
    // Calculate P1: P1 = P2 × (V1 / V2)³
    const ratio = divide(v1.toString(), v2.toString())
    const ratioCubed = power(ratio, '3')
    const result = multiply(p2.toString(), ratioCubed)
    return { value: result, variable: 'p1' }
  }
  
  if (v1 !== null && p1 !== null && p2 !== null && v2 === null) {
    // Calculate V2: V2 = V1 × ∛(P2 / P1)
    const ratio = divide(p2.toString(), p1.toString())
    const cbrtRatio = cbrt(ratio)
    const result = multiply(v1.toString(), cbrtRatio)
    return { value: result, variable: 'v2' }
  }
  
  if (v2 !== null && p1 !== null && p2 !== null && v1 === null) {
    // Calculate V1: V1 = V2 × ∛(P1 / P2)
    const ratio = divide(p1.toString(), p2.toString())
    const cbrtRatio = cbrt(ratio)
    const result = multiply(v2.toString(), cbrtRatio)
    return { value: result, variable: 'v1' }
  }
  
  return null
}

/**
 * Format calculation result for display
 */
export function formatResult(value: string, decimals: number = 6): string {
  return formatSignificant(value, decimals)
}
