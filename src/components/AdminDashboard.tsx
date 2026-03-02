import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { deploymentService, HealthCheck } from '../services/deploymentService';
import { monitoringService } from '../services/monitoringService';

export const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const healthData = await deploymentService.healthCheck();
      setHealth(healthData);
    };

    const updateErrors = () => {
      const errorSummary = monitoringService.getErrorSummary();
      setErrors(errorSummary.topErrors);
    };

    checkHealth();
    updateErrors();

    const interval = setInterval(() => {
      checkHealth();
      updateErrors();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Show admin panel only in development or with special key combination
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible || deploymentService.isProduction()) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">System Status</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {health && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(health.status)}
            <span className="text-sm font-medium capitalize">{health.status}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Response: {health.performance.responseTime.toFixed(1)}ms</div>
            <div>Memory: {(health.performance.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
          </div>

          <div className="space-y-1">
            {Object.entries(health.services).map(([service, status]) => (
              <div key={service} className="flex items-center gap-2 text-xs">
                {status ? 
                  <CheckCircle className="w-3 h-3 text-green-500" /> : 
                  <XCircle className="w-3 h-3 text-red-500" />
                }
                <span className="capitalize">{service}</span>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-red-600 mb-1">Recent Errors:</div>
              {errors.slice(0, 3).map((error, i) => (
                <div key={i} className="text-xs text-gray-600 truncate">
                  {error.message} ({error.count})
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        Press Ctrl+Shift+A to toggle
      </div>
    </div>
  );
};