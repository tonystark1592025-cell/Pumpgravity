"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Droplets, Gauge, Thermometer, Scale, Ruler, Beaker, 
  Sigma, ArrowRight, Activity, Zap, MoveDown, Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Data with specific "Fluid" colors for the physics engine
const converterTypes = [
  {
    id: "flow",
    label: "Flow Rate",
    icon: Droplets,
    color: "bg-cyan-500",
    liquid: "from-cyan-500/80 to-blue-600/80",
    input: "15 L/min",
    output: "3.96 GPM",
    description: "Hydraulic Fluid Velocity"
  },
  {
    id: "pressure",
    label: "Pressure",
    icon: Gauge,
    color: "bg-red-500",
    liquid: "from-orange-500/80 to-red-600/80",
    input: "100 PSI",
    output: "6.89 Bar",
    description: "Chamber Compression"
  },
  {
    id: "temperature",
    label: "Temperature",
    icon: Thermometer,
    color: "bg-amber-500",
    liquid: "from-yellow-500/80 to-orange-600/80",
    input: "100° C",
    output: "212° F",
    description: "Thermal Expansion"
  },
  {
    id: "mass",
    label: "Mass Load",
    icon: Scale,
    color: "bg-emerald-500",
    liquid: "from-emerald-500/80 to-green-600/80",
    input: "50 kg",
    output: "110 lbs",
    description: "Gravitational Weight"
  },
  {
    id: "length",
    label: "Distance",
    icon: Ruler,
    color: "bg-violet-500",
    liquid: "from-indigo-500/80 to-violet-600/80",
    input: "1000 m",
    output: "0.62 mi",
    description: "Linear Displacement"
  },
  {
    id: "volume",
    label: "Volume",
    icon: Beaker,
    color: "bg-blue-500",
    liquid: "from-blue-400/80 to-indigo-600/80",
    input: "50 Gal",
    output: "189 L",
    description: "Tank Capacity"
  },
]

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % converterTypes.length)
    }, 4500) // Slightly slower to enjoy the physics
    return () => clearInterval(interval)
  }, [])

  const activeConverter = converterTypes[activeIndex]
  const ActiveIcon = activeConverter.icon

  return (
    <section className="relative overflow-hidden bg-background py-12 lg:py-24">
      {/* Subtle Engineering Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          {/* Left Content (Text) */}
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
                <Activity className="mr-2 h-3.5 w-3.5" />
                Engineering Simulation Engine
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Most Precise  <br/>
                <span className="text-primary">Unit Conversion</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Don't just calculate numbers—simulate reality. Convert flow, pressure, and mass with our AI-driven engineering calculators.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/converters">
                  <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/20">
                    Launch Simulator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button size="lg" variant="outline" className="h-12 border-muted-foreground/20 bg-background/50 backdrop-blur">
                    View Instruments <Sigma className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Gravity/Pump Visualization */}
          <div className="relative flex items-center justify-center">
            
            {/* The Main Container (The Reactor) */}
            <div className="relative h-[500px] w-full max-w-sm rounded-[2rem] border border-white/10 bg-background/40 p-4 shadow-2xl backdrop-blur-xl">
              
              {/* Decorative Piping/Structure */}
              <div className="absolute -left-3 top-12 h-24 w-3 rounded-l-lg bg-border opacity-50" />
              <div className="absolute -right-3 bottom-12 h-24 w-3 rounded-r-lg bg-border opacity-50" />
              
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] bg-black/40 ring-1 ring-white/10">
                
                {/* --- TOP CHAMBER (INPUT) --- */}
                <div className="relative flex h-[40%] w-full flex-col items-center justify-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  {/* Measurement Ticks */}
                  <div className="absolute left-2 top-0 h-full w-4 flex flex-col justify-evenly opacity-30">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-[1px] w-full bg-white" />)}
                  </div>

                  {/* Input Label */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeConverter.id + "in"}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      className="z-10 text-center"
                    >
                      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Input Source</div>
                      <div className="mt-1 text-3xl font-bold text-white font-mono tracking-tight">{activeConverter.input}</div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Falling Particles (Gravity Effect) */}
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                     {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute h-2 w-2 rounded-full ${activeConverter.color}`}
                          style={{ left: `${10 + Math.random() * 80}%` }}
                          animate={{ 
                            y: ['-100%', '400%'],
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ 
                            duration: 2 + Math.random(), 
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                          }}
                        />
                     ))}
                  </div>
                </div>

                {/* --- CENTER MECHANISM (THE PUMP) --- */}
                <div className="relative z-20 flex h-[20%] w-full items-center justify-center">
                  {/* Glass Housing */}
                  <div className="absolute inset-x-4 h-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md" />
                  
                  {/* Flow Direction Arrow */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                     <MoveDown className="h-24 w-24 animate-pulse text-white" />
                  </div>

                  {/* Spinning/Pulsing Core Icon */}
                  <motion.div
                    key={activeConverter.id}
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${activeConverter.liquid} shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-4 ring-black/50`}
                  >
                    <ActiveIcon className="h-8 w-8 text-white drop-shadow-md" />
                  </motion.div>
                </div>

                {/* --- BOTTOM CHAMBER (OUTPUT) --- */}
                <div className="relative flex h-[40%] w-full flex-col items-center justify-center border-t border-white/5">
                   
                   {/* The Filling Liquid Effect */}
                   <AnimatePresence mode="wait">
                     <motion.div
                        key={activeConverter.id + "liquid"}
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        exit={{ height: "100%", opacity: 0 }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${activeConverter.liquid} opacity-40`}
                     >
                        {/* Bubbles rising in the liquid */}
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute rounded-full bg-white/30"
                              style={{ 
                                width: Math.random() * 6 + 2,
                                height: Math.random() * 6 + 2,
                                left: `${Math.random() * 100}%` 
                              }}
                              animate={{ y: ['200%', '-200%'] }}
                              transition={{ 
                                duration: 2 + Math.random() * 2, 
                                repeat: Infinity, 
                                ease: "linear",
                                delay: Math.random()
                              }}
                            />
                          ))}
                        </div>
                        {/* Wave Top */}
                        <div className="absolute -top-1 left-0 right-0 h-2 bg-white/20 blur-sm" />
                     </motion.div>
                   </AnimatePresence>

                   {/* Measurement Ticks (Right Side) */}
                   <div className="absolute right-2 bottom-0 h-full w-4 flex flex-col-reverse justify-evenly opacity-30">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-[1px] w-full bg-white" />)}
                  </div>

                   {/* Output Label */}
                   <AnimatePresence mode="wait">
                    <motion.div
                      key={activeConverter.id + "out"}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="z-10 flex flex-col items-center"
                    >
                      <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Calculated Output</div>
                      <div className="mt-1 text-4xl font-bold text-white font-mono drop-shadow-lg">{activeConverter.output}</div>
                      <Badge variant="secondary" className="mt-2 bg-black/30 text-white backdrop-blur">
                         <Sparkles className="mr-1 h-3 w-3" />
                         {activeConverter.description}
                      </Badge>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

              {/* Status Light at Top Right */}
              <div className="absolute right-4 top-4 flex items-center gap-2">
                 <span className="text-[10px] font-mono text-muted-foreground">SYS.OK</span>
                 <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}