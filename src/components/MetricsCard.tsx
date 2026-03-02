import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Quote, 
  Award,
  Users,
  Calendar,
  Hash
} from 'lucide-react';
import type { ResearchMetrics } from '@/types';

interface MetricsCardProps {
  metrics: ResearchMetrics;
  title?: string;
}

export function MetricsCard({ metrics, title = "Research Analytics" }: MetricsCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="metric-card bg-gradient-to-br from-blue-50 to-blue-100">
          <FileText className="w-5 h-5 mx-auto mb-2 text-blue-600" />
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{metrics.totalPapers.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">Papers</p>
        </div>
        <div className="metric-card bg-gradient-to-br from-green-50 to-green-100">
          <Quote className="w-5 h-5 mx-auto mb-2 text-green-600" />
          <p className="text-xl lg:text-2xl font-bold text-green-900">{metrics.totalCitations.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">Citations</p>
        </div>
        <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-purple-600" />
          <p className="text-xl lg:text-2xl font-bold text-purple-900">{metrics.hIndex}</p>
          <p className="text-xs text-purple-600 mt-1">h-index</p>
        </div>
        <div className="metric-card bg-gradient-to-br from-orange-50 to-orange-100">
          <Award className="w-5 h-5 mx-auto mb-2 text-orange-600" />
          <p className="text-xl lg:text-2xl font-bold text-orange-900">{metrics.avgCitationsPerPaper}</p>
          <p className="text-xs text-orange-600 mt-1">Avg/Paper</p>
        </div>
      </div>

      {/* Top Venues */}
      {metrics.topVenues.length > 0 && (
        <div className="mb-6">
          <h4 className="section-header">
            <Calendar className="w-4 h-4 text-gray-600" />
            Top Publication Venues
          </h4>
          <div className="space-y-2">
            {metrics.topVenues.slice(0, 5).map((venue, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">{venue.venue}</span>
                <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                  {venue.count} papers
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Keywords */}
      {metrics.topKeywords.length > 0 && (
        <div className="mb-6">
          <h4 className="section-header">
            <Hash className="w-4 h-4 text-gray-600" />
            Research Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {metrics.topKeywords.slice(0, 10).map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs hover:bg-gray-50 transition-colors">
                {keyword.keyword} ({keyword.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Collaboration Network */}
      {metrics.collaborationNetwork.length > 0 && (
        <div>
          <h4 className="section-header">
            <Users className="w-4 h-4 text-gray-600" />
            Key Researchers
          </h4>
          <div className="space-y-2">
            {metrics.collaborationNetwork.slice(0, 5).map((collab, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">{collab.author}</span>
                <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                  {collab.papers} papers
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}