'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Check } from 'lucide-react';

interface SmartSelectProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
  allowCreate?: boolean;
}

export function SmartSelect({
  value,
  onChange,
  suggestions,
  placeholder,
  label,
  allowCreate = true,
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    // Delay to allow suggestion clicks
    setTimeout(() => {
      onChange(inputValue);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(inputValue);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const canCreate = allowCreate && inputValue && !suggestions.includes(inputValue);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10"
      />
      
      {isOpen && (filteredSuggestions.length > 0 || canCreate) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span>{suggestion}</span>
              {value === suggestion && <Check className="h-4 w-4 text-green-600" />}
            </button>
          ))}
          
          {canCreate && (
            <button
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-700"
              onClick={() => handleSuggestionClick(inputValue)}
            >
              <Plus className="h-4 w-4" />
              Create "{inputValue}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SmartTagsProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
}

export function SmartTags({
  value,
  onChange,
  suggestions,
  placeholder,
  label,
}: SmartTagsProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
    );
    setFilteredSuggestions(filtered);
  }, [inputValue, suggestions, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (tag.trim() && !value.includes(tag.trim())) {
      onChange([...value, tag.trim()]);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const canCreate = inputValue && !suggestions.includes(inputValue) && !value.includes(inputValue);

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        
        {isOpen && (filteredSuggestions.length > 0 || canCreate) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
            
            {canCreate && (
              <button
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-700"
                onClick={() => addTag(inputValue)}
              >
                <Plus className="h-4 w-4" />
                Create "{inputValue}"
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add tags
      </p>
    </div>
  );
}