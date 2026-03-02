import type { 
  ResearchPaper, 
  AuthorProfile, 
  VenueInfo, 
  SearchFilters, 
  ResearchMetrics,
  ConferenceRanking,
  JournalMetrics,
  PublicationType
} from '@/types';

// Enhanced paper database with full metadata
export const enhancedPapersDB: ResearchPaper[] = [];

// Author profiles database
export const authorsDB: AuthorProfile[] = [
  {
    id: 'hinton-g',
    name: 'Geoffrey Hinton',
    affiliation: 'University of Toronto & Google DeepMind',
    hIndex: 175,
    i10Index: 450,
    totalCitations: 580000,
    citationsPerYear: [
      { year: 2023, count: 45000 },
      { year: 2022, count: 42000 },
      { year: 2021, count: 38000 }
    ],
    interests: ['Deep Learning', 'Neural Networks', 'AI'],
    publications: 280,
    coAuthors: ['Yann LeCun', 'Yoshua Bengio', 'Alex Krizhevsky'],
    topPapers: [],
    googleScholarId: 'JicYPdAAAAAJ',
    orcid: '0000-0002-8687-2674'
  },
  {
    id: 'lecun-y',
    name: 'Yann LeCun',
    affiliation: 'New York University & Meta AI',
    hIndex: 168,
    i10Index: 420,
    totalCitations: 520000,
    citationsPerYear: [
      { year: 2023, count: 40000 },
      { year: 2022, count: 38000 },
      { year: 2021, count: 35000 }
    ],
    interests: ['Computer Vision', 'Deep Learning', 'AI'],
    publications: 260,
    coAuthors: ['Geoffrey Hinton', 'Yoshua Bengio'],
    topPapers: [],
    googleScholarId: 'WLN3QrAAAAAJ'
  },
  {
    id: 'bengio-y',
    name: 'Yoshua Bengio',
    affiliation: 'University of Montreal & Mila',
    hIndex: 172,
    i10Index: 440,
    totalCitations: 550000,
    citationsPerYear: [
      { year: 2023, count: 43000 },
      { year: 2022, count: 40000 },
      { year: 2021, count: 37000 }
    ],
    interests: ['Deep Learning', 'NLP', 'AI Safety'],
    publications: 290,
    coAuthors: ['Geoffrey Hinton', 'Yann LeCun'],
    topPapers: [],
    googleScholarId: 'kukA0LcAAAAJ'
  }
];

// Venue/Conference database
export const venuesDB: VenueInfo[] = [
  {
    id: 'neurips',
    name: 'Conference on Neural Information Processing Systems',
    acronym: 'NeurIPS',
    type: 'conference',
    rank: 'A*',
    hIndex: 285,
    publisher: 'NeurIPS Foundation',
    subjects: ['Machine Learning', 'AI', 'Neural Networks'],
    acceptanceRate: 21,
    url: 'https://neurips.cc',
    isCore: true,
    isScopusIndexed: true,
    isWebOfScience: true
  },
  {
    id: 'cvpr',
    name: 'Conference on Computer Vision and Pattern Recognition',
    acronym: 'CVPR',
    type: 'conference',
    rank: 'A*',
    hIndex: 298,
    publisher: 'IEEE',
    subjects: ['Computer Vision', 'Pattern Recognition', 'AI'],
    acceptanceRate: 25,
    url: 'https://cvpr.thecvf.com',
    isCore: true,
    isScopusIndexed: true,
    isWebOfScience: true
  },
  {
    id: 'icml',
    name: 'International Conference on Machine Learning',
    acronym: 'ICML',
    type: 'conference',
    rank: 'A*',
    hIndex: 265,
    publisher: 'PMLR',
    subjects: ['Machine Learning', 'AI'],
    acceptanceRate: 22,
    url: 'https://icml.cc',
    isCore: true,
    isScopusIndexed: true,
    isWebOfScience: true
  },
  {
    id: 'nature',
    name: 'Nature',
    type: 'journal',
    rank: 'A*',
    quartile: 'Q1',
    impactFactor: 64.8,
    hIndex: 1250,
    publisher: 'Springer Nature',
    issn: '0028-0836',
    subjects: ['Multidisciplinary Science'],
    url: 'https://www.nature.com',
    isScopusIndexed: true,
    isWebOfScience: true
  },
  {
    id: 'jmlr',
    name: 'Journal of Machine Learning Research',
    acronym: 'JMLR',
    type: 'journal',
    rank: 'A*',
    quartile: 'Q1',
    impactFactor: 6.1,
    hIndex: 198,
    publisher: 'JMLR.org',
    issn: '1533-7928',
    subjects: ['Machine Learning', 'AI'],
    url: 'https://jmlr.org',
    isScopusIndexed: true,
    isWebOfScience: true
  }
];

// Conference rankings (CORE, GGS Rating)
export const conferenceRankings: ConferenceRanking[] = [
  { name: 'NeurIPS', acronym: 'NIPS', rank: 'A*', field: 'Artificial Intelligence', source: 'CORE' },
  { name: 'CVPR', acronym: 'CVPR', rank: 'A*', field: 'Computer Vision', source: 'CORE' },
  { name: 'ICML', acronym: 'ICML', rank: 'A*', field: 'Machine Learning', source: 'CORE' },
  { name: 'ICLR', acronym: 'ICLR', rank: 'A*', field: 'Deep Learning', source: 'CORE' },
  { name: 'ACL', acronym: 'ACL', rank: 'A*', field: 'Natural Language Processing', source: 'CORE' },
  { name: 'AAAI', acronym: 'AAAI', rank: 'A*', field: 'Artificial Intelligence', source: 'CORE' },
  { name: 'IJCAI', acronym: 'IJCAI', rank: 'A*', field: 'Artificial Intelligence', source: 'CORE' },
  { name: 'ECCV', acronym: 'ECCV', rank: 'A', field: 'Computer Vision', source: 'CORE' },
  { name: 'ICCV', acronym: 'ICCV', rank: 'A*', field: 'Computer Vision', source: 'CORE' },
  { name: 'KDD', acronym: 'KDD', rank: 'A*', field: 'Data Mining', source: 'CORE' }
];

// Journal metrics
export const journalMetrics: JournalMetrics[] = [
  { name: 'Nature', impactFactor: 64.8, quartile: 'Q1', hIndex: 1250, sjr: 18.5, citescore: 87.2 },
  { name: 'Science', impactFactor: 56.9, quartile: 'Q1', hIndex: 1180, sjr: 17.8, citescore: 82.1 },
  { name: 'JMLR', impactFactor: 6.1, quartile: 'Q1', hIndex: 198, sjr: 4.2, citescore: 12.5 },
  { name: 'IEEE TPAMI', impactFactor: 24.3, quartile: 'Q1', hIndex: 285, sjr: 8.9, citescore: 38.6 },
  { name: 'Neural Computation', impactFactor: 3.2, quartile: 'Q2', hIndex: 145, sjr: 1.8, citescore: 6.4 }
];

// Advanced search with filters
export function advancedSearch(
  query: string,
  filters: Partial<SearchFilters> = {},
  limit: number = 10
): ResearchPaper[] {
  let results = [...enhancedPapersDB];
  
  // If no query provided, return all papers with filters applied
  if (!query || query.trim() === '') {
    // Apply filters only
    if (filters.yearFrom) {
      results = results.filter(p => p.year >= filters.yearFrom!);
    }
    if (filters.yearTo) {
      results = results.filter(p => p.year <= filters.yearTo!);
    }
    if (filters.minCitations) {
      results = results.filter(p => p.citations >= filters.minCitations!);
    }
    if (filters.publicationType && filters.publicationType.length > 0) {
      results = results.filter(p => filters.publicationType!.includes(p.venueType));
    }
    if (filters.accessType && filters.accessType.length > 0) {
      results = results.filter(p => p.accessType && filters.accessType!.includes(p.accessType));
    }
    if (filters.openAccessOnly) {
      results = results.filter(p => p.accessType === 'open');
    }
    
    // Sort by selected criteria
    const sortBy = filters.sortBy || 'citations';
    if (sortBy === 'citations') {
      results.sort((a, b) => b.citations - a.citations);
    } else if (sortBy === 'date') {
      results.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'impact') {
      results.sort((a, b) => (b.fieldWeightedCitationImpact || 0) - (a.fieldWeightedCitationImpact || 0));
    }
    
    return results.slice(0, limit);
  }

  // Apply filters
  if (filters.yearFrom) {
    results = results.filter(p => p.year >= filters.yearFrom!);
  }
  if (filters.yearTo) {
    results = results.filter(p => p.year <= filters.yearTo!);
  }
  if (filters.minCitations) {
    results = results.filter(p => p.citations >= filters.minCitations!);
  }
  if (filters.publicationType && filters.publicationType.length > 0) {
    results = results.filter(p => filters.publicationType!.includes(p.venueType));
  }
  if (filters.accessType && filters.accessType.length > 0) {
    results = results.filter(p => p.accessType && filters.accessType!.includes(p.accessType));
  }
  if (filters.openAccessOnly) {
    results = results.filter(p => p.accessType === 'open');
  }

  // Search and score
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 2);

  const scored = results.map(paper => {
    let score = 0;
    const titleLower = paper.title.toLowerCase();
    const abstractLower = paper.abstract.toLowerCase();
    const keywordsLower = paper.keywords.join(' ').toLowerCase();

    if (titleLower.includes(lowerQuery)) score += 100;
    keywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 20;
      if (keywordsLower.includes(keyword)) score += 15;
      if (abstractLower.includes(keyword)) score += 5;
    });

    if (paper.citations > 50000) score += 10;
    else if (paper.citations > 10000) score += 5;

    return { paper, score };
  });

  // Sort by selected criteria
  const sortBy = filters.sortBy || 'relevance';
  if (sortBy === 'citations') {
    scored.sort((a, b) => b.paper.citations - a.paper.citations);
  } else if (sortBy === 'date') {
    scored.sort((a, b) => b.paper.year - a.paper.year);
  } else if (sortBy === 'impact') {
    scored.sort((a, b) => (b.paper.fieldWeightedCitationImpact || 0) - (a.paper.fieldWeightedCitationImpact || 0));
  } else {
    scored.sort((a, b) => b.score - a.score);
  }

  return scored.filter(item => item.score > 0).slice(0, limit).map(item => item.paper);
}

// Search by publication type
export function searchByType(type: PublicationType, limit: number = 10): ResearchPaper[] {
  return enhancedPapersDB
    .filter(p => p.venueType === type)
    .sort((a, b) => b.citations - a.citations)
    .slice(0, limit);
}

// Get author profile
export function getAuthorProfile(authorId: string): AuthorProfile | undefined {
  return authorsDB.find(a => a.id === authorId);
}

// Search authors
export function searchAuthors(query: string): AuthorProfile[] {
  const lowerQuery = query.toLowerCase();
  return authorsDB.filter(a => 
    a.name.toLowerCase().includes(lowerQuery) ||
    a.affiliation.toLowerCase().includes(lowerQuery) ||
    a.interests.some(i => i.toLowerCase().includes(lowerQuery))
  );
}

// Get venue information
export function getVenueInfo(venueId: string): VenueInfo | undefined {
  return venuesDB.find(v => v.id === venueId);
}

// Search venues
export function searchVenues(query: string): VenueInfo[] {
  const lowerQuery = query.toLowerCase();
  return venuesDB.filter(v =>
    v.name.toLowerCase().includes(lowerQuery) ||
    (v.acronym && v.acronym.toLowerCase().includes(lowerQuery)) ||
    v.subjects.some(s => s.toLowerCase().includes(lowerQuery))
  );
}

// Get conference ranking
export function getConferenceRanking(acronym: string): ConferenceRanking | undefined {
  return conferenceRankings.find(c => c.acronym.toLowerCase() === acronym.toLowerCase());
}

// Get journal metrics
export function getJournalMetrics(name: string): JournalMetrics | undefined {
  return journalMetrics.find(j => j.name.toLowerCase() === name.toLowerCase());
}

// Calculate research metrics
export function calculateMetrics(papers: ResearchPaper[]): ResearchMetrics {
  if (papers.length === 0) {
    return {
      totalPapers: 0,
      totalCitations: 0,
      hIndex: 0,
      i10Index: 0,
      avgCitationsPerPaper: 0,
      citationsByYear: [],
      papersByYear: [],
      topVenues: [],
      topKeywords: [],
      collaborationNetwork: []
    };
  }
  
  const totalPapers = papers.length;
  const totalCitations = papers.reduce((sum, p) => sum + p.citations, 0);
  const avgCitationsPerPaper = Math.floor(totalCitations / totalPapers);

  // Calculate h-index
  const sortedCitations = papers.map(p => p.citations).sort((a, b) => b - a);
  let hIndex = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    if (sortedCitations[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  // Calculate i10-index
  const i10Index = papers.filter(p => p.citations >= 10).length;

  // Citations by year
  const citationsByYear: { year: number; count: number }[] = [];
  const papersByYear: { year: number; count: number }[] = [];
  
  const yearMap = new Map<number, number>();
  const paperYearMap = new Map<number, number>();
  
  papers.forEach(p => {
    yearMap.set(p.year, (yearMap.get(p.year) || 0) + p.citations);
    paperYearMap.set(p.year, (paperYearMap.get(p.year) || 0) + 1);
  });

  yearMap.forEach((count, year) => citationsByYear.push({ year, count }));
  paperYearMap.forEach((count, year) => papersByYear.push({ year, count }));

  citationsByYear.sort((a, b) => a.year - b.year);
  papersByYear.sort((a, b) => a.year - b.year);

  // Top venues
  const venueMap = new Map<string, number>();
  papers.forEach(p => venueMap.set(p.venue, (venueMap.get(p.venue) || 0) + 1));
  const topVenues = Array.from(venueMap.entries())
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top keywords
  const keywordMap = new Map<string, number>();
  papers.forEach(p => p.keywords.forEach(k => keywordMap.set(k, (keywordMap.get(k) || 0) + 1)));
  const topKeywords = Array.from(keywordMap.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Collaboration network (simplified)
  const authorMap = new Map<string, number>();
  papers.forEach(p => p.authors.forEach(a => authorMap.set(a, (authorMap.get(a) || 0) + 1)));
  const collaborationNetwork = Array.from(authorMap.entries())
    .map(([author, papers]) => ({ author, papers }))
    .sort((a, b) => b.papers - a.papers)
    .slice(0, 10);

  return {
    totalPapers,
    totalCitations,
    hIndex,
    i10Index,
    avgCitationsPerPaper,
    citationsByYear,
    papersByYear,
    topVenues,
    topKeywords,
    collaborationNetwork
  };
}

// Get papers by venue rank
export function getPapersByVenueRank(rank: 'A*' | 'A' | 'B' | 'C'): ResearchPaper[] {
  const rankedVenues = venuesDB.filter(v => v.rank === rank).map(v => v.acronym || v.name);
  return enhancedPapersDB.filter(p => rankedVenues.some(venue => 
    p.venue.toLowerCase().includes(venue.toLowerCase()) || 
    venue.toLowerCase().includes(p.venue.toLowerCase())
  ));
}

// Get open access papers
export function getOpenAccessPapers(limit: number = 10): ResearchPaper[] {
  return enhancedPapersDB
    .filter(p => p.accessType === 'open')
    .sort((a, b) => b.citations - a.citations)
    .slice(0, limit);
}

// Export citation in different formats
export function exportCitation(paper: ResearchPaper, format: 'bibtex' | 'apa' | 'mla' | 'chicago'): string {
  const authors = paper.authors.join(', ');
  const year = paper.year;
  const title = paper.title;
  const venue = paper.venue;

  switch (format) {
    case 'bibtex':
      return `@inproceedings{${paper.id},
  title={${title}},
  author={${authors}},
  booktitle={${venue}},
  year={${year}},
  doi={${paper.doi || 'N/A'}}
}`;
    case 'apa':
      return `${authors} (${year}). ${title}. In ${venue}.`;
    case 'mla':
      return `${authors}. "${title}." ${venue}, ${year}.`;
    case 'chicago':
      return `${authors}. "${title}." ${venue} (${year}).`;
    default:
      return '';
  }
}
