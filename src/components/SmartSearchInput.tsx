import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, User, Building, Hash, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { smartSearchService } from '@/services/smartSearchService';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'author' | 'venue' | 'keyword';
  count?: number;
}

interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SmartSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search research papers, authors, or ask about AI/ML topics...",
  isLoading = false,
  disabled = false
}: SmartSearchInputProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const loadSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await smartSearchService.getSearchSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSuggestions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, loadSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setTimeout(() => handleSearch(suggestion.text), 100);
  };

  const handleSearch = (query?: string) => {
    const searchQuery = query || value;
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'author': return <User className="w-4 h-4 text-blue-500" />;
      case 'venue': return <Building className="w-4 h-4 text-green-500" />;
      case 'keyword': return <Hash className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && loadSuggestions(value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="pr-16 pl-6 py-4 text-base lg:text-lg text-gray-800 bg-gray-50 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-500 transition-all duration-200"
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin text-blue-600" />
          ) : (
            <Button 
              size="lg" 
              onClick={() => handleSearch()} 
              disabled={!value.trim() || isLoading} 
              className="bg-blue-600 hover:bg-blue-700 rounded-lg h-10 lg:h-12 px-4 lg:px-6"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoadingSuggestions ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              Loading suggestions...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.text}
                  </p>
                  {suggestion.count && (
                    <p className="text-xs text-gray-500">
                      {suggestion.count} results
                    </p>
                  )}
                </div>
                {suggestion.type !== 'query' && (
                  <span className="text-xs text-gray-400 capitalize">
                    {suggestion.type}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}