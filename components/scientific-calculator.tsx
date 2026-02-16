'use client';

import { useState } from 'react';
import { create, all } from 'mathjs';

const math = create(all, {
  precision: 14,
  number: 'BigNumber'
});

type AngleMode = 'DEG' | 'RAD';

export default function ScientificCalculator() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState('0');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult !== null) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setDisplay(display + op);
    setLastResult(null);
  };

  const handleFunction = (fn: string) => {
    setDisplay(display + fn + '(');
    setLastResult(null);
  };

  const calculate = () => {
    try {
      let expression = display;
      
      // Convert trig functions based on angle mode
      if (angleMode === 'DEG') {
        expression = expression
          .replace(/sin\(/g, 'sin((pi/180)*')
          .replace(/cos\(/g, 'cos((pi/180)*')
          .replace(/tan\(/g, 'tan((pi/180)*');
      }

      const result = math.evaluate(expression);
      const resultStr = math.format(result, { precision: 14 });
      setDisplay(resultStr);
      setLastResult(resultStr);
    } catch (error) {
      setDisplay('Error');
      setLastResult(null);
    }
  };

  const clear = () => {
    setDisplay('0');
    setLastResult(null);
  };

  const clearAll = () => {
    setDisplay('0');
    setMemory('0');
    setLastResult(null);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const memoryAdd = () => {
    try {
      const current = math.evaluate(display);
      const newMemory = math.add(math.bignumber(memory), current);
      setMemory(math.format(newMemory, { precision: 14 }));
    } catch (error) {
      // Ignore errors
    }
  };

  const memorySubtract = () => {
    try {
      const current = math.evaluate(display);
      const newMemory = math.subtract(math.bignumber(memory), current);
      setMemory(math.format(newMemory, { precision: 14 }));
    } catch (error) {
      // Ignore errors
    }
  };

  const memoryRecall = () => {
    setDisplay(memory);
    setLastResult(null);
  };

  const memoryClear = () => {
    setMemory('0');
  };

  const toggleAngleMode = () => {
    setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-900 rounded-lg shadow-2xl">
      {/* Display */}
      <div className="bg-gray-800 p-4 rounded mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{angleMode}</span>
          <span>M: {memory !== '0' ? '●' : '○'}</span>
        </div>
        <div className="text-right text-2xl text-white font-mono overflow-x-auto">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {/* Row 1 */}
        <button onClick={clearAll} className="btn-secondary col-span-1">AC</button>
        <button onClick={clear} className="btn-secondary">C</button>
        <button onClick={backspace} className="btn-secondary">←</button>
        <button onClick={toggleAngleMode} className="btn-secondary">{angleMode}</button>
        <button onClick={() => handleOperator('/')} className="btn-operator">÷</button>

        {/* Row 2 */}
        <button onClick={() => handleFunction('sin')} className="btn-function">sin</button>
        <button onClick={() => handleNumber('7')} className="btn-number">7</button>
        <button onClick={() => handleNumber('8')} className="btn-number">8</button>
        <button onClick={() => handleNumber('9')} className="btn-number">9</button>
        <button onClick={() => handleOperator('*')} className="btn-operator">×</button>

        {/* Row 3 */}
        <button onClick={() => handleFunction('cos')} className="btn-function">cos</button>
        <button onClick={() => handleNumber('4')} className="btn-number">4</button>
        <button onClick={() => handleNumber('5')} className="btn-number">5</button>
        <button onClick={() => handleNumber('6')} className="btn-number">6</button>
        <button onClick={() => handleOperator('-')} className="btn-operator">−</button>

        {/* Row 4 */}
        <button onClick={() => handleFunction('tan')} className="btn-function">tan</button>
        <button onClick={() => handleNumber('1')} className="btn-number">1</button>
        <button onClick={() => handleNumber('2')} className="btn-number">2</button>
        <button onClick={() => handleNumber('3')} className="btn-number">3</button>
        <button onClick={() => handleOperator('+')} className="btn-operator">+</button>

        {/* Row 5 */}
        <button onClick={() => handleFunction('sqrt')} className="btn-function">√</button>
        <button onClick={() => handleNumber('0')} className="btn-number col-span-2">0</button>
        <button onClick={() => handleNumber('.')} className="btn-number">.</button>
        <button onClick={calculate} className="btn-equals">=</button>

        {/* Row 6 - Memory & Advanced */}
        <button onClick={memoryClear} className="btn-memory">MC</button>
        <button onClick={memoryRecall} className="btn-memory">MR</button>
        <button onClick={memoryAdd} className="btn-memory">M+</button>
        <button onClick={memorySubtract} className="btn-memory">M−</button>
        <button onClick={() => handleOperator('^')} className="btn-function">x^y</button>

        {/* Row 7 - More functions */}
        <button onClick={() => handleFunction('log')} className="btn-function">log</button>
        <button onClick={() => handleFunction('ln')} className="btn-function">ln</button>
        <button onClick={() => handleOperator('(')} className="btn-secondary">(</button>
        <button onClick={() => handleOperator(')')} className="btn-secondary">)</button>
        <button onClick={() => setDisplay(display + 'pi')} className="btn-function">π</button>
      </div>

      <style jsx>{`
        .btn-number {
          @apply bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded transition;
        }
        .btn-operator {
          @apply bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded transition;
        }
        .btn-equals {
          @apply bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded transition;
        }
        .btn-function {
          @apply bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded transition;
        }
        .btn-secondary {
          @apply bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 rounded transition;
        }
        .btn-memory {
          @apply bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-3 rounded transition;
        }
      `}</style>
    </div>
  );
}
