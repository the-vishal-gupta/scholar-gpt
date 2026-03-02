interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

class SmartCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats;

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) { // 5 minutes
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = { hits: 0, misses: 0, size: 0, maxSize };
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    };

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Cache search results with intelligent key generation
  cacheSearchResults(query: string, filters: any, results: any[]): void {
    const key = this.generateSearchKey(query, filters);
    this.set(key, results, 10 * 60 * 1000); // 10 minutes for search results
  }

  getCachedSearchResults(query: string, filters: any): any[] | null {
    const key = this.generateSearchKey(query, filters);
    return this.get(key);
  }

  // Cache paper details with longer TTL
  cachePaperDetails(paperId: string, details: any): void {
    this.set(`paper:${paperId}`, details, 30 * 60 * 1000); // 30 minutes
  }

  getCachedPaperDetails(paperId: string): any | null {
    return this.get(`paper:${paperId}`);
  }

  // Cache author profiles
  cacheAuthorProfile(authorId: string, profile: any): void {
    this.set(`author:${authorId}`, profile, 60 * 60 * 1000); // 1 hour
  }

  getCachedAuthorProfile(authorId: string): any | null {
    return this.get(`author:${authorId}`);
  }

  private generateSearchKey(query: string, filters: any): string {
    const filterStr = JSON.stringify(filters, Object.keys(filters).sort());
    return `search:${query.toLowerCase()}:${btoa(filterStr)}`;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }
}

// IndexedDB for persistent caching
class PersistentCacheService {
  private dbName = 'scholarai-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('papers')) {
          const paperStore = db.createObjectStore('papers', { keyPath: 'id' });
          paperStore.createIndex('venue', 'venue', { unique: false });
          paperStore.createIndex('year', 'year', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('authors')) {
          db.createObjectStore('authors', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('searches')) {
          const searchStore = db.createObjectStore('searches', { keyPath: 'key' });
          searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async cachePapers(papers: any[]): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['papers'], 'readwrite');
    const store = transaction.objectStore('papers');
    
    for (const paper of papers) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ ...paper, cachedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getCachedPapers(limit = 1000): Promise<any[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['papers'], 'readonly');
      const store = transaction.objectStore('papers');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const papers = request.result.slice(0, limit);
        resolve(papers);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchCachedPapers(query: string, limit = 100): Promise<any[]> {
    const papers = await this.getCachedPapers();
    const lowerQuery = query.toLowerCase();
    
    return papers
      .filter(paper => 
        paper.title.toLowerCase().includes(lowerQuery) ||
        paper.abstract?.toLowerCase().includes(lowerQuery) ||
        paper.keywords?.some((k: string) => k.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);
  }
}

export const smartCache = new SmartCacheService();
export const persistentCache = new PersistentCacheService();

// Initialize persistent cache
persistentCache.init().catch(console.error);