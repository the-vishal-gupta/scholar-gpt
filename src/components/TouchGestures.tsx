import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TouchGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchZoom?: (scale: number) => void;
  enableZoom?: boolean;
  className?: string;
}

export function TouchGestureWrapper({
  children,
  onSwipeLeft,
  onSwipeRight,
  onPinchZoom,
  enableZoom = false,
  className = ''
}: TouchGestureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setStartTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !startTouch || e.touches.length !== 1) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    const deltaX = currentTouch.x - startTouch.x;
    const deltaY = currentTouch.y - startTouch.y;

    // Prevent default scrolling for horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }, [isDragging, startTouch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging || !startTouch) return;

    const endTouch = e.changedTouches[0];
    const deltaX = endTouch.clientX - startTouch.x;
    const deltaY = endTouch.clientY - startTouch.y;

    // Swipe detection
    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setStartTouch(null);
  }, [isDragging, startTouch, onSwipeLeft, onSwipeRight]);

  const handlePinch = useCallback((e: TouchEvent) => {
    if (!enableZoom || e.touches.length !== 2) return;

    e.preventDefault();
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Simple pinch zoom implementation
    const newScale = Math.max(0.5, Math.min(3, distance / 200));
    setScale(newScale);
    
    if (onPinchZoom) {
      onPinchZoom(newScale);
    }
  }, [enableZoom, onPinchZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    if (enableZoom) {
      container.addEventListener('touchmove', handlePinch, { passive: false });
    }

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (enableZoom) {
        container.removeEventListener('touchmove', handlePinch);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handlePinch, enableZoom]);

  return (
    <div
      ref={containerRef}
      className={`relative touch-pan-y ${className}`}
      style={{
        transform: enableZoom ? `scale(${scale})` : undefined,
        transformOrigin: 'center',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {children}
      
      {/* Mobile navigation hints */}
      {(onSwipeLeft || onSwipeRight) && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 md:hidden">
          {onSwipeRight && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              <ChevronLeft className="w-3 h-3" />
              Swipe
            </div>
          )}
          {onSwipeLeft && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              Swipe
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      )}

      {/* Zoom controls for mobile */}
      {enableZoom && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 md:hidden">
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/80"
            onClick={() => {
              const newScale = Math.min(3, scale + 0.2);
              setScale(newScale);
              onPinchZoom?.(newScale);
            }}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/80"
            onClick={() => {
              const newScale = Math.max(0.5, scale - 0.2);
              setScale(newScale);
              onPinchZoom?.(newScale);
            }}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized paper card with touch gestures
export function MobilePaperCard({ paper, onNext, onPrevious, onAnalyze }: {
  paper: any;
  onNext?: () => void;
  onPrevious?: () => void;
  onAnalyze?: () => void;
}) {
  return (
    <TouchGestureWrapper
      onSwipeLeft={onNext}
      onSwipeRight={onPrevious}
      className="w-full"
    >
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-base mb-2 line-clamp-2">{paper.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && ' et al.'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {paper.venue}
          </span>
          <span className="text-xs text-gray-500">{paper.year}</span>
          <span className="text-xs text-gray-500">{paper.citations} citations</span>
        </div>

        {onAnalyze && (
          <Button onClick={onAnalyze} size="sm" className="w-full mt-3">
            View Details
          </Button>
        )}
      </div>
    </TouchGestureWrapper>
  );
}