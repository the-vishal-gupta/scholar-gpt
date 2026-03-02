// Message and Conversation Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  papers?: ResearchPaper[];
  authors?: AuthorProfile[];
  venues?: VenueInfo[];
  metrics?: ResearchMetrics;
  isStreaming?: boolean;
  type?: 'general' | 'paper_search' | 'paper_analysis' | 'trending' | 'author_search' | 'venue_search' | 'metrics';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

// Publication Types
export type PublicationType = 'conference' | 'journal' | 'book' | 'chapter' | 'preprint' | 'workshop' | 'thesis';
export type AccessType = 'open' | 'subscription' | 'hybrid';

// Research Paper Types
export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  authorIds?: string[];
  abstract: string;
  year: number;
  citations: number;
  venue: string;
  venueType: PublicationType;
  url: string;
  pdfUrl?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  keywords: string[];
  impact?: 'high' | 'medium' | 'low';
  accessType?: AccessType;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  citationsPerYear?: number;
  hIndex?: number;
  fieldWeightedCitationImpact?: number;
  references?: string[];
  relatedPapers?: string[];
}

export interface PaperSearchResult {
  query: string;
  totalResults: number;
  papers: ResearchPaper[];
  relatedQueries: string[];
  filters?: SearchFilters;
}

// Author Profile
export interface AuthorProfile {
  id: string;
  name: string;
  affiliation: string;
  email?: string;
  hIndex: number;
  i10Index: number;
  totalCitations: number;
  citationsPerYear: { year: number; count: number }[];
  interests: string[];
  publications: number;
  coAuthors: string[];
  topPapers: ResearchPaper[];
  profileUrl?: string;
  orcid?: string;
  googleScholarId?: string;
  scopusId?: string;
}

// Venue Information
export interface VenueInfo {
  id: string;
  name: string;
  acronym?: string;
  type: PublicationType;
  rank?: 'A*' | 'A' | 'B' | 'C';
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  impactFactor?: number;
  hIndex?: number;
  publisher: string;
  issn?: string;
  subjects: string[];
  acceptanceRate?: number;
  url?: string;
  isCore?: boolean;
  isScopusIndexed?: boolean;
  isWebOfScience?: boolean;
}

// Search Types
export interface SearchFilters {
  yearFrom?: number;
  yearTo?: number;
  minCitations?: number;
  maxCitations?: number;
  publicationType?: PublicationType[];
  accessType?: AccessType[];
  venueRank?: ('A*' | 'A' | 'B' | 'C')[];
  quartile?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[];
  sortBy: 'relevance' | 'citations' | 'date' | 'impact';
  openAccessOnly?: boolean;
  peerReviewedOnly?: boolean;
  authorName?: string;
}

// Metrics and Analytics
export interface ResearchMetrics {
  totalPapers: number;
  totalCitations: number;
  hIndex: number;
  i10Index: number;
  avgCitationsPerPaper: number;
  citationsByYear: { year: number; count: number }[];
  papersByYear: { year: number; count: number }[];
  topVenues: { venue: string; count: number }[];
  topKeywords: { keyword: string; count: number }[];
  collaborationNetwork: { author: string; papers: number }[];
}

// Conference Rankings
export interface ConferenceRanking {
  name: string;
  acronym: string;
  rank: 'A*' | 'A' | 'B' | 'C';
  field: string;
  source: 'CORE' | 'GGS' | 'Qualis';
}

// Journal Metrics
export interface JournalMetrics {
  name: string;
  impactFactor: number;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  hIndex: number;
  sjr: number;
  citescore: number;
}

// UI Types
export interface QuickAction {
  icon: string;
  label: string;
  query: string;
  type: 'search' | 'analysis' | 'trending';
}

// Citation Analysis
export interface CitationAnalysis {
  paper: ResearchPaper;
  whyCited: string;
  keyContributions: string[];
  impactAreas: string[];
  relatedPapers: ResearchPaper[];
  citationTrend?: { year: number; count: number }[];
}

// Trending Research
export interface TrendingTopic {
  topic: string;
  paperCount: number;
  growthRate: number;
  topPapers: ResearchPaper[];
}

// Collaboration Types
export interface SharedCollection {
  id: string;
  name: string;
  description: string;
  papers: ResearchPaper[];
  createdBy: string;
  collaborators: string[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationActivity {
  id: string;
  type: 'comment' | 'share' | 'edit' | 'paper_added' | 'author_added' | 'collection_shared' | 'comment_added';
  user: string;
  content: string;
  timestamp: Date;
}
