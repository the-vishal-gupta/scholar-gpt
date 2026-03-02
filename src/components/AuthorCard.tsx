import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  User, 
  Building, 
  Quote, 
  FileText, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Users
} from 'lucide-react';
import type { AuthorProfile } from '@/types';

interface AuthorCardProps {
  author: AuthorProfile;
  onAnalyze?: (author: AuthorProfile) => void;
}

export function AuthorCard({ author, onAnalyze }: AuthorCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const recentCitations = author.citationsPerYear
    .filter(c => c.year >= currentYear - 2)
    .reduce((sum, c) => sum + c.count, 0);
  
  return (
    <div className="glass-card p-6 mb-4 card-hover">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg lg:text-xl mb-2 text-gray-900 line-clamp-1">{author.name}</h3>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1 line-clamp-1">
                <Building className="w-4 h-4 flex-shrink-0" />
                {author.affiliation}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="metric-card bg-gradient-to-br from-blue-50 to-blue-100">
              <Quote className="w-4 h-4 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-bold text-blue-900">{author.totalCitations.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Citations</p>
            </div>
            <div className="metric-card bg-gradient-to-br from-green-50 to-green-100">
              <TrendingUp className="w-4 h-4 mx-auto mb-2 text-green-600" />
              <p className="text-lg font-bold text-green-900">{author.hIndex}</p>
              <p className="text-xs text-green-600 mt-1">h-index</p>
            </div>
            <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100">
              <FileText className="w-4 h-4 mx-auto mb-2 text-purple-600" />
              <p className="text-lg font-bold text-purple-900">{author.publications}</p>
              <p className="text-xs text-purple-600 mt-1">Papers</p>
            </div>
            <div className="metric-card bg-gradient-to-br from-orange-50 to-orange-100">
              <Users className="w-4 h-4 mx-auto mb-2 text-orange-600" />
              <p className="text-lg font-bold text-orange-900">{recentCitations.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">Recent</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {author.interests.slice(0, 4).map((interest, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                {interest}
              </Badge>
            ))}
            {author.interests.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                +{author.interests.length - 4} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex lg:flex-col gap-2 lg:items-end">
          {author.googleScholarId && (
            <a href={`https://scholar.google.com/citations?user=${author.googleScholarId}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-9 px-3">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
            Follow
          </Button>
        </div>
      </div>
      
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full mt-4 h-10 text-sm font-medium hover:bg-gray-50">
            {expanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            {expanded ? 'Hide Details' : 'Show Top Papers & Collaborators'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {author.topPapers.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-900">Top Papers</h4>
                <div className="space-y-2">
                  {author.topPapers.slice(0, 3).map(paper => (
                    <div key={paper.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{paper.title}</p>
                      <p className="text-xs text-gray-600">{paper.year} • {paper.citations.toLocaleString()} citations</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-900">Frequent Collaborators</h4>
              <div className="flex flex-wrap gap-2">
                {author.coAuthors.slice(0, 5).map((coAuthor, i) => (
                  <Badge key={i} variant="outline" className="text-xs hover:bg-gray-50 transition-colors">
                    {coAuthor}
                  </Badge>
                ))}
              </div>
            </div>
            
            {onAnalyze && (
              <Button 
                size="sm" 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-medium"
                onClick={() => onAnalyze(author)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}