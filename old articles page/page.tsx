import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileText } from "lucide-react"

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Articles</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Engineering articles and technical guides are coming soon. Stay tuned for in-depth content on unit conversions, calculations, and best practices.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Coming Soon
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
