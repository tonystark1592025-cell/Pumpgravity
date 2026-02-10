import { database, Article } from './database'

export async function addSampleArticles() {
  const articles: Omit<Article, 'id'>[] = [
    {
      title: 'Flow Rate Calculations in Pipe Systems',
      slug: 'flow-rate-calculations-pipe-systems',
      excerpt: 'Learn how to calculate flow rates in pipe systems using continuity equation, Bernoulli\'s principle, and friction losses.',
      content: `# Flow Rate Calculations in Pipe Systems

Flow rate calculations are essential for designing and analyzing fluid systems in engineering applications. This guide covers the fundamental principles and practical methods.

## Basic Principles

### Continuity Equation
The continuity equation states that mass flow rate must be constant in a steady flow system:

\`\`\`
ṁ = ρ₁A₁V₁ = ρ₂A₂V₂ = constant
\`\`\`

For incompressible flow (ρ = constant):
\`\`\`
Q = A₁V₁ = A₂V₂ = constant
\`\`\`

Where:
- ṁ = mass flow rate (kg/s)
- ρ = fluid density (kg/m³)
- A = cross-sectional area (m²)
- V = velocity (m/s)
- Q = volumetric flow rate (m³/s)

### Bernoulli's Equation
For ideal fluid flow along a streamline:

\`\`\`
P₁/ρ + V₁²/2 + gz₁ = P₂/ρ + V₂²/2 + gz₂
\`\`\`

## Flow Rate Units

### Volumetric Flow Rate
- **SI Units**: m³/s, L/s, L/min
- **Imperial Units**: ft³/s, gal/min (GPM), ft³/min (CFM)

### Mass Flow Rate
- **SI Units**: kg/s, kg/h
- **Imperial Units**: lb/s, lb/h

## Common Conversion Factors

### Volume Flow Rates
- 1 m³/s = 1000 L/s = 60,000 L/min
- 1 GPM = 0.06309 L/s = 3.785 L/min
- 1 CFM = 0.4719 L/s = 28.32 L/min

## Practical Calculations

### Example 1: Pipe Sizing
Water flows at 50 L/min through a pipe. What diameter is needed for 2 m/s velocity?

\`\`\`
Q = 50 L/min = 50/60 L/s = 0.833 L/s = 0.000833 m³/s
V = 2 m/s

From Q = AV:
A = Q/V = 0.000833/2 = 0.0004165 m²

For circular pipe: A = πD²/4
D = √(4A/π) = √(4 × 0.0004165/π) = 0.023 m = 23 mm
\`\`\`

### Example 2: Velocity Calculation
A 4-inch diameter pipe carries 100 GPM. What is the velocity?

\`\`\`
D = 4 in = 0.1016 m
A = π(0.1016)²/4 = 0.00811 m²

Q = 100 GPM = 100 × 0.06309 L/s = 6.309 L/s = 0.006309 m³/s

V = Q/A = 0.006309/0.00811 = 0.778 m/s
\`\`\`

## Friction Losses

### Darcy-Weisbach Equation
\`\`\`
hf = f × (L/D) × (V²/2g)
\`\`\`

Where:
- hf = head loss due to friction (m)
- f = friction factor (dimensionless)
- L = pipe length (m)
- D = pipe diameter (m)
- V = average velocity (m/s)
- g = gravitational acceleration (9.81 m/s²)

### Reynolds Number
\`\`\`
Re = ρVD/μ = VD/ν
\`\`\`

Where:
- μ = dynamic viscosity (Pa·s)
- ν = kinematic viscosity (m²/s)

## Applications

### HVAC Systems
- Duct sizing for air flow
- Pump selection for water systems
- Pressure drop calculations

### Process Industries
- Pipeline design
- Pump and compressor sizing
- Heat exchanger flow distribution

### Water Distribution
- Municipal water systems
- Irrigation design
- Fire protection systems

## Best Practices

1. **Account for fittings and valves** in pressure drop calculations
2. **Use appropriate safety factors** in design
3. **Consider fluid properties** at operating conditions
4. **Validate calculations** with manufacturer data
5. **Check Reynolds number** for flow regime

Understanding flow rate calculations is crucial for efficient fluid system design and operation.`,
      author: 'Fluid Mechanics Team',
      publishedAt: '2024-01-28T11:00:00Z',
      updatedAt: '2024-01-28T11:00:00Z',
      tags: ['fluid-mechanics', 'flow-rate', 'pipe-systems', 'calculations', 'HVAC'],
      category: 'Fluid Mechanics',
      readTime: 7,
      featured: false
    },
    {
      title: 'Electrical Power Calculations and Conversions',
      slug: 'electrical-power-calculations-conversions',
      excerpt: 'Master electrical power calculations including AC/DC power, three-phase systems, and power factor corrections.',
      content: `# Electrical Power Calculations and Conversions

Electrical power calculations are fundamental to electrical engineering, from basic circuits to complex industrial systems. This comprehensive guide covers all essential concepts.

## Basic Power Relationships

### DC Power
For direct current circuits:
\`\`\`
P = VI = I²R = V²/R
\`\`\`

Where:
- P = Power (Watts)
- V = Voltage (Volts)
- I = Current (Amperes)
- R = Resistance (Ohms)

### AC Power
For alternating current, we have three types of power:

#### Real Power (P)
\`\`\`
P = VI cos φ
\`\`\`

#### Reactive Power (Q)
\`\`\`
Q = VI sin φ
\`\`\`

#### Apparent Power (S)
\`\`\`
S = VI = √(P² + Q²)
\`\`\`

Where φ is the phase angle between voltage and current.

## Power Units and Conversions

### Common Power Units
- **Watt (W)**: Base SI unit
- **Kilowatt (kW)**: 1 kW = 1,000 W
- **Megawatt (MW)**: 1 MW = 1,000,000 W
- **Horsepower (HP)**: 1 HP = 745.7 W

### Energy Units
- **Watt-hour (Wh)**: Energy consumed over time
- **Kilowatt-hour (kWh)**: 1 kWh = 1,000 Wh
- **British Thermal Unit (BTU)**: 1 BTU = 1,055 J

## Three-Phase Power Systems

### Balanced Three-Phase Power
\`\`\`
P = √3 × VL × IL × cos φ
\`\`\`

Where:
- VL = Line voltage
- IL = Line current
- cos φ = Power factor

### Star (Wye) Connection
- Line voltage = √3 × Phase voltage
- Line current = Phase current

### Delta Connection
- Line voltage = Phase voltage
- Line current = √3 × Phase current

## Power Factor

### Definition
Power factor = cos φ = P/S = Real Power/Apparent Power

### Power Factor Correction
To improve power factor from cos φ₁ to cos φ₂:

\`\`\`
Qc = P(tan φ₁ - tan φ₂)
\`\`\`

Where Qc is the required capacitive reactive power.

## Practical Examples

### Example 1: Motor Power Calculation
A 3-phase motor draws 20 A at 400 V with 0.85 power factor:

\`\`\`
P = √3 × 400 × 20 × 0.85 = 11,785 W = 11.8 kW
\`\`\`

### Example 2: Power Factor Correction
Improve power factor from 0.7 to 0.95 for 50 kW load:

\`\`\`
φ₁ = arccos(0.7) = 45.57°
φ₂ = arccos(0.95) = 18.19°

Qc = 50,000 × (tan 45.57° - tan 18.19°)
Qc = 50,000 × (1.020 - 0.329) = 34,550 VAR
\`\`\```

### Example 3: Energy Cost Calculation
Calculate monthly cost for 10 kW load running 8 hours/day at $0.12/kWh:

\`\`\`
Daily energy = 10 kW × 8 h = 80 kWh
Monthly energy = 80 × 30 = 2,400 kWh
Monthly cost = 2,400 × $0.12 = $288
\`\`\`

## Efficiency Calculations

### Motor Efficiency
\`\`\`
η = Pout/Pin = Mechanical Power Output/Electrical Power Input
\`\`\`

### Transformer Efficiency
\`\`\`
η = Pout/(Pout + Losses)
\`\`\`

## Applications

### Industrial Systems
- Motor sizing and selection
- Power distribution design
- Energy management

### Renewable Energy
- Solar panel calculations
- Wind turbine power curves
- Battery storage sizing

### Building Systems
- Lighting load calculations
- HVAC power requirements
- Emergency power sizing

## Safety Considerations

1. **Always de-energize** circuits before working
2. **Use proper PPE** for electrical work
3. **Follow lockout/tagout** procedures
4. **Verify calculations** before implementation
5. **Consider fault conditions** in design

## Common Mistakes

- Confusing real, reactive, and apparent power
- Incorrect three-phase calculations
- Ignoring power factor in sizing
- Using wrong voltage values (line vs. phase)

Mastering electrical power calculations is essential for safe and efficient electrical system design and operation.`,
      author: 'Electrical Engineering Team',
      publishedAt: '2024-01-26T16:45:00Z',
      updatedAt: '2024-01-26T16:45:00Z',
      tags: ['electrical', 'power', 'calculations', 'three-phase', 'motors'],
      category: 'Electrical Engineering',
      readTime: 9,
      featured: true
    }
  ]

  for (const article of articles) {
    await database.addArticle(article)
  }

  console.log(`Added ${articles.length} sample articles to the database!`)
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  addSampleArticles().catch(console.error)
}