import { ResearchPaper } from '@/types';

export type CitationFormat = 'bibtex' | 'endnote' | 'ris' | 'apa' | 'mla';

class CitationExportService {
  exportToBibTeX(paper: ResearchPaper): string {
    const type = paper.venueType === 'journal' ? 'article' : 'inproceedings';
    const key = this.generateCitationKey(paper);
    
    let bibtex = `@${type}{${key},\n`;
    bibtex += `  title={${paper.title}},\n`;
    bibtex += `  author={${paper.authors.join(' and ')}},\n`;
    
    if (paper.venueType === 'journal') {
      bibtex += `  journal={${paper.venue}},\n`;
    } else {
      bibtex += `  booktitle={${paper.venue}},\n`;
    }
    
    bibtex += `  year={${paper.year}},\n`;
    
    if (paper.abstract) {
      bibtex += `  abstract={${paper.abstract}},\n`;
    }
    
    if (paper.url) {
      bibtex += `  url={${paper.url}},\n`;
    }
    
    bibtex += `}\n`;
    
    return bibtex;
  }

  exportToRIS(paper: ResearchPaper): string {
    let ris = '';
    ris += `TY  - ${paper.venueType === 'journal' ? 'JOUR' : 'CONF'}\n`;
    ris += `TI  - ${paper.title}\n`;
    
    paper.authors.forEach(author => {
      ris += `AU  - ${author}\n`;
    });
    
    if (paper.venueType === 'journal') {
      ris += `JO  - ${paper.venue}\n`;
    } else {
      ris += `T2  - ${paper.venue}\n`;
    }
    
    ris += `PY  - ${paper.year}\n`;
    
    if (paper.abstract) {
      ris += `AB  - ${paper.abstract}\n`;
    }
    
    if (paper.url) {
      ris += `UR  - ${paper.url}\n`;
    }
    
    paper.keywords.forEach(keyword => {
      ris += `KW  - ${keyword}\n`;
    });
    
    ris += `ER  - \n\n`;
    
    return ris;
  }

  exportToEndNote(paper: ResearchPaper): string {
    let endnote = '';
    endnote += `%0 ${paper.venueType === 'journal' ? 'Journal Article' : 'Conference Paper'}\n`;
    endnote += `%T ${paper.title}\n`;
    
    paper.authors.forEach(author => {
      endnote += `%A ${author}\n`;
    });
    
    if (paper.venueType === 'journal') {
      endnote += `%J ${paper.venue}\n`;
    } else {
      endnote += `%B ${paper.venue}\n`;
    }
    
    endnote += `%D ${paper.year}\n`;
    
    if (paper.abstract) {
      endnote += `%X ${paper.abstract}\n`;
    }
    
    if (paper.url) {
      endnote += `%U ${paper.url}\n`;
    }
    
    paper.keywords.forEach(keyword => {
      endnote += `%K ${keyword}\n`;
    });
    
    return endnote;
  }

  exportToAPA(paper: ResearchPaper): string {
    const authors = this.formatAuthorsAPA(paper.authors);
    const title = paper.title.endsWith('.') ? paper.title : `${paper.title}.`;
    
    if (paper.venueType === 'journal') {
      return `${authors} (${paper.year}). ${title} *${paper.venue}*.`;
    } else {
      return `${authors} (${paper.year}). ${title} In *${paper.venue}*.`;
    }
  }

  exportToMLA(paper: ResearchPaper): string {
    const authors = this.formatAuthorsMLA(paper.authors);
    const title = `"${paper.title}."`;
    
    if (paper.venueType === 'journal') {
      return `${authors} ${title} *${paper.venue}*, ${paper.year}.`;
    } else {
      return `${authors} ${title} *${paper.venue}*, ${paper.year}.`;
    }
  }

  exportMultiplePapers(papers: ResearchPaper[], format: CitationFormat): string {
    return papers.map(paper => this.exportPaper(paper, format)).join('\n');
  }

  exportPaper(paper: ResearchPaper, format: CitationFormat): string {
    switch (format) {
      case 'bibtex': return this.exportToBibTeX(paper);
      case 'ris': return this.exportToRIS(paper);
      case 'endnote': return this.exportToEndNote(paper);
      case 'apa': return this.exportToAPA(paper);
      case 'mla': return this.exportToMLA(paper);
      default: return this.exportToBibTeX(paper);
    }
  }

  downloadCitation(paper: ResearchPaper, format: CitationFormat) {
    const citation = this.exportPaper(paper, format);
    const filename = `${this.generateCitationKey(paper)}.${this.getFileExtension(format)}`;
    
    this.downloadFile(citation, filename, this.getMimeType(format));
  }

  downloadMultipleCitations(papers: ResearchPaper[], format: CitationFormat) {
    const citations = this.exportMultiplePapers(papers, format);
    const filename = `citations_${Date.now()}.${this.getFileExtension(format)}`;
    
    this.downloadFile(citations, filename, this.getMimeType(format));
  }

  private generateCitationKey(paper: ResearchPaper): string {
    const firstAuthor = paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'unknown';
    const year = paper.year;
    const titleWords = paper.title.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 2);
    
    return `${firstAuthor}${year}${titleWords.join('')}`.replace(/[^a-z0-9]/g, '');
  }

  private formatAuthorsAPA(authors: string[]): string {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    
    const lastAuthor = authors[authors.length - 1];
    const otherAuthors = authors.slice(0, -1).join(', ');
    return `${otherAuthors}, & ${lastAuthor}`;
  }

  private formatAuthorsMLA(authors: string[]): string {
    if (authors.length === 1) return `${authors[0]}.`;
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}.`;
    
    return `${authors[0]}, et al.`;
  }

  private getFileExtension(format: CitationFormat): string {
    switch (format) {
      case 'bibtex': return 'bib';
      case 'ris': return 'ris';
      case 'endnote': return 'enw';
      case 'apa':
      case 'mla': return 'txt';
      default: return 'txt';
    }
  }

  private getMimeType(format: CitationFormat): string {
    switch (format) {
      case 'bibtex': return 'application/x-bibtex';
      case 'ris': return 'application/x-research-info-systems';
      case 'endnote': return 'application/x-endnote-refer';
      default: return 'text/plain';
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export const citationExportService = new CitationExportService();