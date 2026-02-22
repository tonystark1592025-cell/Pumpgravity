/**
 * Format a number to show exact value without unnecessary decimals
 * For example: 1 stays as "1", not "1.0" or "1.00"
 * But 1.5 stays as "1.5"
 */
export function formatExact(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num) || !isFinite(num)) {
    return String(value)
  }
  
  // Check if it's a whole number
  if (Number.isInteger(num)) {
    return num.toString()
  }
  
  // For decimals, remove trailing zeros
  return num.toString().replace(/\.?0+$/, '')
}

/**
 * Format a number with specific precision only if needed
 * RPM should always be whole numbers
 * Other values show decimals only if they exist
 */
export function formatValue(value: number | string, isRPM: boolean = false): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num) || !isFinite(num)) {
    return String(value)
  }
  
  // RPM should always be rounded to whole number
  if (isRPM) {
    return Math.round(num).toString()
  }
  
  // For other values, keep exact representation
  return formatExact(num)
}
