/**
 * API Client for FLUX-DNA Backend
 * NEURAL-FIRST ARCHITECTURE
 * Handles all API communication with AI directive support
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Neural Directive Interface - AI commands for UI
export interface NeuralDirective {
  should_pivot: boolean;
  pivot_to_mode: string | null;
  ui_commands: {
    pulse_color?: string;
    cloak_mode?: boolean;
    enable_quick_exit?: boolean;
    show_emergency_resources?: boolean;
    transition_to?: string;
    show_confetti?: boolean;
    reveal_animation?: boolean;
    enable_ceremonial_mode?: boolean;
    suggest_sanctuary?: boolean;
    soften_colors?: boolean;
  };
  persona_adjustment: string;
  detected_state: string;
  emergency_resources: boolean;
}

export interface StateTransition {
  previous: string;
  current: string;
  mode: string;
  trigger: string;
}

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

  // OSINT Check - Get connection risk score
  async checkOSINT() {
    try {
      const response = await this.request<{ risk_score: number; risk_level: string }>('/api/osint/check', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return response;
    } catch {
      return { risk_score: 0, risk_level: 'LOW' };
    }
  }

  // Assessment APIs with Neural Directive support
  async startAssessment(data: { 
    language: string; 
    persona: string; 
    user_email: string;
    osint_risk?: number;
  }): Promise<{
    session_id: string;
    persona: string;
    language: string;
    initial_message: string;
    status: string;
    neural_directive: NeuralDirective;
  }> {
    return this.request('/api/assessment/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(data: { 
    session_id: string; 
    message: string;
    osint_risk?: number;
  }): Promise<{
    response: string;
    session_id: string;
    assessment_complete: boolean;
    neural_directive: NeuralDirective;
    state_transition: StateTransition;
  }> {
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

  async completeAssessment(data: { 
    session_id: string; 
    user_id: string; 
    all_responses_encrypted: any 
  }): Promise<{
    session_id: string;
    status: string;
    analysis_preview: string;
    sovereign_title: string;
    sar_value: number;
    user_cost: number;
    certificate_ready: boolean;
    results_link: string;
    certificate_link: string;
    link_token: string;
    expires_at: string;
    max_clicks: number;
    neural_directive: NeuralDirective;
  }> {
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