"use client"

import { useState, useMemo } from "react"
import { X, Search, Calculator, Ruler } from "lucide-react"
import { Widget } from "@/app/preset/page"
import { categories } from "@/lib/converters-data"

interface WidgetSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (widget: Omit<Widget, "id" | "position">) => void
}

export function WidgetSearchDialog({ isOpen, onClose, onAddWidget }: WidgetSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const calculators = [
    {
      title: "Pump Affinity Laws Calculator",
      href: "/calculators/pump-affinity-calculator",
      type: "calculator" as const
    },
    {
      title: "Pump Power Calculator",
      href: "/calculators/pump-power-calculator",
      type: "calculator" as const
    },
    {
      title: "Suction Specific Speed Calculator",
      href: "/calculators/suction-specific-speed-calculator",
      type: "calculator" as const
    },
    {
      title: "Pump Specific Speed Calculator",
      href: "/calculators/pump-specific-speed-calculator",
      type: "calculator" as const
    },
    {
      title: "Pump Efficiency Calculator",
      href: "/calculators/pump-efficiency-calculator",
      type: "calculator" as const
    }
  ]

  const converters = categories
    .filter(cat => !cat.hidden)
    .map(cat => ({
      title: cat.name,
      href: `/converters/${cat.id}`,
      type: "converter" as const
    }))

  const allItems = [...calculators, ...converters]

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems
    const query = searchQuery.toLowerCase()
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query)
    )
  }, [searchQuery, allItems])

  const handleAdd = (item: typeof allItems[0]) => {
    onAddWidget({
      title: item.title,
      type: item.type,
      href: item.href
    })
    onClose()
    setSearchQuery("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Add Widget</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search calculators and converters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAdd(item)}
                  className="w-full flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left hover:bg-accent hover:border-primary/50 transition-colors"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    item.type === "calculator" ? "bg-blue-500/10" : "bg-green-500/10"
                  }`}>
                    {item.type === "calculator" ? (
                      <Calculator className={`h-5 w-5 ${
                        item.type === "calculator" ? "text-blue-500" : "text-green-500"
                      }`} />
                    ) : (
                      <Ruler className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
