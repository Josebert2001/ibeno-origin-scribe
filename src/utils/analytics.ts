// Simple analytics utility for production
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isProduction = import.meta.env.PROD;

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    // In production, you would send this to your analytics service
    if (this.isProduction) {
      console.log('📊 Analytics Event:', event);
      // TODO: Send to analytics service like Google Analytics, Mixpanel, etc.
    } else {
      console.log('📊 Analytics Event (dev):', event);
    }
  }

  page(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page: pageName,
      ...properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.track('user_identify', {
      user_id: userId,
      ...traits,
    });
  }

  // Certificate-specific events
  certificateGenerated(certificateNumber: string) {
    this.track('certificate_generated', {
      certificate_number: certificateNumber,
    });
  }

  certificateVerified(certificateNumber: string, isValid: boolean) {
    this.track('certificate_verified', {
      certificate_number: certificateNumber,
      is_valid: isValid,
    });
  }

  userSignedIn(method: string) {
    this.track('user_signed_in', {
      method,
    });
  }

  userSignedOut() {
    this.track('user_signed_out');
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();