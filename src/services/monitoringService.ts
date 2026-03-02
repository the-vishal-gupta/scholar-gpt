export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

class MonitoringService {
  private errors: ErrorReport[] = [];
  private events: AnalyticsEvent[] = [];

  trackError(error: Error, context?: Record<string, any>): void {
    const report: ErrorReport = {
      id: Date.now().toString(),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    this.errors.push(report);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    console.error('Error tracked:', report);
  }

  trackEvent(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getErrorSummary() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentErrors = this.errors.filter(e => e.timestamp > last24h);
    
    return {
      total: this.errors.length,
      last24h: recentErrors.length,
      topErrors: this.getTopErrors(recentErrors)
    };
  }

  private getTopErrors(errors: ErrorReport[]) {
    const errorCounts = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  clearOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.errors = this.errors.filter(e => e.timestamp > oneWeekAgo);
    this.events = this.events.filter(e => e.timestamp > oneWeekAgo);
  }
}

export const monitoringService = new MonitoringService();

// Global error handler
window.addEventListener('error', (event) => {
  monitoringService.trackError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  monitoringService.trackError(new Error(event.reason), {
    type: 'unhandledrejection'
  });
});