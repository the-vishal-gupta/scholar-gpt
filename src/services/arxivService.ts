import type { ResearchPaper } from '@/types';

const ARXIV_API = 'http://export.arxiv.org/api/query';

// AIML categories in arXiv
const AIML_CATEGORIES = [
  'cs.AI',  // Artificial Intelligence
  'cs.LG',  // Machine Learning
  'cs.CV',  // Computer Vision
  'cs.CL',  // Computation and Language
  'cs.NE',  // Neural and Evolutionary Computing
  'stat.ML' // Machine Learning (Statistics)
];

export async function searchArxiv(query: string, maxResults = 50): Promise<ResearchPaper[]> {
  try {
    const categoryQuery = AIML_CATEGORIES.map(cat => `cat:${cat}`).join(' OR ');
    const searchQuery = `all:${encodeURIComponent(query)} AND (${categoryQuery})`;
    
    const params = new URLSearchParams({
      search_query: searchQuery,
      start: '0',
      max_results: maxResults.toString(),
      sortBy: 'submittedDate',
      sortOrder: 'descending'
    });

    const response = await fetch(`${ARXIV_API}?${params}`);
    const xmlText = await response.text();
    
    return parseArxivXML(xmlText);
  } catch (error) {
    console.error('arXiv API error:', error);
    return [];
  }
}

function parseArxivXML(xml: string): ResearchPaper[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const entries = doc.querySelectorAll('entry');
  
  const papers: ResearchPaper[] = [];
  
  entries.forEach((entry, index) => {
    const id = entry.querySelector('id')?.textContent?.split('/').pop() || `arxiv-${index}`;
    const title = entry.querySelector('title')?.textContent?.trim() || '';
    const summary = entry.querySelector('summary')?.textContent?.trim() || '';
    const published = entry.querySelector('published')?.textContent || '';
    const year = new Date(published).getFullYear();
    
    const authors = Array.from(entry.querySelectorAll('author name')).map(
      author => author.textContent?.trim() || ''
    );
    
    const categories = Array.from(entry.querySelectorAll('category')).map(
      cat => cat.getAttribute('term') || ''
    );
    
    const pdfLink = Array.from(entry.querySelectorAll('link')).find(
      link => link.getAttribute('title') === 'pdf'
    );
    
    papers.push({
      id: `arxiv-${id}`,
      title,
      authors,
      year,
      venue: 'arXiv',
      venueType: 'preprint',
      citations: 0, // arXiv doesn't provide citation counts
      abstract: summary,
      keywords: categories.filter(cat => AIML_CATEGORIES.includes(cat)),
      url: entry.querySelector('id')?.textContent || '',
      pdfUrl: pdfLink?.getAttribute('href') || undefined
    });
  });
  
  return papers;
}
