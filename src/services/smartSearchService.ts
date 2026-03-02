import { ResearchPaper } from '@/types';
import { searchGoogleScholar } from './scholarService';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'author' | 'venue' | 'keyword';
  count?: number;
}

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

class SmartSearchService {
  private searchHistory: SearchHistory[] = [];
  private popularQueries: string[] = [
    'transformers in NLP',
    'deep learning computer vision',
    'reinforcement learning',
    'neural networks',
    'machine learning algorithms',
    'artificial intelligence',
    'natural language processing',
    'convolutional neural networks',
    'generative adversarial networks',
    'attention mechanisms'
  ];

  private venues = [
    'NeurIPS', 'ICML', 'ICLR', 'CVPR', 'ECCV', 'EMNLP', 'ACL', 'NAACL',
    'Nature', 'Science', 'JMLR', 'IEEE TPAMI', 'IJCAI', 'AAAI'
  ];

  private authors = [
    'Geoffrey Hinton', 'Yann LeCun', 'Yoshua Bengio', 'Andrew Ng',
    'Fei-Fei Li', 'Ian Goodfellow', 'Andrej Karpathy', 'Demis Hassabis'
  ];

  constructor() {
    this.loadSearchHistory();
  }

  async getSearchSuggestions(query: string, limit = 8): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Recent searches
    const recentSearches = this.searchHistory
      .filter(h => h.query.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(h => ({
        id: `recent-${h.query}`,
        text: h.query,
        type: 'query' as const,
        count: h.resultCount
      }));

    // Popular queries
    const popularMatches = this.popularQueries
      .filter(q => q.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(q => ({
        id: `popular-${q}`,
        text: q,
        type: 'query' as const
      }));

    // Author suggestions
    const authorMatches = this.authors
      .filter(a => a.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .map(a => ({
        id: `author-${a}`,
        text: a,
        type: 'author' as const
      }));

    // Venue suggestions
    const venueMatches = this.venues
      .filter(v => v.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .map(v => ({
        id: `venue-${v}`,
        text: `papers from ${v}`,
        type: 'venue' as const
      }));

    suggestions.push(...recentSearches, ...popularMatches, ...authorMatches, ...venueMatches);
    
    return suggestions.slice(0, limit);
  }

  addToHistory(query: string, resultCount: number) {
    const existing = this.searchHistory.findIndex(h => h.query === query);
    if (existing >= 0) {
      this.searchHistory.splice(existing, 1);
    }

    this.searchHistory.unshift({
      query,
      timestamp: new Date(),
      resultCount
    });

    this.searchHistory = this.searchHistory.slice(0, 50);
    this.saveSearchHistory();
  }

  getRecentSearches(limit = 10): SearchHistory[] {
    return this.searchHistory.slice(0, limit);
  }

  clearHistory() {
    this.searchHistory = [];
    localStorage.removeItem('smart-search-history');
  }

  private loadSearchHistory() {
    try {
      const saved = localStorage.getItem('smart-search-history');
      if (saved) {
        this.searchHistory = JSON.parse(saved).map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }

  private saveSearchHistory() {
    try {
      localStorage.setItem('smart-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

export const smartSearchService = new SmartSearchService();