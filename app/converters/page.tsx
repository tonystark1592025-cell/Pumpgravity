"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { Ruler } from "lucide-react"
import { categories, converters } from "@/lib/converters-data"
import { useState, useMemo } from "react"
import { useCrossSearch } from "@/hooks/use-cross-search"
import { CrossSearchResults } from "@/components/cross-search-results"

export default function ConvertersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { primaryResults, crossResults, showCrossResults, crossType } = useCrossSearch(searchQuery, "converter")

  // Define pump-related and other categories
  const pumpCategoryIds = ['head', 'npsh', 'suction-pressure', 'vapour-pressure', 'flow', 'viscosity', 'power', 'pressure']
  
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      // Filter out hidden categories when no search query
      return categories.filter(cat => !cat.hidden)
    }

    // Use primary results from cross-search
    return primaryResults
  }, [searchQuery, primaryResults])

  // Split categories into pump and others when not searching
  const pumpCategories = useMemo(() => {
    if (searchQuery.trim()) return []
    return filteredCategories.filter(cat => pumpCategoryIds.includes(cat.id))
  }, [filteredCategories, searchQuery])

  const otherCategories = useMemo(() => {
    if (searchQuery.trim()) return []
    return filteredCategories.filter(cat => !pumpCategoryIds.includes(cat.id))
  }, [filteredCategories, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ruler className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Unit Converters</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Professional unit converters for engineering, science, and everyday use
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <SearchBar
              placeholder="Search converters... (e.g., temperature, kg, meter, pressure)"
              onSearch={setSearchQuery}
            />
          </div>

          {/* Category Grid */}
          {searchQuery.trim() ? (
            // Search results view
            filteredCategories.length > 0 ? (
              <>
                {/* Section label for primary results when searching */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Ruler className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Results from Converters
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Found {filteredCategories.length} {filteredCategories.length === 1 ? "match" : "matches"} in converters
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.id}
                        href={`/converters/${cat.id}`}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.bgColor}`}>
                            <Icon className={`h-6 w-6 ${cat.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {cat.name}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                      </Link>
                    )
                  })}
                </div>
                
                {/* Show cross-search results if available */}
                {crossResults.length > 0 && (
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
                  <p className="text-muted-foreground text-lg">No converters found for "{searchQuery}"</p>
                  <p className="text-muted-foreground text-sm mt-2">Showing results from calculators instead</p>
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
                <p className="text-muted-foreground text-sm mt-2">Try searching for units like "kg", "meter", "celsius", or categories like "temperature"</p>
              </div>
            )
          ) : (
            // Default view with sections
            <>
              {/* Pump Conversions Section */}
              {pumpCategories.length > 0 && (
                <div className="mb-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Pump Conversions</h2>
                    <p className="text-sm text-muted-foreground mt-1">Essential unit converters for pump engineering and hydraulic systems</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pumpCategories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Link
                          key={cat.id}
                          href={`/converters/${cat.id}`}
                          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 text-left"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.bgColor}`}>
                              <Icon className={`h-6 w-6 ${cat.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {cat.name}
                              </h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {cat.description}
                              </p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Others Section */}
              {otherCategories.length > 0 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Others</h2>
                    <p className="text-sm text-muted-foreground mt-1">General unit converters for various engineering and scientific applications</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {otherCategories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Link
                          key={cat.id}
                          href={`/converters/${cat.id}`}
                          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 text-left"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.bgColor}`}>
                              <Icon className={`h-6 w-6 ${cat.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {cat.name}
                              </h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {cat.description}
                              </p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
