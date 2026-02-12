"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ placeholder = "Search...", onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
