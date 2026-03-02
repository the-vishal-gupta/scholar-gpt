import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Sparkles, 
  Brain, 
  Network,
  Settings,
  Plus,
  Menu,
  ExternalLink,
  Loader2,
  Trash2,
  Copy,
  Check,
  BookOpen,
  TrendingUp,
  FileText,
  Quote,
  BarChart3,
  Search,
  Calendar,
  Award,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryPanel } from '@/components/HistoryPanel';
import { historyService } from '@/services/historyService';
import { ShareDialog } from '@/components/ShareDialog';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { AuthorCard } from '@/components/AuthorCard';
import { MetricsCard } from '@/components/MetricsCard';
import type { Message, Conversation, ResearchPaper } from '@/types';
import { 
  getMostCitedPapers, 
  getTrendingPapers,
  analyzePaperCitations,
  getTrendingTopics,
  getPaperStats,
  searchGoogleScholar
} from '@/services/scholarService';
import { searchAuthors } from '@/services/authorService';
import { getResearchMetrics, getFieldMetrics } from '@/services/metricsService';
import { advancedSearch } from '@/services/enhancedScholarService';
import type { SearchFilters } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SmartSearchInput } from '@/components/SmartSearchInput';
import { citationExportService, CitationFormat } from '@/services/citationExportService';
import { smartSearchService } from '@/services/smartSearchService';
import { UserProfilePanel } from '@/components/UserProfilePanel';
import { userProfileService } from '@/services/userProfileService';
import { usePerformanceTracking } from '@/services/performanceService';
import { deploymentService } from '@/services/deploymentService';
import { monitoringService } from '@/services/monitoringService';
import { AdminDashboard } from '@/components/AdminDashboard';

// AIML Knowledge Base for general responses
const aimlKnowledgeBase: Record<string, string> = {
  'machine learning': `Machine Learning is a subset of AI that enables systems to learn from experience. Key paradigms:

**Supervised Learning**: Training on labeled data (classification, regression)
**Unsupervised Learning**: Finding patterns in unlabeled data (clustering, dimensionality reduction)
**Reinforcement Learning**: Learning through environment interaction with rewards

Popular algorithms: Linear Regression, Random Forests, SVMs, Neural Networks`,

  'deep learning': `Deep Learning uses neural networks with multiple layers:

**CNNs**: Best for image processing and computer vision
**RNNs/LSTMs**: For sequential data like text and time series
**Transformers**: State-of-the-art for NLP (BERT, GPT, T5)
**GANs**: Generative models for creating new content

Frameworks: TensorFlow, PyTorch, JAX`,

  'neural network': `Neural Networks are computing systems inspired by biological neurons:

**Components**: Layers (Input, Hidden, Output), Activation Functions, Weights, Biases
**Training**: Forward pass → Loss calculation → Backpropagation → Weight update
**Key Concepts**: Gradient descent, Backpropagation, Regularization`,

  'nlp': `Natural Language Processing enables computers to understand human language:

**Tasks**: Tokenization, NER, Sentiment Analysis, Machine Translation, QA
**Modern Approach**: Transformer architectures with attention mechanisms
**Key Models**: BERT, GPT, T5, RoBERTa`,

  'computer vision': `Computer Vision enables machines to interpret visual information:

**Applications**: Image Classification, Object Detection, Segmentation, Face Recognition
**Techniques**: CNNs, YOLO, R-CNN, Vision Transformers
**Datasets**: ImageNet, COCO, CIFAR`,

  'transformer': `Transformers revolutionized NLP with self-attention:

**Architecture**: Encoder-Decoder with Multi-Head Attention
**Key Innovation**: Self-attention for parallel processing
**Models**: BERT (encoder), GPT (decoder), T5 (encoder-decoder)`,

  'llm': `Large Language Models are transformer-based with billions of parameters:

**Capabilities**: Text generation, reasoning, code, translation
**Key Models**: GPT-4, Claude, Llama, Gemini, Mistral
**Techniques**: Prompt engineering, RAG, Fine-tuning, Quantization`
};

// Generate response based on query type
function generateResponse(query: string): { content: string; type: 'general' | 'paper_search' | 'paper_analysis' | 'trending' | 'author_search' | 'metrics' } {
  const lowerQuery = query.toLowerCase();
  
  // Check for paper-related queries FIRST (before knowledge base)
  if (lowerQuery.includes('most cited') || lowerQuery.includes('highest cited') || lowerQuery.includes('top cited')) {
    return { content: '', type: 'paper_analysis' };
  }
  
  if (lowerQuery.includes('metrics') || lowerQuery.includes('analytics') || lowerQuery.includes('dashboard') || lowerQuery.includes('statistics')) {
    return { content: '', type: 'metrics' };
  }
  
  // If query is short (1-3 words) and doesn't have question words, assume it's a paper search
  const wordCount = lowerQuery.trim().split(/\s+/).length;
  const hasQuestionWords = /what|how|why|when|where|who|explain|tell me|show me/i.test(lowerQuery);
  
  if (wordCount <= 3 && !hasQuestionWords) {
    return { content: '', type: 'paper_search' };
  }
  
  if (lowerQuery.includes('research paper') || lowerQuery.includes('papers on') || lowerQuery.includes('find paper') || lowerQuery.includes('search paper')) {
    return { content: '', type: 'paper_search' };
  }
  
  if (lowerQuery.includes('trending') || lowerQuery.includes('latest research') || lowerQuery.includes('recent papers')) {
    return { content: '', type: 'trending' };
  }
  
  // General AIML knowledge - only if it's a question
  if (hasQuestionWords) {
    for (const [topic, content] of Object.entries(aimlKnowledgeBase)) {
      if (lowerQuery.includes(topic)) {
        return { content, type: 'general' };
      }
    }
  }
  
  // Default to paper search for short queries
  if (wordCount <= 5) {
    return { content: '', type: 'paper_search' };
  }
  
  // Default response
  return {
    content: `I can help you with AIML research! Try asking me:\n\n• "Find research papers on [topic]"\n• "What are the most cited papers in [field]?"\n• "Show me trending research in [area]"\n• "Explain [concept] in machine learning"\n\nI have access to a database of influential AIML papers with citation analysis.`,
    type: 'general'
  };
}

// Optimized Paper Card Component with React.memo
const PaperCard = memo(({ paper, onAnalyze }: { paper: ResearchPaper; onAnalyze?: (paper: ResearchPaper) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  const venueRankings = useMemo(() => ({
    'NIPS': 'A*', 'NeurIPS': 'A*', 'CVPR': 'A*', 'ICML': 'A*', 'ICLR': 'A*',
    'Nature': 'A*', 'Science': 'A*', 'JMLR': 'A*', 'IEEE TPAMI': 'A*',
    'ECCV': 'A', 'EMNLP': 'A', 'NAACL': 'A', 'IJCAI': 'A*'
  }), []);
  
  const getVenueRank = useCallback((venue: string) => {
    return venueRankings[venue] || 'B';
  }, [venueRankings]);
  
  const getVenueColor = useCallback((rank: string) => {
    switch(rank) {
      case 'A*': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'A': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'B': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);
  
  const getTypeColor = useCallback((type: string) => {
    switch(type) {
      case 'conference': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'journal': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'preprint': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);
  
  const venueRank = useMemo(() => getVenueRank(paper.venue), [paper.venue, getVenueRank]);
  const handleAnalyze = useCallback(() => onAnalyze?.(paper), [onAnalyze, paper]);
  
  return (
    <div className="glass-card p-6 mb-4 card-hover">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h3 className="font-semibold text-lg lg:text-xl mb-3 text-gray-900 leading-tight line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 && ' et al.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`text-xs font-medium border ${getTypeColor(paper.venueType)}`}>
              {paper.venueType.toUpperCase()}
            </Badge>
            <Badge className={`text-xs font-bold border ${getVenueColor(venueRank)}`}>
              {paper.venue} ({venueRank})
            </Badge>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {paper.year}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
              <Quote className="w-4 h-4" />
              {paper.citations.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex lg:flex-col gap-2 lg:items-end">
          <div className="flex gap-2">
            {paper.pdfUrl && (
              <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            )}
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-9 px-3">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
          <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
            Export
          </Button>
        </div>
      </div>
      
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full mt-4 h-10 text-sm font-medium hover:bg-gray-50">
            {expanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            {expanded ? 'Hide Abstract' : 'Show Abstract & Keywords'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{paper.abstract}</p>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  {kw}
                </Badge>
              ))}
            </div>
            {onAnalyze && (
              <Button 
                size="sm" 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-medium"
                onClick={handleAnalyze}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze Citation Impact
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

// Citation Analysis Component
function CitationAnalysisView({ paper, onClose }: { paper: ResearchPaper; onClose: () => void }) {
  const analysis = analyzePaperCitations(paper);
  
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{paper.title}</h3>
          <p className="text-sm text-muted-foreground">Citation Analysis</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Quote className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{paper.citations.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Citations</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{paper.year}</p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{paper.venue}</p>
          <p className="text-xs text-muted-foreground">Venue</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Why This Paper is Highly Cited
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.whyCited}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Key Contributions
          </h4>
          <ul className="space-y-1">
            {analysis.keyContributions.map((contrib, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {contrib}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            Impact Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.impactAreas.map((area, i) => (
              <Badge key={i} variant="secondary">{area}</Badge>
            ))}
          </div>
        </div>
        
        {analysis.relatedPapers.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Related Papers
            </h4>
            <div className="space-y-2">
              {analysis.relatedPapers.slice(0, 2).map(p => (
                <a 
                  key={p.id} 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-2 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.citations.toLocaleString()} citations</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// X icon component
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function App() {
  const { trackRender } = usePerformanceTracking('App');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingPaper, setAnalyzingPaper] = useState<ResearchPaper | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  useEffect(() => {
    trackRender();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Track app initialization
    monitoringService.trackEvent('app_initialized', {
      environment: deploymentService.getConfig().environment,
      timestamp: Date.now()
    });
  }, [currentConversation?.messages, trackRender]);

  useEffect(() => {
    const saved = localStorage.getItem('aiml-research-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
      } catch {
        console.error('Failed to load conversations');
      }
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aiml-research-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Research Query',
      messages: [],
      createdAt: new Date()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setSidebarOpen(false);
    setActiveTab('chat');
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
    toast({
      title: 'Conversation deleted',
      description: 'The conversation has been removed.'
    });
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date()
      };
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      convId = newConv.id;
    } else {
      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      ));
    }

    setInput('');
    setIsLoading(true);

    try {
      // Determine response type
      const { content, type } = generateResponse(userMessage.content);
      const lowerQuery = userMessage.content.toLowerCase();

      let assistantMessage: Message;

      if (type === 'paper_search' || lowerQuery.includes('paper') || lowerQuery.includes('research')) {
        // Search for papers - extract clean query
        let searchQuery = lowerQuery
          .replace(/find papers on|search for|research papers about|papers on|find paper|search paper/gi, '')
          .replace(/show me|what are|trending|latest|recent papers|in the field of/gi, '')
          .replace(/research in|papers in|most cited papers|most cited/gi, '')
          .trim();
        
        // If query is empty after cleaning, use the original
        if (!searchQuery) {
          searchQuery = userMessage.content;
        }

        // Detect sorting preference
        let sortBy: 'relevance' | 'citations' | 'date' = 'relevance';
        if (lowerQuery.includes('most cited') || lowerQuery.includes('highest cited') || lowerQuery.includes('top cited')) {
          sortBy = 'citations';
        } else if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('new')) {
          sortBy = 'date';
        }

        const results = await searchGoogleScholar(searchQuery, {
          page: 1,
          limit: 30,
          sortBy,
          useCache: true
        });
        historyService.addSearchHistory(searchQuery || 'machine learning', results.papers.length, results.papers);
        smartSearchService.addToHistory(searchQuery || 'machine learning', results.papers.length);
        
        // Track successful search
        monitoringService.trackEvent('search_completed', {
          query: searchQuery || 'machine learning',
          resultCount: results.papers.length,
          searchType: 'paper_search'
        });

        // Get personalized recommendations
        const personalizedPapers = userProfileService.getPersonalizedRecommendations(results.papers);

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I found ${results.totalResults.toLocaleString()} papers related to "${results.query}". Here are the top ${personalizedPapers.length} most relevant papers based on your interests:`,
          timestamp: new Date(),
          papers: personalizedPapers,
          type: 'paper_search'
        };
      } else if (type === 'paper_analysis' || lowerQuery.includes('most cited')) {
        // Get most cited papers
        const mostCited = getMostCitedPapers(5);
        const personalizedCited = userProfileService.getPersonalizedRecommendations(mostCited);

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here are the most cited papers in AIML research, personalized for your interests:',
          timestamp: new Date(),
          papers: personalizedCited,
          type: 'paper_analysis'
        };
      } else if (type === 'author_search' || lowerQuery.includes('author') || lowerQuery.includes('researcher')) {
        // Search for authors
        const searchQuery = lowerQuery
          .replace(/author|researcher|profile|show me|find/gi, '')
          .trim();

        const authors = searchAuthors(searchQuery || 'hinton');
        historyService.addSearchHistory('Author: ' + (searchQuery || 'hinton'), authors.length);

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Found ${authors.length} researcher${authors.length !== 1 ? 's' : ''} matching "${searchQuery}". Here are their profiles:`,
          timestamp: new Date(),
          authors: authors,
          type: 'author_search'
        };
      } else if (type === 'metrics' || lowerQuery.includes('metrics') || lowerQuery.includes('analytics')) {
        // Get research metrics
        const fieldMatch = lowerQuery.match(/metrics for (.+)|analytics for (.+)|(.+) metrics|(.+) analytics/);
        const field = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || fieldMatch[4]).trim() : '';
        
        const metrics = field ? getFieldMetrics(field) : getResearchMetrics();
        historyService.addSearchHistory('Metrics: ' + (field || 'research analytics'), 1);

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: field 
            ? `Research analytics for "${field}" field. Here are the key metrics and trends:` 
            : 'Comprehensive research analytics dashboard. Here are the key metrics across all fields:',
          timestamp: new Date(),
          metrics: metrics,
          type: 'metrics'
        };
      } else if (type === 'trending') {
        // Get trending papers
        const trending = getTrendingPapers(5);
        const personalizedTrending = userProfileService.getPersonalizedRecommendations(trending);

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here are the most impactful recent papers (2019+) personalized for your interests:',
          timestamp: new Date(),
          papers: personalizedTrending,
          type: 'trending'
        };
      } else {
        // General knowledge response
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: content || 'I can help you find and analyze AIML research papers. Try asking about specific topics or request paper searches.',
          timestamp: new Date(),
          type: 'general'
        };
      }

      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      ));
      
      // Add to history
      if (type === 'paper_search' && assistantMessage.papers) {
        historyService.addSearchHistory(userMessage.content, assistantMessage.papers.length, assistantMessage.papers);
      } else if (type === 'author_search' && assistantMessage.authors) {
        historyService.addSearchHistory(userMessage.content, assistantMessage.authors.length);
      } else if (type === 'metrics') {
        historyService.addSearchHistory(userMessage.content, 1);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      monitoringService.trackError(error as Error, { 
        query: userMessage.content,
        conversationId: convId 
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        type: 'general'
      };

      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, errorMessage] }
          : c
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentConversationId, conversations]);

  const handleAdvancedSearch = useCallback(async (query: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    setActiveTab('advanced');
    
    console.log('Advanced search query:', query);
    console.log('Advanced search filters:', searchFilters);
    
    try {
      // Build search query
      let searchQuery = query.trim() || 'machine learning';
      
      const results = await searchGoogleScholar(searchQuery, {
        page: 1,
        limit: 50,
        sortBy: searchFilters.sortBy || 'relevance',
        useCache: true,
        authorName: searchFilters.authorName
      });
      
      console.log('API returned papers:', results.papers.length);
      
      // Apply filters to results
      let filteredResults = results.papers;
      
      console.log('Before filters:', filteredResults.length);
      
      if (searchFilters.yearFrom) {
        filteredResults = filteredResults.filter(p => p.year >= searchFilters.yearFrom!);
        console.log('After yearFrom filter:', filteredResults.length);
      }
      if (searchFilters.yearTo) {
        filteredResults = filteredResults.filter(p => p.year <= searchFilters.yearTo!);
        console.log('After yearTo filter:', filteredResults.length);
      }
      if (searchFilters.minCitations) {
        filteredResults = filteredResults.filter(p => p.citations >= searchFilters.minCitations!);
      }
      if (searchFilters.publicationType && searchFilters.publicationType.length > 0) {
        filteredResults = filteredResults.filter(p => searchFilters.publicationType!.includes(p.venueType));
      }
      
      console.log('Final filtered results:', filteredResults.length);
      
      setFilteredPapers(filteredResults);
      smartSearchService.addToHistory(query, filteredResults.length);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Found ${filteredResults.length} papers matching your search criteria. Results filtered by: ${[
          searchFilters.publicationType?.length ? `${searchFilters.publicationType.join(', ')} publications` : '',
          searchFilters.venueRank?.length ? `${searchFilters.venueRank.join(', ')} venues` : '',
          searchFilters.minCitations ? `min ${searchFilters.minCitations} citations` : '',
          searchFilters.authorName ? `author: ${searchFilters.authorName}` : '',
          `${searchFilters.yearFrom}-${searchFilters.yearTo}`
        ].filter(Boolean).join(', ')}.`,
        timestamp: new Date(),
        papers: filteredResults,
        type: 'paper_search'
      };

      let convId = currentConversationId;
      if (!convId) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: `Advanced Search: ${query.slice(0, 30)}...`,
          messages: [{
            id: (Date.now() - 1).toString(),
            role: 'user',
            content: `Advanced search: "${query}" with filters`,
            timestamp: new Date()
          }, assistantMessage],
          createdAt: new Date()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
      } else {
        setConversations(prev => prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, {
                id: (Date.now() - 1).toString(),
                role: 'user',
                content: `Advanced search: "${query}" with filters`,
                timestamp: new Date()
              }, assistantMessage] }
            : c
        ));
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, conversations]);
  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Message content has been copied.'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <h3 key={i} className="text-lg font-semibold text-primary mt-4 mb-2">{line.slice(2, -2)}</h3>;
      }
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      if (parts.length > 1) {
        return (
          <p key={i} className="mb-2">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.startsWith('•') || line.startsWith('-')) {
        return <li key={i} className="ml-4 mb-1">{line.slice(1).trim()}</li>;
      }
      if (!line.trim()) return <div key={i} className="h-2" />;
      return <p key={i} className="mb-2">{line}</p>;
    });
  };

  const stats = getPaperStats();
  const trendingTopics = getTrendingTopics();

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background text-foreground">
        <Toaster />
      
      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <Button onClick={createNewConversation} className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
                <Plus className="w-5 h-5" />
                New Research Query
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No searches yet</h3>
                    <p className="text-sm">Start exploring research papers!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setCurrentConversationId(conv.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-4 rounded-lg group transition-all duration-200 ${
                          currentConversationId === conv.id 
                            ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Search className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{conv.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(conv.createdAt)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                            onClick={(e) => deleteConversation(conv.id, e)}
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentConversationId(conv.id);
                              setShareDialogOpen(true);
                            }}
                          >
                            <Share2 className="w-3 h-3 text-gray-400" />
                          </Button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-4 h-4" />
                About Platform
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-blue-200 flex items-center justify-between px-4 lg:px-6 bg-white shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden text-blue-600 hover:bg-blue-50 flex-shrink-0">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Brain className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="min-w-0 text-left hover:opacity-80 transition-opacity"
              >
                <h1 className="font-bold text-lg lg:text-xl text-blue-900 truncate">ScholarGPT</h1>
                <p className="text-xs text-blue-600 hidden sm:block">Academic Paper Database</p>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
              <TabsList className="bg-blue-500/10 border-blue-200 h-9">
                <TabsTrigger value="chat" className="text-blue-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-xs lg:text-sm px-2 lg:px-3">Home</TabsTrigger>
                <TabsTrigger value="advanced" className="text-blue-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-xs lg:text-sm px-2 lg:px-3">Advanced</TabsTrigger>
                <TabsTrigger value="explore" className="text-blue-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-xs lg:text-sm px-2 lg:px-3">Explore</TabsTrigger>
                <TabsTrigger value="collaborate" className="text-blue-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-xs lg:text-sm px-2 lg:px-3">Collaborate</TabsTrigger>
                <TabsTrigger value="history" className="text-blue-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-xs lg:text-sm px-2 lg:px-3">History</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" onClick={() => setShowUserProfile(true)} className="text-blue-600 hover:bg-blue-50 flex-shrink-0">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className="text-blue-600 hover:bg-blue-50 flex-shrink-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden data-[state=active]:flex">
              {!currentConversation || currentConversation.messages.length === 0 ? (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="text-center max-w-5xl mx-auto">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-xl">
                        <Brain className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                      </div>
                      <h2 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4 text-gray-900">
                        Professional <span className="text-blue-600">Research Discovery</span> Platform
                      </h2>
                      <p className="text-gray-600 text-base lg:text-xl mb-8 lg:mb-12 leading-relaxed px-4">
                        Search, analyze, and discover influential research papers in AI and Machine Learning
                        <br className="hidden sm:block" />with advanced citation analysis and venue rankings
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12 px-4">
                        {[
                          { icon: TrendingUp, label: 'Most Cited', query: 'deep learning', desc: 'Top cited papers', action: 'cited', sortBy: 'citations' },
                          { icon: BarChart3, label: 'Advanced Search', query: '', desc: 'Search with filters', action: 'advanced', sortBy: 'relevance' },
                          { icon: FileText, label: 'Recent Papers', query: 'computer vision', desc: 'Latest research', action: 'recent', sortBy: 'date' }
                        ].map((topic, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (topic.action === 'advanced') {
                                setActiveTab('advanced');
                              } else if (topic.action === 'cited') {
                                setInput(`most cited papers ${topic.query}`);
                                setTimeout(() => sendMessage(), 100);
                              } else if (topic.action === 'recent') {
                                setInput(`recent papers ${topic.query}`);
                                setTimeout(() => sendMessage(), 100);
                              }
                            }}
                            className="glass-card p-4 lg:p-6 text-left group hover:shadow-lg transition-all duration-200 hover:scale-105"
                          >
                            <topic.icon className="w-6 h-6 lg:w-8 lg:h-8 mb-3 lg:mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{topic.label}</h3>
                            <p className="text-xs lg:text-sm text-gray-500">{topic.desc}</p>
                          </button>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 text-center px-4">
                        <div className="metric-card">
                          <div className="text-xl lg:text-3xl font-bold text-blue-600">{stats.totalPapers.toLocaleString()}</div>
                          <div className="text-xs lg:text-sm text-gray-500 mt-1">Research Papers</div>
                        </div>
                        <div className="metric-card">
                          <div className="text-xl lg:text-3xl font-bold text-blue-600">{(stats.totalCitations / 1000000).toFixed(1)}M</div>
                          <div className="text-xs lg:text-sm text-gray-500 mt-1">Total Citations</div>
                        </div>
                        <div className="metric-card">
                          <div className="text-xl lg:text-3xl font-bold text-blue-600">{stats.highImpactPapers}</div>
                          <div className="text-xs lg:text-sm text-gray-500 mt-1">High-Impact Papers</div>
                        </div>
                        <div className="metric-card">
                          <div className="text-xl lg:text-3xl font-bold text-blue-600">{stats.venues.length}</div>
                          <div className="text-xs lg:text-sm text-gray-500 mt-1">Venues Indexed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area - Always visible on home page */}
                  <div className="border-t border-gray-200 p-4 lg:p-6 bg-white">
                    <div className="content-container">
                      <SmartSearchInput
                        value={input}
                        onChange={setInput}
                        onSearch={(query) => {
                          setInput(query);
                          sendMessage();
                        }}
                        isLoading={isLoading}
                        disabled={isLoading}
                      />
                      <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 mt-4 text-xs lg:text-sm text-gray-500">
                        <span>Try: "transformers in NLP"</span>
                        <span className="hidden sm:inline">•</span>
                        <span>"Geoffrey Hinton papers"</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden lg:inline">"CVPR 2023 papers"</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ScrollArea className="flex-1 h-full">
                    <div className="content-container py-6 space-y-6">
                      {currentConversation.messages.map((message, index) => (
                        <div key={message.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                          {message.role === 'user' && (
                            <div className="flex gap-3 lg:gap-4 mb-6">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs lg:text-sm font-medium text-blue-700">You</span>
                              </div>
                              <div className="flex-1 pt-1 min-w-0">
                                <p className="text-gray-900 break-words">{message.content}</p>
                                <span className="text-xs text-gray-500 mt-2 block">{formatTime(message.timestamp)}</span>
                              </div>
                            </div>
                          )}

                          {message.role === 'assistant' && (
                            <div className="flex gap-3 lg:gap-4">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="markdown-content text-gray-900 mb-4">
                                  {renderContent(message.content)}
                                </div>

                                {/* Metrics Display */}
                                {message.metrics && (
                                  <div className="mt-4">
                                    <MetricsCard metrics={message.metrics} />
                                  </div>
                                )}

                                {/* Authors Display */}
                                {message.authors && message.authors.length > 0 && (
                                  <div className="max-h-[600px] overflow-y-auto space-y-3 mt-4 pr-2">
                                    {message.authors.map(author => (
                                      <AuthorCard
                                        key={author.id}
                                        author={author}
                                        onAnalyze={() => historyService.addAuthorView(author)}
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Papers Display */}
                                {message.papers && message.papers.length > 0 && (
                                  <div className="max-h-[600px] overflow-y-auto space-y-3 mt-4 pr-2">
                                    {message.papers.map(paper => (
                                      <PaperCard
                                        key={paper.id}
                                        paper={paper}
                                        onAnalyze={(p) => {
                                          setAnalyzingPaper(p);
                                          historyService.addPaperView(p);
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 mt-4">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyMessage(message.content, message.id)}>
                                    {copiedId === message.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                  </Button>
                                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} className="h-4" />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 p-4 lg:p-6 bg-white">
                    <div className="content-container">
                      <div className="relative">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder="Search research papers, authors, or ask about AI/ML topics..."
                          className="pr-16 pl-6 py-4 text-base lg:text-lg text-gray-800 bg-gray-50 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-500 transition-all duration-200"
                          disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin text-blue-600" />
                          ) : (
                            <Button size="lg" onClick={sendMessage} disabled={!input.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-lg h-10 lg:h-12 px-4 lg:px-6">
                              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 mt-4 text-xs lg:text-sm text-gray-500">
                        <span>Try: "transformers in NLP"</span>
                        <span className="hidden sm:inline">•</span>
                        <span>"Geoffrey Hinton papers"</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden lg:inline">"CVPR 2023 papers"</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="flex-1 m-0 data-[state=active]:flex overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      Advanced <span className="text-blue-600">Research Search</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Use advanced filters to find exactly what you're looking for
                    </p>
                  </div>
                  
                  <AdvancedSearch onSearch={handleAdvancedSearch} isLoading={isLoading} />
                  
                  {/* Search Results */}
                  {filteredPapers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Search Results ({filteredPapers.length})
                      </h3>
                      <div className="space-y-3">
                        {filteredPapers.map(paper => (
                          <PaperCard key={paper.id} paper={paper} onAnalyze={setAnalyzingPaper} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Smart Filtering</h3>
                      <p className="text-sm text-gray-600">Filter by venue rank, publication type, citations, and more</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Precise Results</h3>
                      <p className="text-sm text-gray-600">Get exactly the papers you need with advanced search operators</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Export Ready</h3>
                      <p className="text-sm text-gray-600">Results formatted for citations and research workflows</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaborate" className="flex-1 m-0 data-[state=active]:flex">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      Research <span className="text-blue-600">Collaboration</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Share discoveries, create collections, and collaborate with researchers worldwide
                    </p>
                  </div>
                  
                  <CollaborationPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 data-[state=active]:flex">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      Research <span className="text-blue-600">History</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Track your research journey and revisit previous discoveries
                    </p>
                  </div>
                  
                  <HistoryPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="explore" className="flex-1 m-0 data-[state=active]:flex overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-6xl mx-auto p-4 space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      Explore <span className="text-blue-600">Trending Research</span>
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">
                      Discover hot topics and influential papers in AI/ML
                    </p>
                  </div>

                  {/* Trending Topics - Clickable Cards */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      Hot Research Areas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { topic: 'Large Language Models', query: 'large language models', icon: Brain, color: 'from-purple-500 to-pink-500' },
                        { topic: 'Computer Vision', query: 'computer vision', icon: Search, color: 'from-blue-500 to-cyan-500' },
                        { topic: 'Reinforcement Learning', query: 'reinforcement learning', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                        { topic: 'Transformers', query: 'transformer architecture', icon: Network, color: 'from-orange-500 to-red-500' },
                        { topic: 'Diffusion Models', query: 'diffusion models', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
                        { topic: 'Neural Architecture Search', query: 'neural architecture search', icon: Settings, color: 'from-teal-500 to-blue-500' }
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveTab('chat');
                            setInput(item.query);
                            setTimeout(() => sendMessage(), 100);
                          }}
                          className="glass-card p-6 text-left group hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">{item.topic}</h4>
                          <p className="text-sm text-gray-500">Click to explore papers</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      Quick Explore
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          setInput('most cited papers deep learning');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="glass-card p-6 text-left group hover:shadow-lg transition-all duration-200 hover:scale-102 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Award className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Most Cited Papers</h4>
                            <p className="text-sm text-gray-500">Explore highly influential research</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          setInput('recent papers machine learning');
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="glass-card p-6 text-left group hover:shadow-lg transition-all duration-200 hover:scale-102 border-l-4 border-green-500"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Recent Publications</h4>
                            <p className="text-sm text-gray-500">Latest research breakthroughs</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Research by Venue */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      Top Venues
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['NeurIPS', 'ICML', 'CVPR', 'ICLR', 'ACL', 'EMNLP', 'AAAI', 'IJCAI'].map((venue, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveTab('chat');
                            setInput(`${venue} papers`);
                            setTimeout(() => sendMessage(), 100);
                          }}
                          className="glass-card p-4 text-center group hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{venue}</p>
                          <p className="text-xs text-gray-500 mt-1">Rank A*</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                      <FileText className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <p className="text-3xl font-bold text-gray-900">{stats.totalPapers.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">Papers Indexed</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                      <Quote className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <p className="text-3xl font-bold text-gray-900">{(stats.totalCitations / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-500 mt-1">Total Citations</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                      <Award className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <p className="text-3xl font-bold text-gray-900">{stats.highImpactPapers}</p>
                      <p className="text-sm text-gray-500 mt-1">High Impact</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                      <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <p className="text-3xl font-bold text-gray-900">{stats.yearRange.max - stats.yearRange.min}+</p>
                      <p className="text-sm text-gray-500 mt-1">Years Coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <UserProfilePanel onClose={() => setShowUserProfile(false)} />
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen}
        conversation={currentConversation || undefined}
      />

      {/* Paper Analysis Dialog */}
      <Dialog open={!!analyzingPaper} onOpenChange={() => setAnalyzingPaper(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paper Analysis</DialogTitle>
            <DialogDescription>Detailed citation analysis and impact metrics</DialogDescription>
          </DialogHeader>
          {analyzingPaper && (
            <CitationAnalysisView paper={analyzingPaper} onClose={() => setAnalyzingPaper(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About AIML Research Assistant</DialogTitle>
            <DialogDescription>
              Your companion for discovering and analyzing AI/ML research
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="font-medium mb-2">Features</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Search {stats.totalPapers}+ influential AIML papers</li>
                <li>• Citation analysis and impact metrics</li>
                <li>• Trending research area tracking</li>
                <li>• Related paper recommendations</li>
                <li>• Conference venue information</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">How to Use</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "Find papers on [topic]" - Search papers</li>
                <li>• "Most cited papers in [field]" - Top citations</li>
                <li>• "Why is [paper] highly cited?" - Analysis</li>
                <li>• "Trending research in [area]" - Recent work</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">Data Sources</p>
              <p className="text-sm text-muted-foreground">
                Curated database of influential papers from top venues: NeurIPS, ICML, CVPR, ICLR, Nature, and more.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AdminDashboard />
    </div>
    </ErrorBoundary>
  );
}

export default App;