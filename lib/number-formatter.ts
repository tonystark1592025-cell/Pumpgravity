/**
 * Format a number for display, using scientific notation for very large or very small numbers
 * @param value - The number to format (as string or number)
 * @param maxDigits - Maximum number of digits before switching to scientific notation (default: 10)
 * @returns Formatted string
 */
export function formatDisplayNumber(value: string | number, maxDigits: number = 10): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  // Handle invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return String(value)
  }
  
  // Handle zero
  if (num === 0) {
    return '0'
  }
  
  const absNum = Math.abs(num)
  const numStr = absNum.toString()
  
  // Count significant digits (excluding decimal point and leading zeros)
  const significantDigits = numStr.replace('.', '').replace(/^0+/, '').length
  
  // Use scientific notation for very large numbers (more than maxDigits digits)
  // or very small numbers (more than 4 leading zeros after decimal)
  if (significantDigits > maxDigits || (absNum < 0.0001 && absNum > 0)) {
    // Determine appropriate precision for scientific notation
    const precision = Math.min(3, maxDigits - 1)
    return num.toExponential(precision)
  }
  
  // For normal numbers, return as-is (already formatted by calculator)
  return String(value)
}
