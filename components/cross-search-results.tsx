"use client"

import Link from "next/link"
import { ArrowRight, Calculator, Ruler } from "lucide-react"
import { SearchResult } from "@/hooks/use-cross-search"

interface CrossSearchResultsProps {
  results: SearchResult[]
  type: "calculator" | "converter"
  searchQuery: string
}

export function CrossSearchResults({ results, type, searchQuery }: CrossSearchResultsProps) {
  const typeLabel = type === "calculator" ? "Calculators" : "Converters"
  const TypeIcon = type === "calculator" ? Calculator : Ruler

  return (
    <div className="mt-8 border-t border-border pt-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Results from {typeLabel}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Found {results.length} {results.length === 1 ? "match" : "matches"} in {typeLabel.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => {
          const Icon = result.icon
          return (
            <Link
              key={result.href}
              href={result.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="flex items-start gap-4">
                {Icon && (
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${result.bgColor}`}>
                    <Icon className={`h-6 w-6 ${result.color}`} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {result.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.description}
                  </p>
                  {result.features && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.features.map((feature) => (
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
    </div>
  )
}
