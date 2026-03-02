import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Search, 
  FileText, 
  User, 
  MessageSquare,
  Trash2,
  BarChart3,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { historyService, type HistoryItem } from '@/services/historyService';

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'search' | 'paper_view' | 'author_view' | 'conversation'>('all');
  const [stats, setStats] = useState(historyService.getHistoryStats());

  useEffect(() => {
    loadHistory();
  }, [activeFilter]);

  const loadHistory = () => {
    const allHistory = activeFilter === 'all' 
      ? historyService.getHistory()
      : historyService.getHistoryByType(activeFilter);
    setHistory(allHistory);
    setStats(historyService.getHistoryStats());
  };

  const clearHistory = () => {
    historyService.clearHistory();
    setHistory([]);
    setStats(historyService.getHistoryStats());
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'search': return <Search className="w-4 h-4" />;
      case 'paper_view': return <FileText className="w-4 h-4" />;
      case 'author_view': return <User className="w-4 h-4" />;
      case 'conversation': return <MessageSquare className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: HistoryItem['type']) => {
    switch (type) {
      case 'search': return 'bg-blue-100 text-blue-800';
      case 'paper_view': return 'bg-green-100 text-green-800';
      case 'author_view': return 'bg-purple-100 text-purple-800';
      case 'conversation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filters = [
    { key: 'all' as const, label: 'All', count: stats.total },
    { key: 'search' as const, label: 'Searches', count: stats.searches },
    { key: 'paper_view' as const, label: 'Papers', count: stats.paperViews },
    { key: 'author_view' as const, label: 'Authors', count: stats.authorViews },
    { key: 'conversation' as const, label: 'Chats', count: stats.conversations }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Search className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-blue-900">{stats.searches}</p>
          <p className="text-xs text-blue-600">Searches</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <FileText className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold text-green-900">{stats.paperViews}</p>
          <p className="text-xs text-green-600">Papers Viewed</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <User className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold text-purple-900">{stats.authorViews}</p>
          <p className="text-xs text-purple-600">Authors Viewed</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-orange-900">{stats.conversations}</p>
          <p className="text-xs text-orange-600">Conversations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className="h-8"
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
        
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No history yet</h3>
            <p className="text-sm">Start searching and exploring to build your research history!</p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {history.map(item => (
              <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(item.timestamp)}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Additional details based on type */}
                    {item.type === 'search' && item.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Query: "{item.data.query}" • {item.data.resultsCount} results</p>
                        {item.data.papers && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.data.papers.slice(0, 2).map((paper: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {paper.title.slice(0, 30)}...
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'paper_view' && item.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Authors: {item.data.authors?.join(', ')}</p>
                      </div>
                    )}
                    
                    {item.type === 'author_view' && item.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Affiliation: {item.data.affiliation}</p>
                      </div>
                    )}
                    
                    {item.type === 'conversation' && item.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{item.data.messageCount} messages</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Recent Activity Summary */}
      {stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Most Active</p>
              <p className="font-medium">
                {stats.searches >= Math.max(stats.paperViews, stats.authorViews, stats.conversations) ? 'Searching' :
                 stats.paperViews >= Math.max(stats.authorViews, stats.conversations) ? 'Reading Papers' :
                 stats.authorViews >= stats.conversations ? 'Exploring Authors' : 'Conversations'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Research Since</p>
              <p className="font-medium">
                {stats.oldestEntry ? formatTime(stats.oldestEntry) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}