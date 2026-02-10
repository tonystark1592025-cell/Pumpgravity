'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ClearDbButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear ALL database collections? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/admin/clear-db', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setResult(`✅ Success! Dropped: ${data.dropped.join(', ')}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleClear} 
        disabled={loading}
        variant="destructive"
      >
        {loading ? 'Clearing...' : 'Clear Database'}
      </Button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  );
}
