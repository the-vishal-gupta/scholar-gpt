import type { ResearchPaper } from '@/types';

const CORE_API = 'https://core.ac.uk:443/api-v2/search';

export async function searchCore(query: string, maxResults = 50): Promise<ResearchPaper[]> {
  try {
    // Add AIML keywords to query
    const aimlQuery = `${query} (artificial intelligence OR machine learning OR deep learning OR neural network)`;
    
    const url = `${CORE_API}/${encodeURIComponent(aimlQuery)}?page=1&pageSize=${maxResults}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return parseCoreResults(data.data || []);
  } catch (error) {
    console.error('CORE API error:', error);
    return [];
  }
}

function parseCoreResults(results: any[]): ResearchPaper[] {
  return results.map((paper, index) => {
    const year = paper.yearPublished || new Date().getFullYear();
    
    return {
      id: `core-${paper.id || index}`,
      title: paper.title || 'Untitled',
      authors: paper.authors || [],
      year,
      venue: paper.publisher || paper.journals?.[0] || 'Unknown',
      venueType: (paper.journals?.length ? 'journal' : 'conference') as 'journal' | 'conference',
      citations: 0,
      abstract: paper.description || paper.abstract || '',
      keywords: paper.topics || [],
      url: paper.downloadUrl || paper.urls?.[0] || '',
      pdfUrl: paper.downloadUrl || undefined
    };
  }).filter(paper => paper.title !== 'Untitled');
}
