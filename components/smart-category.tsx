'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Check, Folder, FolderPlus } from 'lucide-react';

interface SmartCategoryProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
  allowCreate?: boolean;
  allowClear?: boolean;
}

export function SmartCategory({
  value,
  onChange,
  suggestions,
  placeholder,
  label,
  allowCreate = true,
  allowClear = true,
}: SmartCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [inputValue, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setInputValue('');
    setIsOpen(false);
  };

  const handleCreateCategory = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleCreateCategory();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  const clearCategory = () => {
    onChange('');
  };

  const canCreate = allowCreate && inputValue.trim() && !suggestions.includes(inputValue.trim());

  return (
    <div className="space-y-2">
      {/* Current Category Display */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-2 px-3 py-1">
            <Folder className="h-3 w-3" />
            {value}
            {allowClear && (
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={clearCategory}
              />
            )}
          </Badge>
        </div>
      )}
      
      {/* Input for searching/creating categories */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value ? "Change category..." : placeholder}
          className="pr-10"
        />
        
        {isOpen && (filteredSuggestions.length > 0 || canCreate) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {/* Existing categories */}
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-blue-600" />
                  <span>{suggestion}</span>
                </div>
                {value === suggestion && <Check className="h-4 w-4 text-green-600" />}
              </button>
            ))}
            
            {/* Create new category option */}
            {canCreate && (
              <button
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-700"
                onClick={handleCreateCategory}
              >
                <FolderPlus className="h-4 w-4" />
                Create "{inputValue.trim()}"
              </button>
            )}
            
            {/* Clear category option */}
            {allowClear && value && (
              <button
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700"
                onClick={clearCategory}
              >
                <X className="h-4 w-4" />
                Clear category
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value ? 'Search to change category or clear current one' : 'Search existing categories or create a new one'}
      </p>
    </div>
  );
}