import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 27, 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Terms of Service</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to Pump Gravity. By using our platform, you agree to these terms of service.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">Acceptance of Terms</h3>
            <p className="text-muted-foreground mb-6">
              By accessing and using Pump Gravity's engineering calculation and unit conversion platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">Use of Service</h3>
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-2">Permitted Use</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>Use our calculators and conversion tools for legitimate purposes</li>
                <li>Access educational content and documentation</li>
                <li>Share results and calculations with proper attribution</li>
              </ul>
              
              <h4 className="font-medium text-foreground mb-2">Prohibited Use</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Attempt to reverse engineer or copy our algorithms</li>
                <li>Use automated tools to scrape or abuse our services</li>
                <li>Distribute malicious content or spam</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">Accuracy and Reliability</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> While we strive for accuracy, all calculations and conversions are provided for informational purposes only. Always verify critical calculations independently and consult with qualified professionals for engineering decisions.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">Intellectual Property</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>Pump Gravity retains all rights to our platform, algorithms, and content</li>
              <li>You retain rights to any data you input into our calculators</li>
              <li>Our open-source components are governed by their respective licenses</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Limitation of Liability</h3>
            <p className="text-muted-foreground mb-6">
              Pump Gravity shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">Service Availability</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>We reserve the right to modify or discontinue features with notice</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Changes to Terms</h3>
            <p className="text-muted-foreground mb-6">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">Contact Information</h3>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us at legal@pumpgravity.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}