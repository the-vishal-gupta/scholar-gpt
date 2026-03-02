import { memo, useMemo } from 'react';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { ResearchPaper } from '@/types';

interface CitationTrendProps {
  papers: ResearchPaper[];
  width?: number;
  height?: number;
}

export const CitationTrendChart = memo(({ papers, width = 400, height = 200 }: CitationTrendProps) => {
  const chartData = useMemo(() => {
    const yearData = papers.reduce((acc, paper) => {
      acc[paper.year] = (acc[paper.year] || 0) + paper.citations;
      return acc;
    }, {} as Record<number, number>);

    const years = Object.keys(yearData).map(Number).sort();
    const maxCitations = Math.max(...Object.values(yearData));
    
    return years.map(year => ({
      year,
      citations: yearData[year],
      x: ((year - years[0]) / (years[years.length - 1] - years[0])) * (width - 60) + 30,
      y: height - 40 - ((yearData[year] / maxCitations) * (height - 80))
    }));
  }, [papers, width, height]);

  if (chartData.length === 0) return null;

  const pathData = chartData.map((point, i) => 
    `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Citation Trends</h3>
      </div>
      
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={30}
            y1={height - 40 - ratio * (height - 80)}
            x2={width - 30}
            y2={height - 40 - ratio * (height - 80)}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}
        
        {/* Trend line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          className="drop-shadow-sm"
        />
        
        {/* Data points */}
        {chartData.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#3b82f6"
              className="drop-shadow-sm"
            />
            <text
              x={point.x}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {point.year}
            </text>
          </g>
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.5, 1].map(ratio => {
          const maxCitations = Math.max(...chartData.map(d => d.citations));
          const value = Math.round(ratio * maxCitations);
          return (
            <text
              key={ratio}
              x={20}
              y={height - 40 - ratio * (height - 80) + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </text>
          );
        })}
      </svg>
    </div>
  );
});

interface VenueDistributionProps {
  papers: ResearchPaper[];
}

export const VenueDistributionChart = memo(({ papers }: VenueDistributionProps) => {
  const venueData = useMemo(() => {
    const venues = papers.reduce((acc, paper) => {
      acc[paper.venue] = (acc[paper.venue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(venues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([venue, count]) => ({ venue, count }));
  }, [papers]);

  const maxCount = Math.max(...venueData.map(d => d.count));
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Top Venues</h3>
      </div>
      
      <div className="space-y-3">
        {venueData.map((item, i) => (
          <div key={item.venue} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-600 truncate" title={item.venue}>
              {item.venue}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: colors[i % colors.length]
                }}
              />
            </div>
            <div className="text-xs text-gray-600 w-8 text-right">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

interface CitationDistributionProps {
  papers: ResearchPaper[];
}

export const CitationDistributionChart = memo(({ papers }: CitationDistributionProps) => {
  const distributionData = useMemo(() => {
    const ranges = [
      { label: '0-10', min: 0, max: 10 },
      { label: '11-100', min: 11, max: 100 },
      { label: '101-1K', min: 101, max: 1000 },
      { label: '1K-10K', min: 1001, max: 10000 },
      { label: '10K+', min: 10001, max: Infinity }
    ];

    return ranges.map(range => ({
      ...range,
      count: papers.filter(p => p.citations >= range.min && p.citations <= range.max).length
    })).filter(r => r.count > 0);
  }, [papers]);

  const total = distributionData.reduce((sum, d) => sum + d.count, 0);
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Citation Distribution</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {distributionData.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
              <span className="text-xs font-medium text-gray-900 ml-auto">
                {item.count} ({Math.round((item.count / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center">
          <svg width={80} height={80} className="transform -rotate-90">
            {distributionData.map((item, i) => {
              const percentage = item.count / total;
              const angle = percentage * 360;
              const startAngle = distributionData.slice(0, i).reduce((sum, d) => sum + (d.count / total) * 360, 0);
              
              const x1 = 40 + 30 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 40 + 30 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 40 + 30 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 40 + 30 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={i}
                  d={`M 40 40 L ${x1} ${y1} A 30 30 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[i % colors.length]}
                  className="opacity-80"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
});