"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { Calculator, Activity, Zap, Power } from "lucide-react"
import { useState } from "react"
import { useCrossSearch } from "@/hooks/use-cross-search"
import { CrossSearchResults } from "@/components/cross-search-results"

export default function CalculatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

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

  const { primaryResults, crossResults, showCrossResults, crossType } = useCrossSearch(searchQuery, "calculator")
  
  const filteredCalculators = searchQuery.trim() ? primaryResults : calculators

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Engineering Calculators</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Professional engineering calculators for pump systems, fluid dynamics, and more
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <SearchBar
              placeholder="Search calculators... (e.g., pump, power, flow, affinity)"
              onSearch={setSearchQuery}
            />
          </div>

          {/* Calculator Grid */}
          {filteredCalculators.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCalculators.map((calc) => {
                  const Icon = calc.icon
                  return (
                    <Link
                      key={calc.href}
                      href={calc.href}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${calc.bgColor}`}>
                          <Icon className={`h-6 w-6 ${calc.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {calc.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {calc.description}
                          </p>
                          {calc.features && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {calc.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                    </Link>
                  )
                })}
              </div>
              
              {/* Show cross-search results if available */}
              {crossResults.length > 0 && searchQuery.trim() && (
                <CrossSearchResults 
                  results={crossResults} 
                  type={crossType as "calculator" | "converter"}
                  searchQuery={searchQuery}
                />
              )}
            </>
          ) : showCrossResults ? (
            <>
              <div className="text-center py-8 mb-8 rounded-xl border border-dashed border-border bg-muted/30">
                <p className="text-muted-foreground text-lg">No calculators found for "{searchQuery}"</p>
                <p className="text-muted-foreground text-sm mt-2">Showing results from converters instead</p>
              </div>
              <CrossSearchResults 
                results={crossResults} 
                type={crossType as "calculator" | "converter"}
                searchQuery={searchQuery}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No results found for "{searchQuery}"</p>
              <p className="text-muted-foreground text-sm mt-2">Try searching for "pump", "power", "flow", or "affinity"</p>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Zap className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">More Calculators Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're working on adding more engineering and scientific calculators
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
