import type { ResearchMetrics } from '@/types';
import { mockAuthorsDB } from './authorService';

export function getResearchMetrics(): ResearchMetrics {
  const papers: any[] = [];
  const totalCitations = 0;
  
  // Citations by year
  const citationsByYear: { year: number; count: number }[] = [];

  // Papers by year
  const papersByYear: { year: number; count: number }[] = [];

  // Top venues
  const topVenues: { venue: string; count: number }[] = [];

  // Top keywords
  const topKeywords: { keyword: string; count: number }[] = [];

  // Collaboration network (simplified)
  const collaborationNetwork = [
    { author: 'Geoffrey Hinton', papers: 45 },
    { author: 'Yann LeCun', papers: 38 },
    { author: 'Yoshua Bengio', papers: 42 },
    { author: 'Andrew Ng', papers: 28 },
    { author: 'Ian Goodfellow', papers: 25 }
  ];

  return {
    totalPapers: 0,
    totalCitations: 0,
    hIndex: 0,
    i10Index: 0,
    avgCitationsPerPaper: 0,
    citationsByYear,
    papersByYear,
    topVenues,
    topKeywords,
    collaborationNetwork
  };
}

function calculateHIndex(papers: any[]): number {
  const sortedCitations = papers
    .map(p => p.citations)
    .sort((a, b) => b - a);
  
  let hIndex = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    if (sortedCitations[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }
  return hIndex;
}

export function getFieldMetrics(field: string): ResearchMetrics {
  return getResearchMetrics();
}