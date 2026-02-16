import ScientificCalculator from '@/components/scientific-calculator';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Scientific Calculator
        </h1>
        <p className="text-gray-400 text-center mb-8">
          High-precision calculations using Math.js
        </p>
        
        <ScientificCalculator />

        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-gray-300">
          <h2 className="text-xl font-semibold mb-4 text-white">Features</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ Arbitrary-precision decimal arithmetic (14 digits)</li>
            <li>✓ No floating-point errors (0.1 + 0.2 = 0.3)</li>
            <li>✓ Trigonometric functions (sin, cos, tan)</li>
            <li>✓ DEG/RAD angle mode switching</li>
            <li>✓ Memory operations (M+, M-, MR, MC)</li>
            <li>✓ Logarithmic functions (log, ln)</li>
            <li>✓ Power operations (x^y)</li>
            <li>✓ Square root and constants (π)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
