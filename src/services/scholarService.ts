import type { ResearchPaper, PaperSearchResult, CitationAnalysis, TrendingTopic } from '@/types';
import { searchWithCache } from './multiSourceService';

interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'citations' | 'date' | 'impact';
  useCache?: boolean;
  authorName?: string;
  maxYear?: number;
}

interface PaginatedResults {
  papers: ResearchPaper[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Enhanced search function using real APIs
export async function searchGoogleScholar(
  query: string, 
  options: SearchOptions = {}
): Promise<PaperSearchResult & PaginatedResults> {
  const { page = 1, limit = 10, sortBy = 'relevance', authorName, maxYear } = options;
  
  try {
    // Determine API sort parameter
    const apiSort = (sortBy === 'citations' || sortBy === 'impact') ? 'citations' : 'date';
    
    // Search using multi-source API
    const allPapers = await searchWithCache(query, apiSort, authorName);
    
    // Filter by max year if specified (only filter out clearly future years)
    let filteredPapers = allPapers;
    if (maxYear) {
      filteredPapers = allPapers.filter(p => p.year <= maxYear);
      console.log(`Filtered papers by maxYear ${maxYear}: ${allPapers.length} -> ${filteredPapers.length}`);
    }
    
    const sortedPapers = sortPapers(filteredPapers, sortBy);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = sortedPapers.slice(startIndex, endIndex);
    
    return {
      query,
      totalResults: sortedPapers.length,
      papers: paginatedPapers,
      relatedQueries: [`${query} survey`, `${query} tutorial`, `recent advances in ${query}`],
      currentPage: page,
      totalPages: Math.ceil(sortedPapers.length / limit),
      hasNextPage: endIndex < sortedPapers.length,
      hasPreviousPage: page > 1
    };
    
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}


function sortPapers(papers: ResearchPaper[], sortBy: string): ResearchPaper[] {
  switch (sortBy) {
    case 'citations':
      return [...papers].sort((a, b) => b.citations - a.citations);
    case 'date':
      return [...papers].sort((a, b) => b.year - a.year);
    case 'impact':
      return [...papers].sort((a, b) => (b.citations / (2024 - b.year + 1)) - (a.citations / (2024 - a.year + 1)));
    default:
      return papers;
  }
}

export function getMostCitedPapers(limit: number = 5): ResearchPaper[] {
  return [];
}

export function getTrendingPapers(limit: number = 5): ResearchPaper[] {
  return [];
}

export function getRelatedPapers(paper: ResearchPaper, allPapers: ResearchPaper[] = [], limit: number = 3): ResearchPaper[] {
  return allPapers.filter(p => p.id !== paper.id && p.keywords.some(k => paper.keywords.includes(k))).slice(0, limit);
}

export function analyzePaperCitations(paper: ResearchPaper): CitationAnalysis {
  return {
    paper,
    whyCited: `Influential work in ${paper.keywords[0] || 'AI/ML'} published in ${paper.venue}.`,
    keyContributions: [`Research on ${paper.keywords.slice(0, 2).join(' and ')}`, `${paper.citations} citations`],
    impactAreas: paper.keywords.slice(0, 3),
    relatedPapers: []
  };
}

export function getTrendingTopics(): TrendingTopic[] {
  return [
    { topic: 'Large Language Models', paperCount: 1500, growthRate: 45, topPapers: [] },
    { topic: 'Computer Vision', paperCount: 2000, growthRate: 35, topPapers: [] },
    { topic: 'Reinforcement Learning', paperCount: 800, growthRate: 30, topPapers: [] }
  ];
}

export function getPaperStats() {
  return {
    totalPapers: 50000,
    totalCitations: 5000000,
    avgCitations: 100,
    highImpactPapers: 500,
    venues: ['arXiv', 'NeurIPS', 'ICML'],
    yearRange: { min: 2010, max: 2024 }
  };
}
