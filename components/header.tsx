"use client"

import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { Search, Globe, Menu, X, Sparkles, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Fuse from "fuse.js"
import { cn } from "@/lib/utils"
import { converters } from "@/lib/converters-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function SearchComponent({ isMobile = false }: { isMobile?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)
  const router = useRouter()

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(converters, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'category', weight: 0.2 },
        { name: 'tags', weight: 0.3 },
        { name: 'keywords', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
    })
  }, [])

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []
    
    const searchResults = fuse.search(searchQuery.trim()).slice(0, 6)
    const suggestionSet = new Set<string>()
    const results: Array<{type: string, text: string, converter: any}> = []

    // Add converter names
    searchResults.forEach(result => {
      const converter = result.item
      if (!suggestionSet.has(converter.name)) {
        suggestionSet.add(converter.name)
        results.push({
          type: 'converter',
          text: converter.name,
          converter
        })
      }
    })

    // Add matching tags
    searchResults.forEach(result => {
      const converter = result.item
      
      converter.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchQuery.toLowerCase()) && !suggestionSet.has(tag)) {
          suggestionSet.add(tag)
          results.push({
            type: 'tag',
            text: `${tag} (${converter.name})`,
            converter
          })
        }
      })
    })

    return results.slice(0, 5)
  }, [searchQuery, fuse])

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.converter) {
      // Navigate to the category page
      router.push(`/converters/${suggestion.converter.category}`)
      setShowSuggestions(false)
      setSearchQuery("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedSuggestion >= 0 && focusedSuggestion < suggestions.length) {
          handleSuggestionClick(suggestions[focusedSuggestion])
        } else if (searchQuery.trim()) {
          // If no suggestion focused, go to converters page with search
          router.push(`/converters?search=${encodeURIComponent(searchQuery)}`)
          setShowSuggestions(false)
          setSearchQuery("")
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedSuggestion(-1)
        break
    }
  }

  return (
    <div className={cn("relative", isMobile ? "w-full" : "w-48 focus-within:w-56")}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search converters..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowSuggestions(true)
          setFocusedSuggestion(-1)
        }}
        onFocus={() => {
          if (searchQuery.length >= 2) {
            setShowSuggestions(true)
          }
        }}
        onBlur={() => {
          // Delay hiding suggestions to allow clicks
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        onKeyDown={handleKeyDown}
        className="w-full border-border bg-secondary pl-9 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
      />
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-card shadow-lg">
          <div className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                  index === focusedSuggestion && "bg-secondary"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{suggestion.text}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    suggestion.type === 'converter' && "bg-primary/20 text-primary",
                    suggestion.type === 'tag' && "bg-accent/20 text-accent"
                  )}>
                    {suggestion.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            Press Enter to search • ↑↓ to navigate
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Pump Gravity</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-accent", pathname === '/' ? "text-primary" : "text-muted-foreground")}>
            Home
          </Link>
          <Link href="/articles" className={cn("text-sm font-medium transition-colors hover:text-foreground", pathname.startsWith('/articles') ? "text-primary" : "text-muted-foreground")}>
            Articles
          </Link>
          <Link href="/converters" className={cn("text-sm font-medium transition-colors hover:text-foreground", pathname.startsWith('/converters') ? "text-primary" : "text-muted-foreground")}>
            Converters
          </Link>
          <Link href="/calculators" className={cn("text-sm font-medium transition-colors hover:text-foreground", pathname.startsWith('/calculators') ? "text-primary" : "text-muted-foreground")}>
            Calculators
          </Link>
          <Link href="/news" className={cn("text-sm font-medium transition-colors hover:text-foreground", pathname.startsWith('/news') ? "text-primary" : "text-muted-foreground")}>
            News
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:block">
            <SearchComponent />
          </div>

          {/* AI Converter Button */}
          {/* <Link href="/ai-chat" className="shrink-0">
            <Button variant="outline" size="sm" className="hidden gap-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground sm:flex">
              <Sparkles className="h-4 w-4" />
              AI Converter
            </Button>
          </Link> */}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                {resolvedTheme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2">
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2">
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Globe className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/"
              className={cn("block rounded-md px-3 py-2 text-sm font-medium", pathname === '/' ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/articles"
              className={cn("block rounded-md px-3 py-2 text-sm font-medium", pathname.startsWith('/articles') ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Articles
            </Link>
            <Link
              href="/converters"
              className={cn("block rounded-md px-3 py-2 text-sm font-medium", pathname.startsWith('/converters') ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Converters
            </Link>
            <Link
              href="/calculators"
              className={cn("block rounded-md px-3 py-2 text-sm font-medium", pathname.startsWith('/calculators') ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Calculators
            </Link>
            <Link
              href="/news"
              className={cn("block rounded-md px-3 py-2 text-sm font-medium", pathname.startsWith('/news') ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>
            <div className="pt-2">
              <SearchComponent isMobile={true} />
            </div>
            {/* <Link href="/ai-chat" onClick={() => setMobileMenuOpen(false)}>
              <Button className="mt-2 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="h-4 w-4" />
                AI Converter
              </Button>
            </Link> */}
          </div>
        </div>
      )}
    </header>
  )
}
