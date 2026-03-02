import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  Quote, 
  FileText, 
  Award,
  X,
  ChevronDown
} from 'lucide-react';
import type { SearchFilters, PublicationType } from '@/types';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
}

export function AdvancedSearch({ onSearch, isLoading }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    yearFrom: 1990,
    yearTo: 2030,
    minCitations: 0,
    publicationType: [],
    venueRank: [],
    sortBy: 'relevance',
    openAccessOnly: false,
    peerReviewedOnly: true,
    authorName: ''
  });

  const handleSearch = () => {
    // Allow search even without query - will use default 'machine learning'
    onSearch(query.trim(), filters);
  };

  const togglePublicationType = (type: PublicationType) => {
    const current = filters.publicationType || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFilters({ ...filters, publicationType: updated });
  };

  const toggleVenueRank = (rank: 'A*' | 'A' | 'B' | 'C') => {
    const current = filters.venueRank || [];
    const updated = current.includes(rank)
      ? current.filter(r => r !== rank)
      : [...current, rank];
    setFilters({ ...filters, venueRank: updated });
  };

  const resetFilters = () => {
    setFilters({
      yearFrom: 1990,
      yearTo: 2030,
      minCitations: 0,
      publicationType: [],
      venueRank: [],
      sortBy: 'relevance',
      openAccessOnly: false,
      peerReviewedOnly: true,
      authorName: ''
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Main Search */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search papers, authors, venues... (e.g., 'attention mechanism', 'Geoffrey Hinton', 'ICML')"
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
        
        {(filters.publicationType?.length || filters.venueRank?.length || filters.minCitations > 0) && (
          <Badge variant="secondary" className="text-xs">
            {(filters.publicationType?.length || 0) + (filters.venueRank?.length || 0) + (filters.minCitations > 0 ? 1 : 0)} filters active
          </Badge>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Publication Type */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Publication Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(['conference', 'journal', 'preprint', 'book'] as PublicationType[]).map(type => (
                <Button
                  key={type}
                  variant={filters.publicationType?.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePublicationType(type)}
                  className="h-8 text-xs capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Venue Ranking */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Award className="w-4 h-4" />
              Venue Ranking
            </label>
            <div className="flex gap-2">
              {(['A*', 'A', 'B', 'C'] as const).map(rank => (
                <Button
                  key={rank}
                  variant={filters.venueRank?.includes(rank) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleVenueRank(rank)}
                  className="h-8 text-xs font-bold"
                >
                  {rank}
                </Button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Author Name</label>
            <Input
              type="text"
              value={filters.authorName || ''}
              onChange={(e) => setFilters({ ...filters, authorName: e.target.value })}
              placeholder="e.g., Geoffrey Hinton"
              className="h-8"
            />
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Year
              </label>
              <Input
                type="number"
                value={filters.yearFrom || 1990}
                onChange={(e) => setFilters({ ...filters, yearFrom: parseInt(e.target.value) })}
                className="h-8"
                min={1990}
                max={2030}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Year</label>
              <Input
                type="number"
                value={filters.yearTo || 2030}
                onChange={(e) => setFilters({ ...filters, yearTo: parseInt(e.target.value) })}
                className="h-8"
                min={1990}
                max={2030}
              />
            </div>
          </div>

          {/* Citations */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Quote className="w-4 h-4" />
              Minimum Citations: {filters.minCitations || 0}
            </label>
            <Input
              type="range"
              value={filters.minCitations || 0}
              onChange={(e) => setFilters({ ...filters, minCitations: parseInt(e.target.value) })}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <div className="flex gap-2">
              {(['relevance', 'citations', 'date'] as const).map(sort => (
                <Button
                  key={sort}
                  variant={filters.sortBy === sort ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, sortBy: sort })}
                  className="h-8 text-xs capitalize flex-1"
                >
                  {sort}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.openAccessOnly || false}
                onChange={(e) => setFilters({ ...filters, openAccessOnly: e.target.checked })}
                className="rounded"
              />
              Open Access Only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.peerReviewedOnly || false}
                onChange={(e) => setFilters({ ...filters, peerReviewedOnly: e.target.checked })}
                className="rounded"
              />
              Peer Reviewed Only
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Apply Filters & Search
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}