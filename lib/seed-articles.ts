import { database, Article } from './database'

export async function seedMoreArticles() {
  const additionalArticles: Omit<Article, 'id'>[] = [
    {
      title: 'Pressure Conversion Fundamentals',
      slug: 'pressure-conversion-fundamentals',
      excerpt: 'Master pressure conversions between PSI, bar, Pascal, and other units commonly used in engineering applications.',
      content: `# Pressure Conversion Fundamentals

Pressure is one of the most critical parameters in engineering, from hydraulic systems to atmospheric measurements. Understanding how to convert between different pressure units is essential for any engineer.

## Understanding Pressure

Pressure is defined as force per unit area:
\`\`\`
P = F/A
\`\`\`

Where:
- P = Pressure
- F = Force
- A = Area

## Common Pressure Units

### Absolute vs. Gauge Pressure
- **Absolute Pressure**: Measured relative to perfect vacuum
- **Gauge Pressure**: Measured relative to atmospheric pressure

### SI Units
- **Pascal (Pa)**: The base SI unit (1 Pa = 1 N/m²)
- **Kilopascal (kPa)**: 1 kPa = 1,000 Pa
- **Megapascal (MPa)**: 1 MPa = 1,000,000 Pa

### Imperial Units
- **Pounds per Square Inch (PSI)**: Common in North America
- **Pounds per Square Foot (PSF)**: Used for lower pressures

### Other Common Units
- **Bar**: 1 bar = 100,000 Pa = 100 kPa
- **Atmosphere (atm)**: 1 atm = 101,325 Pa
- **Torr**: 1 Torr = 133.322 Pa
- **mmHg**: Millimeters of mercury (same as Torr)

## Key Conversion Factors

### PSI Conversions
- 1 PSI = 6.895 kPa
- 1 PSI = 0.06895 bar
- 1 PSI = 51.715 Torr

### Bar Conversions
- 1 bar = 100 kPa
- 1 bar = 14.504 PSI
- 1 bar = 0.9869 atm

### Atmospheric Pressure
- 1 atm = 101.325 kPa
- 1 atm = 14.696 PSI
- 1 atm = 1.01325 bar
- 1 atm = 760 Torr

## Practical Examples

### Example 1: Tire Pressure
Convert 32 PSI to bar:
\`\`\`
32 PSI × (0.06895 bar/PSI) = 2.21 bar
\`\`\`

### Example 2: Hydraulic System
Convert 150 bar to PSI:
\`\`\`
150 bar × (14.504 PSI/bar) = 2,176 PSI
\`\`\`

### Example 3: Vacuum Measurement
Convert 25 inHg to kPa:
\`\`\`
25 inHg × (25.4 mmHg/inHg) × (0.133322 kPa/mmHg) = 84.7 kPa
\`\`\`

## Applications in Engineering

### HVAC Systems
- Duct pressure: typically measured in inches of water column (inWC)
- 1 inWC = 0.2488 kPa

### Process Industries
- Steam systems: often use bar or PSI
- Chemical processes: may use various units depending on region

### Automotive
- Engine manifold pressure: typically PSI or bar
- Tire pressure: PSI in US, bar in Europe

## Best Practices

1. **Always specify units** in calculations and documentation
2. **Use consistent units** throughout a project
3. **Double-check conversions** using multiple methods
4. **Consider significant figures** in your results
5. **Understand gauge vs. absolute** pressure requirements

## Common Mistakes to Avoid

- Confusing gauge and absolute pressure
- Using wrong conversion factors
- Not accounting for temperature effects
- Mixing units in calculations

## Conclusion

Pressure conversions are fundamental to engineering practice. By understanding the relationships between different units and following best practices, you can ensure accurate calculations and safe system designs.`,
      author: 'Engineering Team',
      publishedAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      tags: ['pressure', 'conversions', 'engineering', 'hydraulics', 'HVAC'],
      category: 'Engineering Fundamentals',
      readTime: 6,
      featured: false
    },
    {
      title: 'Temperature Scales and Conversions',
      slug: 'temperature-scales-conversions',
      excerpt: 'Complete guide to temperature conversions between Celsius, Fahrenheit, Kelvin, and Rankine scales.',
      content: `# Temperature Scales and Conversions

Temperature measurement is fundamental to engineering, from thermodynamics to materials science. This guide covers all major temperature scales and their conversions.

## Temperature Scales Overview

### Celsius (°C)
- Water freezes at 0°C
- Water boils at 100°C (at standard pressure)
- Most common scale worldwide

### Fahrenheit (°F)
- Water freezes at 32°F
- Water boils at 212°F (at standard pressure)
- Common in the United States

### Kelvin (K)
- Absolute temperature scale
- 0 K = absolute zero (-273.15°C)
- SI base unit for temperature

### Rankine (°R)
- Absolute scale based on Fahrenheit
- 0°R = absolute zero
- Used in some engineering applications

## Conversion Formulas

### Celsius to Fahrenheit
\`\`\`
°F = (°C × 9/5) + 32
\`\`\`

### Fahrenheit to Celsius
\`\`\`
°C = (°F - 32) × 5/9
\`\`\`

### Celsius to Kelvin
\`\`\`
K = °C + 273.15
\`\`\`

### Kelvin to Celsius
\`\`\`
°C = K - 273.15
\`\`\`

### Fahrenheit to Rankine
\`\`\`
°R = °F + 459.67
\`\`\`

### Rankine to Fahrenheit
\`\`\`
°F = °R - 459.67
\`\`\`

## Quick Reference Points

| Description | °C | °F | K | °R |
|-------------|----|----|---|-----|
| Absolute Zero | -273.15 | -459.67 | 0 | 0 |
| Water Freezes | 0 | 32 | 273.15 | 491.67 |
| Room Temperature | 20 | 68 | 293.15 | 527.67 |
| Body Temperature | 37 | 98.6 | 310.15 | 558.27 |
| Water Boils | 100 | 212 | 373.15 | 671.67 |

## Engineering Applications

### Thermodynamics
- Always use absolute scales (Kelvin or Rankine)
- Critical for gas law calculations
- Essential for efficiency calculations

### Materials Science
- Melting points typically in Celsius or Kelvin
- Heat treatment processes
- Phase diagrams

### HVAC Engineering
- Comfort temperatures in Celsius or Fahrenheit
- Heat transfer calculations in Kelvin
- Refrigeration cycles

## Practical Examples

### Example 1: Engine Operating Temperature
Convert 90°C to Fahrenheit:
\`\`\`
°F = (90 × 9/5) + 32 = 162 + 32 = 194°F
\`\`\`

### Example 2: Cryogenic Application
Convert -196°C (liquid nitrogen) to Kelvin:
\`\`\`
K = -196 + 273.15 = 77.15 K
\`\`\`

### Example 3: Furnace Temperature
Convert 1500°F to Celsius:
\`\`\`
°C = (1500 - 32) × 5/9 = 1468 × 5/9 = 815.6°C
\`\`\`

## Common Mistakes

1. **Forgetting the offset** in Celsius/Fahrenheit conversions
2. **Using relative scales** in thermodynamic calculations
3. **Rounding errors** in multi-step conversions
4. **Unit confusion** in equations

## Best Practices

- Use Kelvin for all thermodynamic calculations
- Specify temperature scale clearly
- Maintain appropriate significant figures
- Double-check conversions with known reference points

Temperature conversions are essential for engineering success. Master these fundamentals to ensure accurate calculations across all thermal applications.`,
      author: 'Thermal Engineering Team',
      publishedAt: '2024-01-25T09:15:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
      tags: ['temperature', 'conversions', 'thermodynamics', 'HVAC', 'materials'],
      category: 'Engineering Fundamentals',
      readTime: 5,
      featured: true
    }
  ]

  for (const article of additionalArticles) {
    await database.addArticle(article)
  }

  console.log('Additional articles seeded successfully!')
}

// Run this function to seed more articles
if (require.main === module) {
  seedMoreArticles().catch(console.error)
}