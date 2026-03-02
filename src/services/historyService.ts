import type { ResearchPaper, AuthorProfile, Conversation } from '@/types';

export interface HistoryItem {
  id: string;
  type: 'search' | 'paper_view' | 'author_view' | 'conversation';
  title: string;
  timestamp: Date;
  data?: any;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultsCount: number;
  papers?: ResearchPaper[];
}

export interface ViewHistory {
  itemId: string;
  itemType: 'paper' | 'author';
  title: string;
  timestamp: Date;
}

class HistoryService {
  private readonly STORAGE_KEY = 'scholarai-history';
  private readonly MAX_HISTORY_ITEMS = 100;

  getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch {
      return [];
    }
  }

  addSearchHistory(query: string, resultsCount: number, papers?: ResearchPaper[]): void {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'search',
      title: `Search: "${query}"`,
      timestamp: new Date(),
      data: { query, resultsCount, papers: papers?.slice(0, 3) }
    };
    
    this.addToHistory(historyItem);
  }

  addPaperView(paper: ResearchPaper): void {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'paper_view',
      title: paper.title,
      timestamp: new Date(),
      data: { paperId: paper.id, authors: paper.authors.slice(0, 2) }
    };
    
    this.addToHistory(historyItem);
  }

  addAuthorView(author: AuthorProfile): void {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'author_view',
      title: `Author: ${author.name}`,
      timestamp: new Date(),
      data: { authorId: author.id, affiliation: author.affiliation }
    };
    
    this.addToHistory(historyItem);
  }

  addConversationHistory(conversation: Conversation): void {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'conversation',
      title: conversation.title,
      timestamp: new Date(),
      data: { conversationId: conversation.id, messageCount: conversation.messages.length }
    };
    
    this.addToHistory(historyItem);
  }

  private addToHistory(item: HistoryItem): void {
    const history = this.getHistory();
    
    // Remove duplicate if exists (same type and similar title)
    const filtered = history.filter(h => 
      !(h.type === item.type && h.title === item.title)
    );
    
    // Add new item at the beginning
    const updated = [item, ...filtered].slice(0, this.MAX_HISTORY_ITEMS);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  getRecentSearches(limit: number = 10): SearchHistory[] {
    return this.getHistory()
      .filter(item => item.type === 'search')
      .slice(0, limit)
      .map(item => ({
        query: item.data.query,
        timestamp: item.timestamp,
        resultsCount: item.data.resultsCount,
        papers: item.data.papers
      }));
  }

  getRecentViews(limit: number = 10): ViewHistory[] {
    return this.getHistory()
      .filter(item => item.type === 'paper_view' || item.type === 'author_view')
      .slice(0, limit)
      .map(item => ({
        itemId: item.data.paperId || item.data.authorId,
        itemType: item.type === 'paper_view' ? 'paper' : 'author',
        title: item.title,
        timestamp: item.timestamp
      }));
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  getHistoryByType(type: HistoryItem['type'], limit: number = 20): HistoryItem[] {
    return this.getHistory()
      .filter(item => item.type === type)
      .slice(0, limit);
  }

  getHistoryStats() {
    const history = this.getHistory();
    const searches = history.filter(h => h.type === 'search').length;
    const paperViews = history.filter(h => h.type === 'paper_view').length;
    const authorViews = history.filter(h => h.type === 'author_view').length;
    const conversations = history.filter(h => h.type === 'conversation').length;
    
    return {
      total: history.length,
      searches,
      paperViews,
      authorViews,
      conversations,
      oldestEntry: history.length > 0 ? history[history.length - 1].timestamp : null,
      newestEntry: history.length > 0 ? history[0].timestamp : null
    };
  }
}

export const historyService = new HistoryService();