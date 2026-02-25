"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Trash2, GripVertical } from "lucide-react"
import { DraggableWidget } from "@/components/draggable-widget"
import { WidgetSearchDialog } from "@/components/widget-search-dialog"

export interface Widget {
  id: string
  title: string
  type: "calculator" | "converter"
  href: string
  position: { x: number; y: number }
}

export default function PresetPage() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Load widgets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preset-widgets")
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load widgets:", e)
      }
    }
  }, [])

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    if (widgets.length > 0 || localStorage.getItem("preset-widgets")) {
      localStorage.setItem("preset-widgets", JSON.stringify(widgets))
    }
  }, [widgets])

  const handleAddWidget = (widget: Omit<Widget, "id" | "position">) => {
    const newWidget: Widget = {
      ...widget,
      id: `${widget.type}-${Date.now()}-${Math.random()}`,
      position: { x: 100, y: 100 }
    }
    setWidgets([...widgets, newWidget])
  }

  const handleUpdatePosition = (id: string, position: { x: number; y: number }) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, position } : w))
  }

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative min-h-[calc(100vh-200px)]">
        {/* Dot pattern background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            color: "hsl(var(--muted-foreground) / 0.2)"
          }}
        />

        {/* Content */}
        <div className="relative">
          {/* Top bar */}
          <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">My Preset</h1>
                  <p className="text-sm text-muted-foreground">
                    Add and arrange your favorite calculators and converters
                  </p>
                </div>
                
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Add Widget
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative min-h-[calc(100vh-300px)] p-4">
            {widgets.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Your whiteboard is empty
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Click "Add Widget" to start adding calculators and converters to your custom workspace
                  </p>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Add Your First Widget
                  </button>
                </div>
              </div>
            ) : (
              widgets.map(widget => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onUpdatePosition={handleUpdatePosition}
                  onRemove={handleRemoveWidget}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <WidgetSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  )
}
