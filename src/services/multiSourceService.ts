import type { ResearchPaper } from '@/types';
import { searchArxiv } from './arxivService';
import { searchOpenAlex } from './openAlexService';
import { searchCore } from './coreService';

export async function searchMultiSource(query: string, sortBy: 'date' | 'citations' = 'date', authorName?: string): Promise<ResearchPaper[]> {
  try {
    // Search all sources in parallel
    const [arxivResults, openAlexResults, coreResults] = await Promise.allSettled([
      searchArxiv(query, 30),
      searchOpenAlex(query, 30, sortBy, authorName),
      searchCore(query, 20)
    ]);

    // Collect successful results
    const allPapers: ResearchPaper[] = [];
    
    if (arxivResults.status === 'fulfilled') {
      allPapers.push(...arxivResults.value);
    }
    
    if (openAlexResults.status === 'fulfilled') {
      allPapers.push(...openAlexResults.value);
    }
    
    if (coreResults.status === 'fulfilled') {
      allPapers.push(...coreResults.value);
    }

    // Deduplicate by title similarity
    const uniquePapers = deduplicatePapers(allPapers);
    
    // Sort based on preference
    if (sortBy === 'citations') {
      return uniquePapers.sort((a, b) => b.citations - a.citations);
    } else {
      // Sort by year (newest first) and citations
      return uniquePapers.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.citations - a.citations;
      });
    }
  } catch (error) {
    console.error('Multi-source search error:', error);
    return [];
  }
}

function deduplicatePapers(papers: ResearchPaper[]): ResearchPaper[] {
  const seen = new Map<string, ResearchPaper>();
  
  for (const paper of papers) {
    const normalizedTitle = paper.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, paper);
    } else {
      // Keep the one with more citations
      const existing = seen.get(normalizedTitle)!;
      if (paper.citations > existing.citations) {
        seen.set(normalizedTitle, paper);
      }
    }
  }
  
  return Array.from(seen.values());
}

// Cache for search results
const searchCache = new Map<string, { papers: ResearchPaper[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchWithCache(query: string, sortBy: 'date' | 'citations' = 'date', authorName?: string): Promise<ResearchPaper[]> {
  const cacheKey = `${query}-${sortBy}-${authorName || ''}`;
  const cached = searchCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.papers;
  }
  
  const papers = await searchMultiSource(query, sortBy, authorName);
  searchCache.set(cacheKey, { papers, timestamp: Date.now() });
  
  return papers;
}
