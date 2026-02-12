import { converters } from "./converters-data"

/**
 * Generate all possible converter URLs for sitemap
 * Format: /converters/{category}#{fromUnit}-{toUnit}
 */
export function generateConverterUrls(baseUrl: string = "https://yoursite.com"): string[] {
  const urls: string[] = []

  // Add main converters page
  urls.push(`${baseUrl}/converters`)

  // Add category pages
  const categories = Array.from(new Set(converters.map(c => c.category)))
  categories.forEach(category => {
    urls.push(`${baseUrl}/converters/${category}`)
  })

  // Add all category pages
  urls.push(`${baseUrl}/converters/all`)

  // Generate all unit-to-unit combinations for each converter
  converters.forEach(converter => {
    const units = converter.units
    
    // Generate all possible combinations (from -> to)
    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units.length; j++) {
        if (i !== j) { // Skip same unit conversions
          const fromUnit = units[i].value
          const toUnit = units[j].value
          urls.push(`${baseUrl}/converters/${converter.category}#${fromUnit}-${toUnit}`)
        }
      }
    }
  })

  return urls
}

/**
 * Generate sitemap entries with metadata
 */
export function generateConverterSitemapEntries(baseUrl: string = "https://yoursite.com") {
  const entries: Array<{
    url: string
    title: string
    description: string
    category: string
  }> = []

  converters.forEach(converter => {
    const units = converter.units
    
    // Generate all possible combinations
    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units.length; j++) {
        if (i !== j) {
          const fromUnit = units[i]
          const toUnit = units[j]
          entries.push({
            url: `${baseUrl}/converters/${converter.category}#${fromUnit.value}-${toUnit.value}`,
            title: `Convert ${fromUnit.label} to ${toUnit.label} - ${converter.name}`,
            description: `Instantly convert ${fromUnit.label} (${fromUnit.value}) to ${toUnit.label} (${toUnit.value}). ${converter.about}`,
            category: converter.category
          })
        }
      }
    }
  })

  return entries
}

/**
 * Get total number of converter URLs
 */
export function getConverterUrlCount(): number {
  let count = 0
  
  // Main page + category pages + all page
  count += 1 + Array.from(new Set(converters.map(c => c.category))).length + 1
  
  // All unit combinations
  converters.forEach(converter => {
    const unitCount = converter.units.length
    count += unitCount * (unitCount - 1) // n * (n-1) combinations
  })
  
  return count
}
