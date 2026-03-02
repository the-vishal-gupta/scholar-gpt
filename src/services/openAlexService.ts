import type { ResearchPaper } from '@/types';

const OPENALEX_API = 'https://api.openalex.org';

// AIML concept IDs in OpenAlex
const AIML_CONCEPTS = [
  'C154945302', // Artificial Intelligence
  'C119857082', // Machine Learning
  'C41008148',  // Computer Vision
  'C204321447', // Deep Learning
  'C31972630'   // Natural Language Processing
];

export async function searchOpenAlex(query: string, maxResults = 50, sortBy: 'date' | 'citations' = 'date', authorName?: string): Promise<ResearchPaper[]> {
  try {
    const conceptFilter = AIML_CONCEPTS.join('|');
    const sortParam = sortBy === 'citations' ? 'cited_by_count:desc' : 'publication_date:desc';
    
    let url = `${OPENALEX_API}/works?filter=concepts.id:${conceptFilter}`;
    
    // Add author filter if provided
    if (authorName && authorName.trim()) {
      url += `,authorships.author.display_name.search:${encodeURIComponent(authorName)}`;
    }
    
    // Add search query if provided
    if (query && query.trim()) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    
    url += `&per-page=${maxResults}&sort=${sortParam}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return parseOpenAlexResults(data.results || []);
  } catch (error) {
    console.error('OpenAlex API error:', error);
    return [];
  }
}

function parseOpenAlexResults(results: any[]): ResearchPaper[] {
  return results.map((work, index) => {
    const year = work.publication_year || new Date().getFullYear();
    const venue = work.primary_location?.source?.display_name || 'Unknown';
    const venueType = work.type === 'article' ? 'journal' : 'conference';
    
    return {
      id: `openalex-${work.id?.split('/').pop() || index}`,
      title: work.title || 'Untitled',
      authors: work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [],
      year,
      venue,
      venueType,
      citations: work.cited_by_count || 0,
      abstract: work.abstract || work.abstract_inverted_index ? 'Abstract available' : '',
      keywords: work.concepts?.slice(0, 5).map((c: any) => c.display_name) || [],
      url: work.doi ? `https://doi.org/${work.doi}` : work.id,
      pdfUrl: work.open_access?.oa_url || undefined
    };
  });
}
