import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Ruler } from "lucide-react"
import { categories } from "@/lib/converters-data"

export default function ConvertersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ruler className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Unit Converters</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Professional unit converters for engineering, science, and everyday use
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={`/converters/${cat.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${cat.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
