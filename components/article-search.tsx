'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

export function ArticleSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch !== searchParams.get('q')) {
      setIsSearching(true);
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      }
      router.push(`/articles?${params.toString()}`);
      setIsSearching(false);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleClear = () => {
    setSearchQuery('');
    router.push('/articles');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search articles by title, content, category, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20 h-12 text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {searchQuery && (
        <p className="mt-2 text-sm text-muted-foreground">
          Searching for: <span className="font-medium text-foreground">{searchQuery}</span>
        </p>
      )}
    </div>
  );
}
