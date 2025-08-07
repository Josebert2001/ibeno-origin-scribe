import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const metric: PerformanceMetric = {
          name: entry.name,
          value: (entry as any).value || (entry as any).processingStart || entry.duration,
          timestamp: Date.now(),
        };

        // Log performance metrics
        console.log('⚡ Performance Metric:', metric);

        // In production, send to monitoring service
        if (import.meta.env.PROD) {
          // TODO: Send to monitoring service like DataDog, New Relic, etc.
        }
      });
    });

    // Observe various performance metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }

    // Monitor page load times
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        fullPageLoad: navigation.loadEventEnd - navigation.fetchStart,
        timeToFirstByte: navigation.responseStart - navigation.fetchStart,
      };

      console.log('📈 Page Load Metrics:', metrics);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to manually track custom performance metrics
  const trackCustomMetric = (name: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Custom Metric - ${name}:`, `${duration.toFixed(2)}ms`);
    
    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      // TODO: Send to monitoring service
    }
  };

  return { trackCustomMetric };
};