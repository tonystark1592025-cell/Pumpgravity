"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Send,
  FlaskConical,
  Wrench,
  HardHat,
  ChefHat,
  Dumbbell,
  CircleDot,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const domains = [
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "engineering", label: "Engineering", icon: Wrench },
  { id: "construction", label: "Construction", icon: HardHat },
  { id: "cooking", label: "Cooking", icon: ChefHat },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "general", label: "General", icon: CircleDot },
]

const exampleQueries = [
  "Convert 2.5 M NaCl solution to ppm with density correction",
  "What is the pressure at Mount Everest summit in various units?",
  "Room temperature 25°C to Kelvin, Rankine, and Fahrenheit",
  "Convert 150 horsepower to kilowatts and BTU per hour",
  "How many liters in 5 gallons?",
  "Convert 100 psi to bar and atmospheres",
]

interface Message {
  role: "user" | "assistant"
  content: string
}

function AIChatContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("science")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    const q = searchParams.get("q")
    const domain = searchParams.get("domain")
    if (q) {
      setQuery(q)
      if (domain) setSelectedDomain(domain)
      handleSubmit(q, domain || "science")
    }
  }, [searchParams])

  const simulateAIResponse = (userQuery: string, domain: string): string => {
    const lowerQuery = userQuery.toLowerCase()

    if (lowerQuery.includes("nacl") || lowerQuery.includes("ppm")) {
      return `**Conversion Result: NaCl Solution to PPM**

Based on your query about converting 2.5 M NaCl solution:

**Input:** 2.5 M (Molar) NaCl solution

**Calculations:**
- Molecular weight of NaCl: 58.44 g/mol
- Mass concentration: 2.5 mol/L × 58.44 g/mol = **146.1 g/L**
- Assuming density ≈ 1.096 g/mL (for 2.5M NaCl)
- PPM = (146.1 g/L) / (1.096 g/mL × 1000) × 10⁶

**Result:** 
- **133,303 ppm** (parts per million)
- **13.33%** (w/w percentage)

*Note: The density correction factor is important for concentrated solutions. For dilute solutions, you can assume density ≈ 1 g/mL.*`
    }

    if (lowerQuery.includes("everest") || lowerQuery.includes("pressure")) {
      return `**Pressure at Mount Everest Summit**

**Altitude:** 8,849 meters (29,032 feet)

**Atmospheric Pressure Conversions:**

| Unit | Value |
|------|-------|
| **Kilopascals (kPa)** | 33.7 kPa |
| **Hectopascals (hPa)** | 337 hPa |
| **Atmospheres (atm)** | 0.333 atm |
| **PSI** | 4.89 psi |
| **Bar** | 0.337 bar |
| **mmHg (Torr)** | 253 mmHg |
| **inHg** | 9.96 inHg |

*This is approximately 1/3 of sea level pressure (101.325 kPa), which is why supplemental oxygen is often required.*`
    }

    if (lowerQuery.includes("temperature") || lowerQuery.includes("25°c") || lowerQuery.includes("celsius")) {
      return `**Temperature Conversion: 25°C**

**Starting Value:** 25°C (Room Temperature)

**Converted Values:**

| Scale | Value | Formula |
|-------|-------|---------|
| **Celsius** | 25°C | (base) |
| **Fahrenheit** | 77°F | (C × 9/5) + 32 |
| **Kelvin** | 298.15 K | C + 273.15 |
| **Rankine** | 536.67°R | (C + 273.15) × 9/5 |

**Quick Reference:**
- Kelvin is commonly used in scientific calculations
- Rankine is used in some engineering applications (US)
- 25°C is often considered standard room temperature`
    }

    if (lowerQuery.includes("horsepower") || lowerQuery.includes("hp")) {
      return `**Power Conversion: 150 Horsepower**

**Input:** 150 hp (Mechanical Horsepower)

**Converted Values:**

| Unit | Value |
|------|-------|
| **Kilowatts (kW)** | 111.86 kW |
| **Watts (W)** | 111,855 W |
| **BTU/hour** | 381,710 BTU/h |
| **Metric HP** | 152.1 hp (metric) |
| **Foot-pounds/second** | 82,500 ft·lb/s |

*Note: 1 mechanical horsepower = 745.7 watts*`
    }

    if (lowerQuery.includes("gallon") || lowerQuery.includes("liter")) {
      return `**Volume Conversion: Gallons to Liters**

**Input:** 5 US Gallons

**Result:** **18.927 Liters**

**Additional Conversions:**
| Unit | Value |
|------|-------|
| **Milliliters** | 18,927 mL |
| **Cubic meters** | 0.01893 m³ |
| **Imperial gallons** | 4.16 gal (UK) |
| **Quarts** | 20 qt |
| **Pints** | 40 pt |

*Conversion factor: 1 US gallon = 3.78541 liters*`
    }

    if (lowerQuery.includes("psi") || lowerQuery.includes("bar") || lowerQuery.includes("atmosphere")) {
      return `**Pressure Conversion: 100 PSI**

**Input:** 100 PSI (Pounds per Square Inch)

**Converted Values:**

| Unit | Value |
|------|-------|
| **Bar** | 6.895 bar |
| **Atmospheres** | 6.805 atm |
| **Kilopascals** | 689.5 kPa |
| **Pascals** | 689,476 Pa |
| **mmHg** | 5,171 mmHg |

*Note: 1 PSI = 6,894.76 Pa = 0.06895 bar*`
    }

    return `**Conversion Analysis**

I've analyzed your query in the **${domain}** domain.

Based on your request: "${userQuery}"

**Processing your conversion...**

To provide the most accurate result, please specify:
1. The exact value you want to convert
2. The source unit
3. The target unit(s)

**Example formats:**
- "Convert 100 meters to feet"
- "What is 25°C in Fahrenheit?"
- "How many grams in 2 pounds?"

*Tip: You can also ask for multiple unit conversions at once!*`
  }

  const handleSubmit = (queryText?: string, domain?: string) => {
    const finalQuery = queryText || query
    const finalDomain = domain || selectedDomain

    if (!finalQuery.trim()) return

    const userMessage: Message = { role: "user", content: finalQuery }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setQuery("")

    setTimeout(() => {
      const response = simulateAIResponse(finalQuery, finalDomain)
      const assistantMessage: Message = { role: "assistant", content: response }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const resetChat = () => {
    setMessages([])
    setQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-32">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Unit Converter</h1>
                <p className="text-sm text-muted-foreground">
                  Natural language conversions powered by AI
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetChat}
                className="gap-2 border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Domain Selection */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-muted-foreground">Select Domain:</p>
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

          {/* Chat Messages */}
          {messages.length === 0 ? (
            <div className="mb-8">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  How can I help you convert today?
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Ask me anything about unit conversions in natural language
                </p>

                {/* Example Queries */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {exampleQueries.map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example)
                        handleSubmit(example, selectedDomain)
                      }}
                      className="rounded-lg border border-border bg-secondary/50 p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl p-4",
                    message.role === "user"
                      ? "border border-border bg-secondary ml-auto max-w-[85%]"
                      : "border border-primary/20 bg-card"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Sparkles className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
                      </div>
                      <button
                        onClick={() => copyMessage(index, message.content)}
                        className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        {copied === index ? (
                          <Check className="h-4 w-4 text-accent" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                  <div
                    className={cn(
                      "prose prose-invert max-w-none text-sm",
                      message.role === "user" && "text-foreground"
                    )}
                  >
                    {message.content.split("\n").map((line, i) => (
                      <p key={i} className={cn("my-1", line.startsWith("**") && "font-semibold")}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-card p-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Processing your conversion...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Input at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative">
              <Textarea
                placeholder="Describe your conversion... e.g., 'Convert 100 meters to feet'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                className="min-h-[60px] resize-none border-border bg-secondary pr-14 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                onClick={() => handleSubmit()}
                disabled={isLoading || !query.trim()}
                className="absolute bottom-3 right-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              You have 3 free AI conversions left today.{" "}
              <button className="text-primary hover:underline">Sign in</button> for unlimited access.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AIChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <AIChatContent />
    </Suspense>
  )
}
