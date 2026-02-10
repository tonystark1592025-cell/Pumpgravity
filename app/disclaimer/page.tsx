import { Sparkles, AlertTriangle, Shield, Calculator } from "lucide-react"
import Link from "next/link"

export default function DisclaimerPage() {
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
              <h1 className="text-3xl font-bold text-foreground">Disclaimer</h1>
              <p className="text-muted-foreground">Important information about using our platform</p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Professional Engineering Notice
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300">
                The calculations and conversions provided by Pump Gravity are for informational and educational purposes only. 
                Always consult with qualified professional engineers and verify all calculations independently before making 
                engineering decisions or implementing designs.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* General Disclaimer */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">General Disclaimer</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The information, calculations, conversions, and tools provided on Pump Gravity are offered on an "as-is" basis 
                without warranties of any kind, either express or implied.
              </p>
              <p>
                While we strive to provide accurate and reliable calculations, we make no representations or warranties about 
                the accuracy, reliability, completeness, or timeliness of the information, software, text, graphics, or links.
              </p>
            </div>
          </div>

          {/* Calculation Accuracy */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Calculation Accuracy</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Our calculation algorithms are based on established engineering principles and formulas. However:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Rounding errors may occur in complex calculations</li>
                <li>Some calculations use approximations or simplified models</li>
                <li>Results may not account for all real-world variables and conditions</li>
                <li>Different calculation methods may yield slightly different results</li>
              </ul>
              <p>
                <strong>Always verify critical calculations using multiple sources and methods.</strong>
              </p>
            </div>
          </div>

          {/* Professional Responsibility */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Professional Responsibility</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Users are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Verifying the appropriateness of calculations for their specific applications</li>
                <li>Ensuring compliance with applicable codes, standards, and regulations</li>
                <li>Consulting with licensed professional engineers when required</li>
                <li>Performing independent verification of critical calculations</li>
                <li>Understanding the limitations and assumptions of each calculation method</li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Under no circumstances shall Pump Gravity, its developers, or contributors be liable for any:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Direct, indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Personal injury or property damage</li>
                <li>Engineering failures or design errors</li>
                <li>Regulatory non-compliance</li>
              </ul>
              <p>
                This limitation applies regardless of whether such damages arise from contract, tort, negligence, 
                or any other legal theory.
              </p>
            </div>
          </div>

          {/* Educational Use */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Educational and Learning Purpose</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Pump Gravity is designed as an educational and reference tool to help users:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Learn engineering calculation methods</li>
                <li>Understand unit conversions and relationships</li>
                <li>Explore different calculation approaches</li>
                <li>Verify manual calculations</li>
              </ul>
              <p>
                It is not intended to replace professional engineering judgment, detailed analysis, 
                or compliance with professional engineering standards.
              </p>
            </div>
          </div>

          {/* Updates and Changes */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Updates and Changes</h2>
            <p className="text-muted-foreground">
              This disclaimer may be updated periodically to reflect changes in our services or legal requirements. 
              Users are encouraged to review this disclaimer regularly. Continued use of the platform after changes 
              constitutes acceptance of the updated disclaimer.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Questions or Concerns</h2>
            <p className="text-muted-foreground">
              If you have questions about this disclaimer or need clarification about the appropriate use of our tools, 
              please contact us at legal@pumpgravity.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}