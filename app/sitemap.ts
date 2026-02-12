import { MetadataRoute } from 'next'
import { generateConverterUrls } from '@/lib/generate-converter-urls'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  // Generate all converter URLs
  const converterUrls = generateConverterUrls(baseUrl)
  const converterPages = converterUrls.map(url => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: url.includes('#') ? 0.7 : 0.8, // Category pages get higher priority
  }))

  return [...staticPages, ...converterPages]
}
