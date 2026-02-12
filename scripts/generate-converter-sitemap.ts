import { generateConverterUrls, generateConverterSitemapEntries, getConverterUrlCount } from "../lib/generate-converter-urls"

// Configuration
const BASE_URL = "http://localhost:3000" // Change this to your production URL

console.log("=".repeat(80))
console.log("CONVERTER URL GENERATOR")
console.log("=".repeat(80))
console.log()

// Generate all URLs
const urls = generateConverterUrls(BASE_URL)
console.log(`Total URLs generated: ${urls.length}`)
console.log(`Expected count: ${getConverterUrlCount()}`)
console.log()

// Show sample URLs
console.log("Sample URLs:")
console.log("-".repeat(80))
urls.slice(0, 20).forEach(url => console.log(url))
console.log("...")
console.log()

// Generate sitemap entries with metadata
const entries = generateConverterSitemapEntries(BASE_URL)
console.log(`Total sitemap entries with metadata: ${entries.length}`)
console.log()

// Show sample entries
console.log("Sample Sitemap Entries:")
console.log("-".repeat(80))
entries.slice(0, 5).forEach(entry => {
  console.log(`URL: ${entry.url}`)
  console.log(`Title: ${entry.title}`)
  console.log(`Description: ${entry.description.substring(0, 100)}...`)
  console.log()
})

// Group by category
const byCategory = entries.reduce((acc, entry) => {
  if (!acc[entry.category]) acc[entry.category] = 0
  acc[entry.category]++
  return acc
}, {} as Record<string, number>)

console.log("URLs by Category:")
console.log("-".repeat(80))
Object.entries(byCategory).forEach(([category, count]) => {
  console.log(`${category}: ${count} URLs`)
})
console.log()

// Export for sitemap.xml generation
console.log("To use in sitemap.xml, import generateConverterUrls() from lib/generate-converter-urls")
console.log("Example:")
console.log(`
import { generateConverterUrls } from './lib/generate-converter-urls'

export default function sitemap() {
  const converterUrls = generateConverterUrls('https://yoursite.com')
  
  return converterUrls.map(url => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
}
`)
