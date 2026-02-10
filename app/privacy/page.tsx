import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
              <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 27, 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Our Commitment to Privacy</h2>
            <p className="text-muted-foreground mb-6">
              At Pump Gravity, we are committed to protecting your privacy. This policy explains how we collect, use, and protect your information when you use our engineering calculation and unit conversion platform.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">Information We Collect</h3>
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-2">Minimal Data Collection</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Basic usage analytics to improve our calculators and conversions</li>
                <li>Email address (only if you subscribe to our newsletter)</li>
                <li>Technical information like browser type and device for optimization</li>
                <li>Calculation history (stored locally in your browser only)</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">How We Use Your Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>To provide and improve our calculation services</li>
              <li>To send newsletter updates (only with your consent)</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To ensure platform security and prevent abuse</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Data Protection</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>We do not sell, trade, or share your personal information with third parties</li>
              <li>All data transmission is encrypted using industry-standard SSL</li>
              <li>Calculation data is processed locally when possible</li>
              <li>We comply with GDPR and other applicable privacy regulations</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Cookies and Tracking</h3>
            <p className="text-muted-foreground mb-4">
              We use minimal cookies for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>Essential site functionality</li>
              <li>Remembering your preferences</li>
              <li>Basic analytics (anonymized)</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Your Rights</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Opt-out of communications</li>
              <li>Export your data</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">Contact Us</h3>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy, please contact us at privacy@pumpgravity.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}