import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Settings, Plus, Menu, ExternalLink, Loader2, MessageSquare, Trash2, Copy, Check, BookOpen, TrendingUp, FileText, Quote, BarChart3, Search, Calendar, Award, ChevronDown, ChevronUp, Download, Filter, Compass } from 'lucide-react';
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
import type { Message, Conversation, ResearchPaper } from '@/types';
import { searchGoogleScholar, getMostCitedPapers, getTrendingPapers, analyzePaperCitations, getTrendingTopics, getPaperStats } from '@/services/scholarService';
import { advancedSearch } from '@/services/enhancedScholarService';
import type { SearchFilters } from '@/types';
import './App.css';

// Paper Card Component
function PaperCard({ paper, onAnalyze }: { paper: ResearchPaper; onAnalyze?: (paper: ResearchPaper) => void }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-secondary/50 rounded-xl p-4 mb-3 border border-border/50 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{paper.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 && ' et al.'}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {paper.year}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Quote className="w-3 h-3" />
              {paper.citations.toLocaleString()} citations
            </span>
            <Badge variant="outline" className="text-xs">{paper.venue}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{paper.venueType}</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {paper.pdfUrl && (
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="w-7 h-7">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </a>
          )}
          <a href={paper.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="w-7 h-7">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
      
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
            {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            {expanded ? 'Show Less' : 'Show Abstract'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{paper.abstract}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {paper.keywords.map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
            ))}
          </div>
          {onAnalyze && (
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onAnalyze(paper)}>
              <BarChart3 className="w-3 h-3 mr-2" />
              Analyze Citations
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function App() {
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
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    yearFrom: 2010,
    yearTo: 2024,
    minCitations: 0,
    publicationType: [],
    sortBy: 'citations'
  });
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const stats = getPaperStats();
  const trendingTopics = getTrendingTopics();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const sendMessage = async () => {
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
        c.id === convId ? { ...c, messages: [...c.messages, userMessage] } : c
      ));
    }

    setInput('');
    setIsLoading(true);

    try {
      const lowerQuery = userMessage.content.toLowerCase();
      let assistantMessage: Message;

      if (lowerQuery.includes('paper') || lowerQuery.includes('research') || lowerQuery.includes('find')) {
        const searchQuery = lowerQuery.replace(/find papers on|search for|research papers about|papers on|find|search/gi, '').trim();
        const results = await searchGoogleScholar(searchQuery || 'machine learning');

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I found ${results.totalResults.toLocaleString()} papers related to "${results.query}". Here are the top ${results.papers.length} most relevant papers:`,
          timestamp: new Date(),
          papers: results.papers,
          type: 'paper_search'
        };
      } else if (lowerQuery.includes('most cited')) {
        const mostCited = getMostCitedPapers(5);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here are the most cited papers in AIML research:',
          timestamp: new Date(),
          papers: mostCited,
          type: 'paper_analysis'
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I can help you find and analyze AIML research papers. Try asking:\n\n• "Find papers on transformers"\n• "Most cited papers in deep learning"\n• "Show me recent computer vision papers"',
          timestamp: new Date(),
          type: 'general'
        };
      }

      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, assistantMessage] } : c
      ));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Toaster />
      
      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Button onClick={() => {
                const newConv: Conversation = { id: Date.now().toString(), title: 'New Query', messages: [], createdAt: new Date() };
                setConversations(prev => [newConv, ...prev]);
                setCurrentConversationId(newConv.id);
                setSidebarOpen(false);
                setActiveTab('chat');
              }} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                New Query
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => { setCurrentConversationId(conv.id); setSidebarOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg mb-1 ${currentConversationId === conv.id ? 'bg-primary/10' : 'hover:bg-secondary'}`}
                  >
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">ScholarGPT</h1>
                <p className="text-xs text-muted-foreground">AIML Research</p>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="explore" className="text-xs">Explore</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center max-w-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3">
                      Your <span className="text-primary">AIML Research</span> Assistant
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8">
                      Search, analyze, and discover influential research papers
                    </p>
                  </div>
                </div>
                
                <div className="border-t p-4">
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Ask about research papers, citations, or AIML topics..."
                        className="pr-24 pl-4 py-6"
                        disabled={isLoading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <Button size="icon" onClick={sendMessage} disabled={!input.trim()} className="w-8 h-8">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    {currentConversation.messages.map((message) => (
                      <div key={message.id}>
                        {message.role === 'user' && (
                          <div className="flex gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-medium">You</span>
                            </div>
                            <div className="flex-1 pt-1">
                              <p>{message.content}</p>
                            </div>
                          </div>
                        )}
                        {message.role === 'assistant' && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="mb-3 whitespace-pre-line">{message.content}</p>
                              {message.papers && message.papers.length > 0 && (
                                <div className="space-y-2 mt-4">
                                  {message.papers.map(paper => (
                                    <PaperCard key={paper.id} paper={paper} onAnalyze={setAnalyzingPaper} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Ask about research papers..."
                        className="pr-24 pl-4 py-6"
                        disabled={isLoading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <Button size="icon" onClick={sendMessage} disabled={!input.trim()} className="w-8 h-8">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="explore" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Filter Panel */}
                <div className="bg-secondary/30 rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Advanced Filters
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-7 text-xs">
                      {showFilters ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  {showFilters && (
                    <div className="space-y-4 pt-3 border-t">
                      <div>
                        <label className="text-xs font-medium mb-2 block">Publication Type</label>
                        <div className="flex flex-wrap gap-2">
                          {['conference', 'journal', 'preprint', 'workshop'].map(type => (
                            <Button
                              key={type}
                              variant={filters.publicationType?.includes(type as any) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const current = filters.publicationType || [];
                                const updated = current.includes(type as any) ? current.filter(t => t !== type) : [...current, type as any];
                                setFilters({ ...filters, publicationType: updated });
                              }}
                              className="h-7 text-xs capitalize"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-2 block">From Year</label>
                          <Input type="number" value={filters.yearFrom || 2010} onChange={(e) => setFilters({ ...filters, yearFrom: parseInt(e.target.value) })} className="h-8 text-xs" min={1990} max={2024} />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-2 block">To Year</label>
                          <Input type="number" value={filters.yearTo || 2024} onChange={(e) => setFilters({ ...filters, yearTo: parseInt(e.target.value) })} className="h-8 text-xs" min={1990} max={2024} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-2 block">Min Citations: {filters.minCitations || 0}</label>
                        <Input type="range" value={filters.minCitations || 0} onChange={(e) => setFilters({ ...filters, minCitations: parseInt(e.target.value) })} min={0} max={50000} step={1000} className="w-full" />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => { const results = advancedSearch('', filters, 20); setFilteredPapers(results); }} className="flex-1 h-8 text-xs">
                          Apply Filters ({advancedSearch('', filters, 1000).length} results)
                        </Button>
                        <Button variant="outline" onClick={() => { setFilters({ yearFrom: 2010, yearTo: 2024, minCitations: 0, publicationType: [], sortBy: 'citations' }); setFilteredPapers([]); }} className="h-8 text-xs">
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {filteredPapers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Filtered Results ({filteredPapers.length})
                    </h3>
                    <div className="space-y-3">
                      {filteredPapers.map(paper => (
                        <PaperCard key={paper.id} paper={paper} onAnalyze={setAnalyzingPaper} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.totalPapers}</p>
                    <p className="text-xs text-muted-foreground">Papers</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Quote className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{(stats.totalCitations / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Citations</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.highImpactPapers}</p>
                    <p className="text-xs text-muted-foreground">High Impact</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.yearRange.min}-{stats.yearRange.max}</p>
                    <p className="text-xs text-muted-foreground">Year Range</p>
                  </div>
                </div>

                {/* Most Cited */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Most Cited Papers
                  </h3>
                  <div className="space-y-3">
                    {getMostCitedPapers(3).map(paper => (
                      <PaperCard key={paper.id} paper={paper} onAnalyze={setAnalyzingPaper} />
                    ))}
                  </div>
                </div>

                {/* Trending Topics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Trending Research Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trendingTopics.slice(0, 4).map((topic, i) => (
                      <div key={i} className="bg-secondary/50 rounded-xl p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{topic.topic}</h4>
                          <Badge variant="secondary" className="text-xs">+{topic.growthRate}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{topic.paperCount} papers</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Papers */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent High-Impact Papers (2019+)
                  </h3>
                  <div className="space-y-3">
                    {getTrendingPapers(3).map(paper => (
                      <PaperCard key={paper.id} paper={paper} onAnalyze={setAnalyzingPaper} />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Paper Analysis Dialog */}
      <Dialog open={!!analyzingPaper} onOpenChange={() => setAnalyzingPaper(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paper Analysis</DialogTitle>
            <DialogDescription>Citation analysis and impact metrics</DialogDescription>
          </DialogHeader>
          {analyzingPaper && (
            <div className="space-y-4">
              <h3 className="font-bold">{analyzingPaper.title}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{analyzingPaper.citations.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Citations</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{analyzingPaper.year}</p>
                  <p className="text-xs text-muted-foreground">Year</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{analyzingPaper.venue}</p>
                  <p className="text-xs text-muted-foreground">Venue</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
