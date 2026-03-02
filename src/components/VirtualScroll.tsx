import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ResearchPaper } from '@/types';

interface VirtualScrollProps {
  items: ResearchPaper[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: ResearchPaper, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Optimized Paper List with Virtual Scrolling
interface VirtualPaperListProps {
  papers: ResearchPaper[];
  onAnalyze?: (paper: ResearchPaper) => void;
  height?: number;
}

export function VirtualPaperList({ papers, onAnalyze, height = 600 }: VirtualPaperListProps) {
  const renderPaper = useCallback((paper: ResearchPaper, index: number) => (
    <div className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
            {paper.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
            {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && ' et al.'}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{paper.venue}</span>
            <span>{paper.year}</span>
            <span>{paper.citations.toLocaleString()} citations</span>
          </div>
        </div>
        {onAnalyze && (
          <button
            onClick={() => onAnalyze(paper)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
          >
            View
          </button>
        )}
      </div>
    </div>
  ), [onAnalyze]);

  return (
    <VirtualScroll
      items={papers}
      itemHeight={80}
      containerHeight={height}
      renderItem={renderPaper}
      className="border border-gray-200 rounded-lg bg-white"
    />
  );
}