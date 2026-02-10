"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Send, FlaskConical, Wrench, HardHat, ChefHat, Dumbbell, CircleDot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const domains = [
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "engineering", label: "Engineering", icon: Wrench },
  { id: "construction", label: "Construction", icon: HardHat },
  { id: "cooking", label: "Cooking", icon: ChefHat },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "general", label: "General", icon: CircleDot },
]

const examples = [
  "Convert 2.5 M NaCl solution to ppm with density correction",
  "Calculate pressure drop across a 10m pipe with 0.1m diameter", 
  "What is the Reynolds number for water at 20°C in a 5cm pipe?",
]

interface AIChatWidgetProps {
  variant?: "default" | "compact"
}

export function AIChatWidget({ variant = "default" }: AIChatWidgetProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("science")
  const [activeTab, setActiveTab] = useState("convert")

  const handleSubmit = () => {
    if (query.trim()) {
      const params = new URLSearchParams({
        q: query,
        domain: selectedDomain,
      })
      router.push(`/ai-chat?${params.toString()}`)
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-border bg-gradient-to-b from-card to-card/50 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">AI Converter</span>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Describe your conversion..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px] resize-none border-border bg-secondary pr-12 text-foreground placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            className="absolute bottom-3 right-3 h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 shadow-xl shadow-primary/5 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">Intelligent Unit Converter</h3>
              <p className="text-sm text-muted-foreground">
                Context-aware &bull; Smart validation &bull; Visual comparisons &bull; Batch processing
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-secondary p-1">
            {["convert", "features", "domains"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 rounded-md py-2.5 text-sm font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Domain Selection */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Your Domain:</p>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => {
                const Icon = domain.icon
                return (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      selectedDomain === domain.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {domain.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Input */}
          <div className="relative mb-6">
            <Textarea
              placeholder='Smart science conversions... e.g., "Convert 2.5 M NaCl solution to ppm with density correction"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none border-border bg-secondary pr-14 text-lg text-foreground placeholder:text-muted-foreground sm:min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              className="absolute bottom-4 right-4 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Info Banner
          <div className="mb-6 rounded-lg bg-secondary/50 px-5 py-3 text-sm text-muted-foreground">
            You have 3 free AI conversions left today!{" "}
            <button className="text-primary underline hover:text-primary/80">Sign in</button> for more conversions and advanced features.
          </div> */}

          {/* Examples */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Try science examples:</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="rounded-lg bg-secondary px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
