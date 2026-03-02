import React, { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentMetric {
  component: string;
  renderTime: number;
  rerenderCount: number;
  propsChanges: number;
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetric>();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  // Track custom metrics
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Track search performance
  trackSearchPerformance(query: string, resultCount: number, duration: number): void {
    this.trackMetric('search_duration', duration, {
      query: query.substring(0, 50),
      resultCount,
      queryLength: query.length
    });
  }

  // Track component render performance
  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = (existing.renderTime + renderTime) / 2; // Moving average
      existing.rerenderCount++;
    } else {
      this.componentMetrics.set(componentName, {
        component: componentName,
        renderTime,
        rerenderCount: 1,
        propsChanges: 0
      });
    }
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.trackMetric('memory_used', memory.usedJSHeapSize);
      this.trackMetric('memory_total', memory.totalJSHeapSize);
      this.trackMetric('memory_limit', memory.jsHeapSizeLimit);
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageSearchTime: number;
    slowestComponents: ComponentMetric[];
    memoryTrend: number[];
    totalMetrics: number;
  } {
    const searchMetrics = this.metrics.filter(m => m.name === 'search_duration');
    const averageSearchTime = searchMetrics.length > 0 
      ? searchMetrics.reduce((sum, m) => sum + m.value, 0) / searchMetrics.length 
      : 0;

    const slowestComponents = Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);

    const memoryMetrics = this.metrics
      .filter(m => m.name === 'memory_used')
      .slice(-10)
      .map(m => m.value);

    return {
      averageSearchTime,
      slowestComponents,
      memoryTrend: memoryMetrics,
      totalMetrics: this.metrics.length
    };
  }

  // Initialize performance observers
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
              this.trackMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation timing observer not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.name.includes('api') || resourceEntry.name.includes('search')) {
                this.trackMetric('api_request_time', resourceEntry.responseEnd - resourceEntry.requestStart, {
                  url: resourceEntry.name
                });
              }
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observer not supported');
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackMetric('largest_contentful_paint', entry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    // Track memory usage periodically
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  // Cleanup observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();

  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  };
}

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return function PerformanceTrackedComponent(props: P) {
    const { trackRender } = usePerformanceTracking(displayName);
    
    useEffect(() => {
      trackRender();
    });

    return React.createElement(WrappedComponent, props);
  };
}

export const performanceMonitor = new PerformanceMonitorService();