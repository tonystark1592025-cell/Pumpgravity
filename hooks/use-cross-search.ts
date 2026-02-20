import { useMemo } from "react"
import { converters, categories } from "@/lib/converters-data"
import { Activity, Calculator, Power, Zap } from "lucide-react"

export interface SearchResult {
  title: string
  description: string
  href: string
  type: "calculator" | "converter"
  icon?: any
  color?: string
  bgColor?: string
  features?: string[]
}

const calculators = [
  {
    title: "Pump Affinity Laws Calculator",
    description: "Calculate pump performance changes based on speed or diameter variations using affinity laws.",
    icon: Activity,
    href: "/calculators/pump-affinity-calculator",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: ["Speed Changes", "Diameter Changes", "Flow, Head & Power"],
    keywords: ["pump", "affinity", "speed", "diameter", "flow", "head", "power", "performance"]
  },
  {
    title: "Pump Power Calculator",
    description: "Calculate shaft power required for pumps based on flow rate, head, specific gravity, and efficiency.",
    icon: Power,
    href: "/calculators/pump-power-calculator",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: ["Shaft Power", "Flow Rate", "Differential Head"],
    keywords: ["pump", "power", "shaft", "flow", "head", "gravity", "efficiency", "hydraulic"]
  },
  {
    title: "Suction Specific Speed Calculator",
    description: "Calculate suction specific speed (Nss) to evaluate pump cavitation performance and NPSH requirements.",
    icon: Activity,
    href: "/calculators/suction-specific-speed-calculator",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: ["Suction Speed", "NPSH Required", "Cavitation Analysis"],
    keywords: ["pump", "suction", "specific", "speed", "nss", "npsh", "cavitation", "performance"]
  },
  {
    title: "Pump Specific Speed Calculator",
    description: "Calculate pump specific speed (Ns) to determine pump type and optimal operating characteristics.",
    icon: Zap,
    href: "/calculators/pump-specific-speed-calculator",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    features: ["Specific Speed", "Pump Type", "Performance"],
    keywords: ["pump", "specific", "speed", "ns", "type", "classification", "performance", "characteristics"]
  },
  {
    title: "Pump Efficiency Calculator",
    description: "Calculate pump efficiency based on flow rate, head, specific gravity, and shaft power input.",
    icon: Calculator,
    href: "/calculators/pump-efficiency-calculator",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    features: ["Efficiency", "Performance", "Energy Analysis"],
    keywords: ["pump", "efficiency", "performance", "energy", "shaft", "power", "hydraulic", "analysis"]
  }
]

export function useCrossSearch(searchQuery: string, currentPage: "calculator" | "converter") {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        primaryResults: [],
        crossResults: [],
        showCrossResults: false
      }
    }

    const query = searchQuery.toLowerCase()

    // Search calculators
    const calculatorResults = calculators
      .filter(calc => {
        return (
          calc.title.toLowerCase().includes(query) ||
          calc.description.toLowerCase().includes(query) ||
          calc.features.some(feature => feature.toLowerCase().includes(query)) ||
          calc.keywords.some(keyword => keyword.toLowerCase().includes(query))
        )
      })
      .map(calc => ({
        ...calc,
        type: "calculator" as const
      }))

    // Search converters
    const matchingConverters = converters.filter(converter => {
      return (
        converter.name.toLowerCase().includes(query) ||
        converter.about.toLowerCase().includes(query) ||
        converter.category.toLowerCase().includes(query) ||
        converter.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        converter.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
        converter.units.some(unit => 
          unit.label.toLowerCase().includes(query) || 
          unit.value.toLowerCase().includes(query)
        )
      )
    })

    const matchingCategoryIds = new Set(matchingConverters.map(c => c.category))
    const converterResults = categories
      .filter(cat => {
        if (cat.id === "all" || cat.hidden) return false
        return (
          cat.name.toLowerCase().includes(query) ||
          cat.description.toLowerCase().includes(query) ||
          matchingCategoryIds.has(cat.id)
        )
      })
      .map(cat => ({
        title: cat.name,
        description: cat.description,
        href: `/converters/${cat.id}`,
        type: "converter" as const,
        icon: cat.icon,
        color: cat.color,
        bgColor: cat.bgColor
      }))

    // Determine primary and cross results based on current page
    const primaryResults = currentPage === "calculator" ? calculatorResults : converterResults
    const crossResults = currentPage === "calculator" ? converterResults : calculatorResults
    const showCrossResults = primaryResults.length === 0 && crossResults.length > 0

    return {
      primaryResults,
      crossResults,
      showCrossResults,
      primaryType: currentPage,
      crossType: currentPage === "calculator" ? "converter" : "calculator"
    }
  }, [searchQuery, currentPage])
}
