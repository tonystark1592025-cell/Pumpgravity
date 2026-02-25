"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, GripVertical, Calculator, Ruler, ExternalLink, Maximize2 } from "lucide-react"
import { Widget } from "@/app/preset/page"
import Link from "next/link"
import { PumpPowerCalculatorWidget } from "./onlyui/pump-power-calculator-widget"
import { PumpEfficiencyCalculatorWidget } from "./onlyui/pump-efficiency-calculator-widget"
import { PumpSpecificSpeedCalculatorWidget } from "./onlyui/pump-specific-speed-calculator-widget"
import { ConverterWidget } from "./onlyui/converter-widget"

interface DraggableWidgetProps {
  widget: Widget
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void
  onRemove: (id: string) => void
}

export function DraggableWidget({ widget, onUpdatePosition, onRemove }: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button, input, select")) return
    
    setIsDragging(true)
    const rect = widgetRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = widgetRef.current?.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      // Constrain to container bounds
      const maxX = containerRect.width - (widgetRef.current?.offsetWidth || 0)
      const maxY = containerRect.height - (widgetRef.current?.offsetHeight || 0)

      onUpdatePosition(widget.id, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, widget.id, onUpdatePosition])

  // Render calculator widget based on type
  const renderCalculatorWidget = () => {
    if (widget.type !== "calculator") return null
    
    if (widget.href.includes("pump-power-calculator")) {
      return <PumpPowerCalculatorWidget />
    } else if (widget.href.includes("pump-efficiency-calculator")) {
      return <PumpEfficiencyCalculatorWidget />
    } else if (widget.href.includes("pump-specific-speed-calculator")) {
      return <PumpSpecificSpeedCalculatorWidget />
    }
    
    // For calculators without widgets yet, return null to show the link
    return null
  }

  // Render converter widget
  const renderConverterWidget = () => {
    if (widget.type !== "converter") return null
    
    // Extract category ID from href like "/converters/temperature"
    const categoryId = widget.href.split("/converters/")[1]
    if (!categoryId) return null
    
    return <ConverterWidget categoryId={categoryId} />
  }

  const hasCalculatorWidget = widget.type === "calculator" && (
    widget.href.includes("pump-power-calculator") ||
    widget.href.includes("pump-efficiency-calculator") ||
    widget.href.includes("pump-specific-speed-calculator")
  )

  const hasConverterWidget = widget.type === "converter"
  const hasEmbeddedWidget = hasCalculatorWidget || hasConverterWidget

  return (
    <div
      ref={widgetRef}
      className={`absolute rounded-xl border border-border bg-card shadow-lg transition-shadow overflow-visible ${
        isDragging ? "shadow-2xl cursor-grabbing" : "cursor-grab hover:shadow-xl"
      }`}
      style={{
        left: `${widget.position.x}px`,
        top: `${widget.position.y}px`,
        width: hasEmbeddedWidget ? "320px" : "280px",
        userSelect: "none"
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 p-2 cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          widget.type === "calculator" ? "bg-blue-500/10" : "bg-green-500/10"
        }`}>
          {widget.type === "calculator" ? (
            <Calculator className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <Ruler className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">{widget.title}</div>
        </div>
        <Link
          href={widget.href}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Open full page"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(widget.id)
          }}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="cursor-auto overflow-visible" onClick={(e) => e.stopPropagation()}>
        {hasCalculatorWidget ? (
          renderCalculatorWidget()
        ) : hasConverterWidget ? (
          renderConverterWidget()
        ) : (
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3 capitalize">{widget.type}</p>
            <Link
              href={widget.href}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Open
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
