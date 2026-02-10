import Link from "next/link"
import { Sparkles, Linkedin, Twitter, Youtube, Github } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const quickLinks = [
  { name: "Converters", href: "/converters" },
  { name: "Calculators", href: "/calculators" },
  { name: "Documentation", href: "#" },
]

const supportLinks = [
  { name: "Help Center", href: "#" },
  { name: "Community Forum", href: "#" },
  { name: "Contact Expert", href: "#" },
]

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin },
  { name: "Twitter", icon: Twitter },
  { name: "YouTube", icon: Youtube },
  { name: "GitHub", icon: Github },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Pump Gravity</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Building the world&apos;s most comprehensive digital ecosystem for unit conversions and engineering calculations.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <button
                    key={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Support</h3>
            <ul className="mt-4 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Newsletter</h3>
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
                />
                <Button size="icon" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Pump Gravity Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="/roadmap" className="text-xs text-muted-foreground hover:text-foreground">Roadmap</Link>
            <Link href="/disclaimer" className="text-xs text-muted-foreground hover:text-foreground">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
