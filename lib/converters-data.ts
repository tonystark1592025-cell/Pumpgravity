import { Ruler, Weight, Square, Droplet, Thermometer, Clock, Gauge, Zap, Power, HardDrive, Bolt, Cog, Wind, Lightbulb, MoreHorizontal, LucideIcon } from "lucide-react"

export interface UnitConfig {
  value: string
  label: string
  factor: number
}

export interface ConverterConfig {
  id: string
  name: string
  category: string
  units: UnitConfig[]
  baseUnit: string
  formula?: string
  about: string
  tags?: string[]
  keywords?: string[]
}

export interface CategoryConfig {
  id: string
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
  hidden?: boolean
}

export const categories: CategoryConfig[] = [
  { id: "mass", name: "Mass", icon: Weight, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "Convert weight and mass units like kg, lb, oz" },
  { id: "length", name: "Length", icon: Ruler, color: "text-green-500", bgColor: "bg-green-500/10", description: "Convert distance and length units like m, ft, mi" },
  { id: "area", name: "Area", icon: Square, color: "text-yellow-500", bgColor: "bg-yellow-500/10", description: "Convert area units like m², acre, hectare" },
  { id: "volume", name: "Volume", icon: Droplet, color: "text-cyan-500", bgColor: "bg-cyan-500/10", description: "Convert volume units like L, gal, m³" },
  { id: "temperature", name: "Temperature", icon: Thermometer, color: "text-red-500", bgColor: "bg-red-500/10", description: "Convert temperature units like °C, °F, K" },
  { id: "time", name: "Time", icon: Clock, color: "text-indigo-500", bgColor: "bg-indigo-500/10", description: "Convert time units like s, min, hr, day", hidden: true },
  { id: "speed", name: "Speed", icon: Gauge, color: "text-orange-500", bgColor: "bg-orange-500/10", description: "Convert speed units like km/h, mph, m/s" },
  { id: "pressure", name: "Pressure", icon: Gauge, color: "text-pink-500", bgColor: "bg-pink-500/10", description: "Convert pressure units like Pa, bar, psi" },
  { id: "energy", name: "Energy", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10", description: "Convert energy units like J, kWh, cal", hidden: true },
  { id: "power", name: "Power", icon: Power, color: "text-lime-500", bgColor: "bg-lime-500/10", description: "Convert power units like W, kW, hp" },
  { id: "digital", name: "Digital", icon: HardDrive, color: "text-teal-500", bgColor: "bg-teal-500/10", description: "Convert digital storage units like KB, MB, GB", hidden: true },
  { id: "electrical", name: "Electrical", icon: Bolt, color: "text-violet-500", bgColor: "bg-violet-500/10", description: "Convert electrical units like A, V, VAR" },
  { id: "mechanics", name: "Mechanics", icon: Cog, color: "text-slate-500", bgColor: "bg-slate-500/10", description: "Convert mechanical units like N, torque, density", hidden: true },
  { id: "flow", name: "Flow & Rate", icon: Wind, color: "text-sky-500", bgColor: "bg-sky-500/10", description: "Convert flow rate units like m³/s, gpm, cfm" },
  { id: "light", name: "Light & Optics", icon: Lightbulb, color: "text-yellow-400", bgColor: "bg-yellow-400/10", description: "Convert light units like lux, dpi, resolution", hidden: true },
]

export const converters: ConverterConfig[] = [
  {
    id: "mass",
    name: "Mass Converter",
    category: "mass",
    baseUnit: "gram",
    about: "Convert between different mass and weight units including metric (microgram, milligram, gram, kilogram, metric ton) and imperial (ounce, pound) systems. Perfect for cooking, shipping, science, and everyday weight measurements.",
    tags: ["mg", "g", "kg", "lb", "oz", "ton"],
    keywords: ["weight", "mass", "kilogram", "pound", "gram", "ounce", "metric", "imperial"],
    units: [
      { value: "mcg", label: "Microgram", factor: 0.000001 },
      { value: "mg", label: "Milligram", factor: 0.001 },
      { value: "g", label: "Gram", factor: 1 },
      { value: "kg", label: "Kilogram", factor: 1000 },
      { value: "lb", label: "Pound", factor: 453.592 },
      { value: "oz", label: "Ounce", factor: 28.3495 },
      { value: "ton", label: "Metric Ton", factor: 1000000 },
    ],
  },
  {
    id: "length",
    name: "Length Converter",
    category: "length",
    baseUnit: "meter",
    about: "Convert between length and distance units including millimeter, centimeter, meter, kilometer, inch, foot, yard, mile, and nautical mile. Useful for construction, travel, sports, and engineering applications.",
    units: [
      { value: "mm", label: "Millimeter", factor: 0.001 },
      { value: "cm", label: "Centimeter", factor: 0.01 },
      { value: "m", label: "Meter", factor: 1 },
      { value: "km", label: "Kilometer", factor: 1000 },
      { value: "in", label: "Inch", factor: 0.0254 },
      { value: "ft", label: "Foot", factor: 0.3048 },
      { value: "yd", label: "Yard", factor: 0.9144 },
      { value: "mi", label: "Mile", factor: 1609.34 },
      { value: "nmi", label: "Nautical Mile", factor: 1852 },
    ],
  },
  {
    id: "area",
    name: "Area Converter",
    category: "area",
    baseUnit: "square meter",
    about: "Convert between area units including square millimeter, square centimeter, square meter, square kilometer, acre, hectare, and square foot. Essential for real estate, land measurement, and property calculations.",
    units: [
      { value: "mm²", label: "Square Millimeter", factor: 0.000001 },
      { value: "cm²", label: "Square Centimeter", factor: 0.0001 },
      { value: "m²", label: "Square Meter", factor: 1 },
      { value: "km²", label: "Square Kilometer", factor: 1000000 },
      { value: "acre", label: "Acre", factor: 4046.86 },
      { value: "ha", label: "Hectare", factor: 10000 },
      { value: "ft²", label: "Square Foot", factor: 0.092903 },
    ],
  },
  {
    id: "volume",
    name: "Volume Converter",
    category: "volume",
    baseUnit: "liter",
    about: "Convert between volume and capacity units including milliliter, liter, cubic meter, gallon, quart, pint, cup, and fluid ounce. Perfect for cooking, chemistry, and liquid measurements.",
    units: [
      { value: "ml", label: "Milliliter", factor: 0.001 },
      { value: "L", label: "Liter", factor: 1 },
      { value: "m³", label: "Cubic Meter", factor: 1000 },
      { value: "gal", label: "Gallon (US)", factor: 3.78541 },
      { value: "qt", label: "Quart", factor: 0.946353 },
      { value: "pt", label: "Pint", factor: 0.473176 },
      { value: "cup", label: "Cup", factor: 0.236588 },
      { value: "fl oz", label: "Fluid Ounce", factor: 0.0295735 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature Converter",
    category: "temperature",
    baseUnit: "celsius",
    formula: "special",
    about: "Convert between temperature scales including Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R). Essential for weather, cooking, science, and engineering applications worldwide.",
    units: [
      { value: "C", label: "Celsius", factor: 1 },
      { value: "F", label: "Fahrenheit", factor: 1 },
      { value: "K", label: "Kelvin", factor: 1 },
      { value: "R", label: "Rankine", factor: 1 },
    ],
  },
  {
    id: "time",
    name: "Time Converter",
    category: "time",
    baseUnit: "second",
    about: "Convert between time units including millisecond, second, minute, hour, day, week, month, year, and decade. Useful for project planning, scheduling, and time calculations.",
    units: [
      { value: "ms", label: "Millisecond", factor: 0.001 },
      { value: "s", label: "Second", factor: 1 },
      { value: "min", label: "Minute", factor: 60 },
      { value: "hr", label: "Hour", factor: 3600 },
      { value: "day", label: "Day", factor: 86400 },
      { value: "week", label: "Week", factor: 604800 },
      { value: "month", label: "Month", factor: 2628000 },
      { value: "year", label: "Year", factor: 31536000 },
      { value: "decade", label: "Decade", factor: 315360000 },
    ],
  },
  {
    id: "digital",
    name: "Digital Storage Converter",
    category: "digital",
    baseUnit: "byte",
    about: "Convert between digital storage units including bit, byte, kilobyte (KB), megabyte (MB), gigabyte (GB), and terabyte (TB). Essential for computing, file sizes, and data storage calculations.",
    units: [
      { value: "bit", label: "Bit", factor: 0.125 },
      { value: "B", label: "Byte", factor: 1 },
      { value: "KB", label: "Kilobyte", factor: 1024 },
      { value: "MB", label: "Megabyte", factor: 1048576 },
      { value: "GB", label: "Gigabyte", factor: 1073741824 },
      { value: "TB", label: "Terabyte", factor: 1099511627776 },
    ],
  },
  {
    id: "speed",
    name: "Speed Converter",
    category: "speed",
    baseUnit: "meter per second",
    about: "Convert between speed and velocity units including meters per second (m/s), kilometers per hour (km/h), miles per hour (mph), knot, and feet per second. Perfect for vehicles, wind speed, and physics calculations.",
    units: [
      { value: "m/s", label: "Meters per Second", factor: 1 },
      { value: "km/h", label: "Kilometers per Hour", factor: 0.277778 },
      { value: "mph", label: "Miles per Hour", factor: 0.44704 },
      { value: "knot", label: "Knot", factor: 0.514444 },
      { value: "ft/s", label: "Feet per Second", factor: 0.3048 },
    ],
  },
  {
    id: "pressure",
    name: "Pressure Converter",
    category: "pressure",
    baseUnit: "pascal",
    about: "Convert between pressure units including pascal (Pa), kilopascal (kPa), bar, PSI, and atmosphere (atm). Essential for tire pressure, weather, engineering, and scientific applications.",
    units: [
      { value: "Pa", label: "Pascal", factor: 1 },
      { value: "kPa", label: "Kilopascal", factor: 1000 },
      { value: "bar", label: "Bar", factor: 100000 },
      { value: "psi", label: "PSI", factor: 6894.76 },
      { value: "atm", label: "Atmosphere", factor: 101325 },
    ],
  },
  {
    id: "energy",
    name: "Energy Converter",
    category: "energy",
    baseUnit: "joule",
    about: "Convert between energy units including joule (J), kilojoule (kJ), calorie, kilocalorie, watt hour (Wh), and kilowatt hour (kWh). Useful for nutrition, electricity, and physics calculations.",
    units: [
      { value: "J", label: "Joule", factor: 1 },
      { value: "kJ", label: "Kilojoule", factor: 1000 },
      { value: "cal", label: "Calorie", factor: 4.184 },
      { value: "kcal", label: "Kilocalorie", factor: 4184 },
      { value: "Wh", label: "Watt Hour", factor: 3600 },
      { value: "kWh", label: "Kilowatt Hour", factor: 3600000 },
    ],
  },
  {
    id: "power",
    name: "Power Converter",
    category: "power",
    baseUnit: "watt",
    about: "Convert between power units including watt (W), kilowatt (kW), megawatt (MW), horsepower (hp), and BTU per hour. Essential for electrical systems, engines, and energy consumption calculations.",
    units: [
      { value: "W", label: "Watt", factor: 1 },
      { value: "kW", label: "Kilowatt", factor: 1000 },
      { value: "MW", label: "Megawatt", factor: 1000000 },
      { value: "hp", label: "Horsepower", factor: 745.7 },
      { value: "BTU/h", label: "BTU per Hour", factor: 0.293071 },
    ],
  },
  {
    id: "current",
    name: "Electric Current Converter",
    category: "electrical",
    baseUnit: "ampere",
    about: "Convert between electric current units including microampere (μA), milliampere (mA), ampere (A), and kiloampere (kA). Essential for electrical engineering and circuit design.",
    units: [
      { value: "μA", label: "Microampere", factor: 0.000001 },
      { value: "mA", label: "Milliampere", factor: 0.001 },
      { value: "A", label: "Ampere", factor: 1 },
      { value: "kA", label: "Kiloampere", factor: 1000 },
    ],
  },
  {
    id: "voltage",
    name: "Voltage Converter",
    category: "electrical",
    baseUnit: "volt",
    about: "Convert between voltage units including microvolt (μV), millivolt (mV), volt (V), and kilovolt (kV). Important for electrical systems, batteries, and power distribution.",
    units: [
      { value: "μV", label: "Microvolt", factor: 0.000001 },
      { value: "mV", label: "Millivolt", factor: 0.001 },
      { value: "V", label: "Volt", factor: 1 },
      { value: "kV", label: "Kilovolt", factor: 1000 },
    ],
  },
  {
    id: "reactive-power",
    name: "Reactive Power Converter",
    category: "electrical",
    baseUnit: "volt-ampere-reactive",
    about: "Convert between reactive power units including VAR, kVAR, and MVAR. Essential for AC electrical systems and power factor calculations.",
    units: [
      { value: "VAR", label: "Volt-Ampere Reactive", factor: 1 },
      { value: "kVAR", label: "Kilovolt-Ampere Reactive", factor: 1000 },
      { value: "MVAR", label: "Megavolt-Ampere Reactive", factor: 1000000 },
    ],
  },
  {
    id: "apparent-power",
    name: "Apparent Power Converter",
    category: "electrical",
    baseUnit: "volt-ampere",
    about: "Convert between apparent power units including VA, kVA, and MVA. Used in AC electrical systems for total power calculations.",
    units: [
      { value: "VA", label: "Volt-Ampere", factor: 1 },
      { value: "kVA", label: "Kilovolt-Ampere", factor: 1000 },
      { value: "MVA", label: "Megavolt-Ampere", factor: 1000000 },
    ],
  },
  {
    id: "reactive-energy",
    name: "Reactive Energy Converter",
    category: "electrical",
    baseUnit: "volt-ampere-reactive hour",
    about: "Convert between reactive energy units including VARh, kVARh, and MVARh. Important for electrical energy metering and billing.",
    units: [
      { value: "VARh", label: "Volt-Ampere Reactive Hour", factor: 1 },
      { value: "kVARh", label: "Kilovolt-Ampere Reactive Hour", factor: 1000 },
      { value: "MVARh", label: "Megavolt-Ampere Reactive Hour", factor: 1000000 },
    ],
  },
  {
    id: "flow-rate",
    name: "Volume Flow Rate Converter",
    category: "flow",
    baseUnit: "cubic meter per second",
    about: "Convert between volume flow rate units including cubic meters per second (m³/s), liters per second/minute, gallons per minute (GPM), and cubic feet per minute (CFM). Essential for pump systems, HVAC, and fluid dynamics.",
    units: [
      { value: "m³/s", label: "Cubic Meters per Second", factor: 1 },
      { value: "L/s", label: "Liters per Second", factor: 0.001 },
      { value: "L/min", label: "Liters per Minute", factor: 0.0000166667 },
      { value: "gpm", label: "Gallons per Minute", factor: 0.0000630902 },
      { value: "cfm", label: "Cubic Feet per Minute", factor: 0.000471947 },
    ],
  },
  {
    id: "illuminance",
    name: "Illuminance Converter",
    category: "light",
    baseUnit: "lux",
    about: "Convert between illuminance units including lux, foot-candle (fc), and phot. Used in lighting design, photography, and architectural applications.",
    units: [
      { value: "lux", label: "Lux", factor: 1 },
      { value: "fc", label: "Foot-candle", factor: 10.764 },
      { value: "phot", label: "Phot", factor: 10000 },
    ],
  },
  {
    id: "force",
    name: "Force Converter",
    category: "mechanics",
    baseUnit: "newton",
    about: "Convert between force units including newton (N), kilonewton (kN), pound-force (lbf), and kilogram-force (kgf). Essential for physics, engineering, and mechanical calculations.",
    units: [
      { value: "N", label: "Newton", factor: 1 },
      { value: "kN", label: "Kilonewton", factor: 1000 },
      { value: "lbf", label: "Pound-force", factor: 4.44822 },
      { value: "kgf", label: "Kilogram-force", factor: 9.80665 },
    ],
  },
  {
    id: "torque",
    name: "Torque Converter",
    category: "mechanics",
    baseUnit: "newton meter",
    about: "Convert between torque units including newton meter (N·m), pound-foot (lb·ft), kilogram centimeter (kg·cm), and ounce-inch. Important for automotive, machinery, and mechanical engineering.",
    units: [
      { value: "N·m", label: "Newton Meter", factor: 1 },
      { value: "lb·ft", label: "Pound-foot", factor: 1.35582 },
      { value: "kg·cm", label: "Kilogram Centimeter", factor: 0.0980665 },
      { value: "oz·in", label: "Ounce-inch", factor: 0.00706155 },
    ],
  },
  {
    id: "density",
    name: "Density Converter",
    category: "mechanics",
    baseUnit: "kilogram per cubic meter",
    about: "Convert between density units including kg/m³, g/cm³, lb/ft³, and lb/in³. Used in material science, engineering, and physics for mass-to-volume relationships.",
    units: [
      { value: "kg/m³", label: "Kilogram per Cubic Meter", factor: 1 },
      { value: "g/cm³", label: "Gram per Cubic Centimeter", factor: 1000 },
      { value: "lb/ft³", label: "Pound per Cubic Foot", factor: 16.0185 },
      { value: "lb/in³", label: "Pound per Cubic Inch", factor: 27679.9 },
    ],
  },
  {
    id: "acceleration",
    name: "Acceleration Converter",
    category: "mechanics",
    baseUnit: "meter per second squared",
    about: "Convert between acceleration units including m/s², standard gravity (g), ft/s², and gal. Essential for physics, automotive, and aerospace applications.",
    units: [
      { value: "m/s²", label: "Meter per Second Squared", factor: 1 },
      { value: "g", label: "Standard Gravity", factor: 9.80665 },
      { value: "ft/s²", label: "Foot per Second Squared", factor: 0.3048 },
      { value: "gal", label: "Gal", factor: 0.01 },
    ],
  },
  {
    id: "data-rate",
    name: "Data Transfer Rate Converter",
    category: "digital",
    baseUnit: "bits per second",
    about: "Convert between data transfer rate units including bps, kbps, Mbps, Gbps, and bytes per second. Essential for internet speed, network bandwidth, and download calculations.",
    units: [
      { value: "bps", label: "Bits per Second", factor: 1 },
      { value: "kbps", label: "Kilobits per Second", factor: 1000 },
      { value: "Mbps", label: "Megabits per Second", factor: 1000000 },
      { value: "Gbps", label: "Gigabits per Second", factor: 1000000000 },
      { value: "Bps", label: "Bytes per Second", factor: 8 },
      { value: "KBps", label: "Kilobytes per Second", factor: 8000 },
    ],
  },
  {
    id: "resolution",
    name: "Resolution Converter",
    category: "light",
    baseUnit: "dots per inch",
    about: "Convert between resolution units including DPI (dots per inch), PPI (pixels per inch), LPI (lines per inch), and dots per centimeter. Used in printing, displays, and image quality.",
    units: [
      { value: "dpi", label: "Dots per Inch", factor: 1 },
      { value: "ppi", label: "Pixels per Inch", factor: 1 },
      { value: "lpi", label: "Lines per Inch", factor: 1 },
      { value: "dpcm", label: "Dots per Centimeter", factor: 0.393701 },
    ],
  },
]
