/**
 * API Client for FLUX-DNA Backend
 * Handles all API communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Assessment APIs
  async startAssessment(data: { language: string; persona: string; user_email: string }) {
    return this.request('/api/assessment/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(data: { session_id: string; message: string }) {
    return this.request('/api/assessment/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitResponses(data: { session_id: string; scale_type: string; responses_encrypted: string }) {
    return this.request('/api/assessment/submit-responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeAssessment(data: { session_id: string; user_id: string; all_responses_encrypted: any }) {
    return this.request('/api/assessment/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getScales() {
    return this.request('/api/assessment/scales');
  }

  // Sanctuary APIs
  async startSanctuarySession(data: { user_id: string; pillar: string; language: string }) {
    return this.request('/api/sanctuary/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitEvidence(data: any) {
    return this.request('/api/sanctuary/evidence', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSanctuaryResources() {
    return this.request('/api/sanctuary/resources');
  }

  // Founder Dashboard APIs
  async getFounderMetrics(password: string) {
    return this.request('/api/founder/metrics', {
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }

  async sendDailyPulse(password: string) {
    return this.request('/api/founder/send-pulse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }

  async getAnalyticsTimeline(password: string, days: number = 7) {
    return this.request(`/api/founder/analytics/timeline?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }
}

export const apiClient = new APIClient();