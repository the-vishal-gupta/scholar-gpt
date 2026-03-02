import { ResearchPaper, AuthorProfile } from '@/types';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  researchInterests: string[];
  favoriteVenues: string[];
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultSearchSort: 'relevance' | 'citations' | 'date' | 'impact';
  resultsPerPage: number;
  showAbstractByDefault: boolean;
  enableNotifications: boolean;
  autoSaveSearches: boolean;
  preferredCitationFormat: 'bibtex' | 'apa' | 'mla' | 'ris';
}

export interface UserActivity {
  papersViewed: string[];
  authorsFollowed: string[];
  savedSearches: SavedSearch[];
  readingLists: ReadingList[];
  recentActivity: ActivityItem[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: Date;
  lastUsed: Date;
  resultCount: number;
}

export interface ReadingList {
  id: string;
  name: string;
  description: string;
  papers: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityItem {
  id: string;
  type: 'search' | 'view_paper' | 'save_paper' | 'follow_author' | 'create_list';
  description: string;
  timestamp: Date;
  metadata?: any;
}

class UserProfileService {
  private currentUser: UserProfile | null = null;
  private userActivity: UserActivity | null = null;

  constructor() {
    this.loadUserProfile();
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  createProfile(name: string, email?: string): UserProfile {
    const profile: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      researchInterests: [],
      favoriteVenues: [],
      preferences: this.getDefaultPreferences(),
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.currentUser = profile;
    this.userActivity = this.getDefaultActivity();
    this.saveUserProfile();
    return profile;
  }

  updateProfile(updates: Partial<UserProfile>): void {
    if (!this.currentUser) return;
    
    this.currentUser = { ...this.currentUser, ...updates, lastActive: new Date() };
    this.saveUserProfile();
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    if (!this.currentUser) return;
    
    this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
    this.saveUserProfile();
  }

  addResearchInterest(interest: string): void {
    if (!this.currentUser || this.currentUser.researchInterests.includes(interest)) return;
    
    this.currentUser.researchInterests.push(interest);
    this.saveUserProfile();
  }

  removeResearchInterest(interest: string): void {
    if (!this.currentUser) return;
    
    this.currentUser.researchInterests = this.currentUser.researchInterests.filter(i => i !== interest);
    this.saveUserProfile();
  }

  saveSearch(name: string, query: string, filters: any, resultCount: number): void {
    if (!this.userActivity) return;

    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      createdAt: new Date(),
      lastUsed: new Date(),
      resultCount
    };

    this.userActivity.savedSearches.unshift(savedSearch);
    this.userActivity.savedSearches = this.userActivity.savedSearches.slice(0, 20);
    this.addActivity('search', `Saved search: ${name}`);
    this.saveUserProfile();
  }

  createReadingList(name: string, description: string, isPublic = false): ReadingList {
    if (!this.userActivity) throw new Error('No user activity found');

    const readingList: ReadingList = {
      id: Date.now().toString(),
      name,
      description,
      papers: [],
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.userActivity.readingLists.push(readingList);
    this.addActivity('create_list', `Created reading list: ${name}`);
    this.saveUserProfile();
    return readingList;
  }

  addPaperToList(listId: string, paperId: string): void {
    if (!this.userActivity) return;

    const list = this.userActivity.readingLists.find(l => l.id === listId);
    if (list && !list.papers.includes(paperId)) {
      list.papers.push(paperId);
      list.updatedAt = new Date();
      this.addActivity('save_paper', `Added paper to ${list.name}`);
      this.saveUserProfile();
    }
  }

  getPersonalizedRecommendations(papers: ResearchPaper[]): ResearchPaper[] {
    if (!this.currentUser || this.currentUser.researchInterests.length === 0) {
      return papers.slice(0, 10);
    }

    const interests = this.currentUser.researchInterests.map(i => i.toLowerCase());
    
    return papers
      .map(paper => ({
        paper,
        score: this.calculateRelevanceScore(paper, interests)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.paper);
  }

  private calculateRelevanceScore(paper: ResearchPaper, interests: string[]): number {
    let score = 0;
    const paperText = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`.toLowerCase();
    
    interests.forEach(interest => {
      if (paperText.includes(interest)) {
        score += 10;
      }
    });

    // Boost score for favorite venues
    if (this.currentUser?.favoriteVenues.includes(paper.venue)) {
      score += 5;
    }

    // Boost score for recent papers
    if (paper.year >= new Date().getFullYear() - 2) {
      score += 3;
    }

    // Boost score for highly cited papers
    if (paper.citations > 1000) {
      score += Math.log10(paper.citations);
    }

    return score;
  }

  private addActivity(type: ActivityItem['type'], description: string, metadata?: any): void {
    if (!this.userActivity) return;

    const activity: ActivityItem = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date(),
      metadata
    };

    this.userActivity.recentActivity.unshift(activity);
    this.userActivity.recentActivity = this.userActivity.recentActivity.slice(0, 100);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      defaultSearchSort: 'relevance',
      resultsPerPage: 10,
      showAbstractByDefault: false,
      enableNotifications: true,
      autoSaveSearches: true,
      preferredCitationFormat: 'bibtex'
    };
  }

  private getDefaultActivity(): UserActivity {
    return {
      papersViewed: [],
      authorsFollowed: [],
      savedSearches: [],
      readingLists: [],
      recentActivity: []
    };
  }

  private loadUserProfile(): void {
    try {
      const saved = localStorage.getItem('user-profile');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentUser = {
          ...data.profile,
          createdAt: new Date(data.profile.createdAt),
          lastActive: new Date(data.profile.lastActive)
        };
        this.userActivity = {
          ...data.activity,
          savedSearches: data.activity.savedSearches.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastUsed: new Date(s.lastUsed)
          })),
          readingLists: data.activity.readingLists.map((l: any) => ({
            ...l,
            createdAt: new Date(l.createdAt),
            updatedAt: new Date(l.updatedAt)
          })),
          recentActivity: data.activity.recentActivity.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
        };
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private saveUserProfile(): void {
    try {
      if (this.currentUser && this.userActivity) {
        localStorage.setItem('user-profile', JSON.stringify({
          profile: this.currentUser,
          activity: this.userActivity
        }));
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  getSavedSearches(): SavedSearch[] {
    return this.userActivity?.savedSearches || [];
  }

  getReadingLists(): ReadingList[] {
    return this.userActivity?.readingLists || [];
  }

  getRecentActivity(): ActivityItem[] {
    return this.userActivity?.recentActivity || [];
  }
}

export const userProfileService = new UserProfileService();