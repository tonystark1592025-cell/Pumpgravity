"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, AlertCircle, Calculator, ArrowRight, Activity, TrendingUp } from "lucide-react"

// --- Constants & Helpers ---

const lengthUnits = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
  { value: "in", label: "in" }
]

const convertToMm = (val: number, unit: string) => {
  if (unit === 'in') return val * 25.4
  if (unit === 'cm') return val * 10
  if (unit === 'm') return val * 1000
  return val
}

const convertFromMm = (val: number, unit: string) => {
  if (unit === 'in') return val / 25.4
  if (unit === 'cm') return val / 10
  if (unit === 'm') return val / 1000
  return val
}

export default function ImpellerDiameterCheckCalculator() {
  const { toast } = useToast()
  
  // Inputs
  const [dMin, setDMin] = useState<string>("475")
  const [dMinUnit, setDMinUnit] = useState<string>("mm")
  
  const [dRated, setDRated] = useState<string>("500")
  const [dRatedUnit, setDRatedUnit] = useState<string>("mm")
  
  const [dMax, setDMax] = useState<string>("525")
  const [dMaxUnit, setDMaxUnit] = useState<string>("mm")
  
  const [copied, setCopied] = useState(false)
  
  const [result, setResult] = useState<{
    calculated: boolean
    minLimit: number
    maxLimit: number
    marginMin: number
    marginMax: number
    isMet: boolean
    statusDetails: string
    // Graph Helpers
    rMax: number
    rRated: number
    rMin: number
  } | null>(null)

  // Auto-calculate on mount
  useEffect(() => { handleCalculate() }, [])

  const handleCalculate = () => {
    if (!dMin || !dRated || !dMax) return
    
    const dMinMm = convertToMm(parseFloat(dMin), dMinUnit)
    const dRatedMm = convertToMm(parseFloat(dRated), dRatedUnit)
    const dMaxMm = convertToMm(parseFloat(dMax), dMaxUnit)

    if (dMinMm >= dMaxMm) return 

    // API 610 Logic
    const minAllowableMm = dMinMm * 1.05
    const maxAllowableMm = dMaxMm * 0.95
    const marginAboveMin = ((dRatedMm - minAllowableMm) / minAllowableMm) * 100
    const marginBelowMax = ((maxAllowableMm - dRatedMm) / maxAllowableMm) * 100
    const isMet = (dRatedMm >= minAllowableMm) && (dRatedMm <= maxAllowableMm)

    // Graph Ratios
    const rRated = dRatedMm / dMaxMm
    const rMin = dMinMm / dMaxMm

    setResult({
      calculated: true,
      minLimit: convertFromMm(minAllowableMm, dRatedUnit),
      maxLimit: convertFromMm(maxAllowableMm, dRatedUnit),
      marginMin: marginAboveMin,
      marginMax: marginBelowMax,
      isMet,
      statusDetails: isMet 
        ? "API 610 Compliant"
        : dRatedMm > maxAllowableMm 
          ? "Exceeds Max Limit (>95%)"
          : "Below Min Limit (<105%)",
      rMax: 1,
      rRated,
      rMin
    })
  }

  const copyResult = () => {
    if (!result) return
    const text = `Impeller Check: ${result.isMet ? "PASS" : "FAIL"} | Rated: ${dRated} ${dRatedUnit}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied result" })
  }

  // --- SVG Graph Component ---
  const PumpCurveGraph = ({ rRated, rMin }: { rRated: number, rMin: number }) => {
    const w = 300
    const h = 180
    const pad = 30 
    const graphW = w - pad
    const graphH = h - pad
    
    const getPath = (r: number) => {
      const startY = graphH - (graphH * (r * r * 0.9)) 
      const startX = pad
      const endX = pad + (graphW * (r * 0.9)) 
      const endY = graphH
      const cpX = pad + (graphW * r * 0.4)
      const cpY = graphH - (graphH * r * r * 0.9)
      return `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`
    }

    return (
      <div className="relative w-full aspect-[16/9] bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-border overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)', 
          backgroundSize: '20px 20px',
          backgroundPosition: '30px 0'
        }}></div>

        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="relative z-10 overflow-visible">
          {/* Axes */}
          <line x1={pad} y1={0} x2={pad} y2={graphH} stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
          <line x1={pad} y1={graphH} x2={w} y2={graphH} stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
          
          {/* Labels */}
          <text x={10} y={graphH / 2} transform={`rotate(-90 10 ${graphH / 2})`} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold tracking-widest">HEAD</text>
          <text x={w / 2} y={h - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold tracking-widest">FLOW</text>

          {/* D_MAX Curve */}
          <path d={getPath(1.0)} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-300 dark:text-slate-600 opacity-60" />
          <text x={pad + graphW * 0.8} y={graphH * 0.25} className="text-[9px] fill-slate-400">Max Casing</text>

          {/* D_MIN Curve */}
          <path d={getPath(rMin)} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-300 dark:text-slate-600 opacity-60" />
          <text x={pad + graphW * rMin * 0.8} y={graphH - (graphH * rMin * rMin * 0.6)} className="text-[9px] fill-slate-400">Min Casing</text>

          {/* D_RATED Curve */}
          <path d={getPath(rRated)} fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-600 dark:text-blue-500" />
          
          <circle 
            cx={pad + (graphW * rRated * 0.9 * 0.55)} 
            cy={graphH - (graphH * rRated * rRated * 0.9 * 0.73)} 
            r="4" 
            className="fill-blue-600 dark:fill-blue-500 stroke-white dark:stroke-slate-900 stroke-2"
          />
          <text 
            x={pad + (graphW * rRated * 0.9 * 0.55) + 8} 
            y={graphH - (graphH * rRated * rRated * 0.9 * 0.73)} 
            dy={4}
            className="text-[10px] font-bold fill-blue-600 dark:fill-blue-400"
          >
            Rated Trim
          </text>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-5xl mx-auto p-4 md:py-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8 max-w-2xl">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary/10 text-primary hover:bg-primary/20">
             <Activity className="w-3.5 h-3.5 mr-1" /> API 610 / ISO 13709
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Impeller Diameter Validator
          </h1>
          <p className="text-muted-foreground text-lg">
            Hydraulic stability and casing margin verification.
          </p>
        </div>

        {/* Main Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* --- LEFT: INPUTS --- */}
          <Card className="h-full flex flex-col shadow-sm border-border">
            {/* CLEAN TRANSPARENT HEADER */}
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                Dimensions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 flex flex-col h-full gap-6">
              <div className="space-y-6 flex-1">
                
                {/* D_Min */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <label>Min Casing Trim</label>
                    <span>D-MIN</span>
                  </div>
                  <div className="flex rounded-md shadow-sm">
                    <Input 
                      type="number" 
                      value={dMin} 
                      onChange={e => setDMin(e.target.value)}
                      className="rounded-r-none border-r-0 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Select value={dMinUnit} onValueChange={setDMinUnit}>
                      <SelectTrigger className="w-[80px] rounded-l-none bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>{lengthUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* D_Rated */}
                <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex justify-between text-xs font-bold text-primary uppercase tracking-wider">
                    <label>Selection Trim</label>
                    <span>D-RATED</span>
                  </div>
                  <div className="flex rounded-md shadow-sm">
                    <Input 
                      type="number" 
                      value={dRated} 
                      onChange={e => setDRated(e.target.value)}
                      className="rounded-r-none border-r-0 border-primary/20 bg-background font-semibold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Select value={dRatedUnit} onValueChange={setDRatedUnit}>
                      <SelectTrigger className="w-[80px] rounded-l-none bg-muted/50 border-primary/20"><SelectValue /></SelectTrigger>
                      <SelectContent>{lengthUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* D_Max */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <label>Max Casing Trim</label>
                    <span>D-MAX</span>
                  </div>
                  <div className="flex rounded-md shadow-sm">
                    <Input 
                      type="number" 
                      value={dMax} 
                      onChange={e => setDMax(e.target.value)}
                      className="rounded-r-none border-r-0 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Select value={dMaxUnit} onValueChange={setDMaxUnit}>
                      <SelectTrigger className="w-[80px] rounded-l-none bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>{lengthUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all mt-auto">
                Validate Selection <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>


          {/* --- RIGHT: GRAPH & RESULT --- */}
          <div className="relative h-full">
            {result ? (
              <Card className="h-full flex flex-col shadow-sm border-border animate-in fade-in zoom-in-95 duration-200">
                
                {/* CLEAN TRANSPARENT HEADER - MATCHING LEFT SIDE */}
                <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Analysis Result
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={copyResult} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </CardHeader>

                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                  
                  {/* Status Box - Moved INSIDE content */}
                  <div className={`rounded-lg p-4 border flex items-start gap-4 ${result.isMet ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/50" : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50"}`}>
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${result.isMet ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {result.isMet ? <Check className="w-4 h-4" strokeWidth={3} /> : <AlertCircle className="w-4 h-4" strokeWidth={3} />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${result.isMet ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                        {result.statusDetails}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.isMet 
                          ? "Selection meets all API 610 margin requirements." 
                          : "Review pump casing limits or select a different impeller trim."}
                      </p>
                    </div>
                  </div>

                  {/* THE GRAPH */}
                  <div className="flex-1 min-h-[200px]">
                    <PumpCurveGraph rRated={result.rRated} rMin={result.rMin} />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">Margin vs Max</div>
                        <div className={`text-xl font-mono font-bold mt-0.5 ${result.marginMax >= 5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                           {result.marginMax.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Limit: {result.maxLimit.toFixed(1)} {dRatedUnit}</div>
                     </div>
                     <div className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">Margin vs Min</div>
                        <div className={`text-xl font-mono font-bold mt-0.5 ${result.marginMin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                           {result.marginMin.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Limit: {result.minLimit.toFixed(1)} {dRatedUnit}</div>
                     </div>
                  </div>

                </CardContent>
              </Card>
            ) : (
              // Empty State
              <Card className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground shadow-sm border-dashed border-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 opacity-50" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Performance Curve</h3>
                <p className="text-xs mt-1 max-w-[200px]">Enter dimensions to visualize hydraulic curve shifts.</p>
              </Card>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}