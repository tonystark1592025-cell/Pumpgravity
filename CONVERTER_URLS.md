# Converter URL Structure

## Overview
The converter system uses Next.js dynamic routes with hash-based unit selection for SEO-friendly URLs.

## URL Patterns

### Main Converters Page
```
/converters
```
Shows all converter categories in a grid layout.

### Category Pages
```
/converters/{category}
```
Examples:
- `/converters/mass` - Mass converter
- `/converters/length` - Length converter
- `/converters/temperature` - Temperature converter
- `/converters/all` - All units converter

### Specific Unit Conversions (with hash)
```
/converters/{category}#{fromUnit}-{toUnit}
```
Examples:
- `/converters/mass#kg-lb` - Convert kilograms to pounds
- `/converters/mass#mcg-mg` - Convert micrograms to milligrams
- `/converters/temperature#C-F` - Convert Celsius to Fahrenheit
- `/converters/length#m-ft` - Convert meters to feet

## Features

### 1. SEO-Friendly URLs
- Each unit-to-unit conversion has a unique URL
- Google can index specific conversions
- Users can bookmark and share specific conversions

### 2. Dynamic Hash Updates
- URL hash updates automatically when units change
- Browser back/forward buttons work correctly
- Direct links to specific conversions work on page load

### 3. Sitemap Generation
- Automatically generates 591 URLs for sitemap
- Includes all category pages and unit combinations
- Run `npx tsx scripts/generate-converter-sitemap.ts` to see all URLs

## Statistics

- **Total URLs**: 591
- **Category Pages**: 17 (including "all")
- **Unit-to-Unit Conversions**: 574

### URLs by Category:
- Mass: 42 URLs
- Length: 72 URLs
- Area: 42 URLs
- Volume: 56 URLs
- Temperature: 12 URLs
- Time: 72 URLs
- Digital: 60 URLs
- Speed: 20 URLs
- Pressure: 20 URLs
- Energy: 30 URLs
- Power: 20 URLs
- Electrical: 42 URLs
- Flow: 20 URLs
- Light: 18 URLs
- Mechanics: 48 URLs

## Implementation

### File Structure
```
app/
├── converters/
│   ├── page.tsx                    # Main category grid
│   └── [category]/
│       └── page.tsx                # Dynamic category converter
lib/
├── converters-data.ts              # Shared converter data
└── generate-converter-urls.ts      # URL generation utilities
scripts/
└── generate-converter-sitemap.ts   # Sitemap generation script
```

### Key Features in Code

1. **URL Hash Handling** (`app/converters/[category]/page.tsx`):
   - Reads hash on page load to pre-select units
   - Updates hash when units change
   - Format: `#fromUnit-toUnit`

2. **Sitemap Generation** (`lib/generate-converter-urls.ts`):
   - `generateConverterUrls()` - Returns all URLs
   - `generateConverterSitemapEntries()` - Returns URLs with metadata
   - `getConverterUrlCount()` - Returns total count

3. **Next.js Sitemap** (`app/sitemap.ts`):
   - Automatically generates sitemap.xml
   - Includes all converter URLs
   - Accessible at `/sitemap.xml`

## Usage Examples

### For Users
1. Visit `/converters` to see all categories
2. Click a category (e.g., "Mass") to go to `/converters/mass`
3. Select units to convert - URL updates to `/converters/mass#kg-lb`
4. Share the URL - others will see the same conversion

### For SEO
Google will index URLs like:
- `/converters/mass#kg-lb` as "Convert Kilogram to Pound"
- `/converters/temperature#C-F` as "Convert Celsius to Fahrenheit"
- `/converters/length#m-ft` as "Convert Meter to Foot"

Each URL has unique metadata for better search results.

## Future Enhancements

1. **Meta Tags**: Add dynamic meta tags for each conversion
2. **Structured Data**: Add JSON-LD schema for better SEO
3. **Popular Conversions**: Track and highlight popular conversions
4. **Recent Conversions**: Store user's recent conversions in localStorage
