/**
 * FLUX-DNA API Client
 * Connects Vite Frontend to FastAPI Backend
 * Neural-First Architecture Integration
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Neural Directive from Backend
export interface NeuralDirective {
  should_pivot: boolean;
  pivot_to_mode: string | null;
  ui_commands: {
    pulse_color?: string;
    cloak_mode?: boolean;
    enable_quick_exit?: boolean;
    show_emergency_resources?: boolean;
    show_confetti?: boolean;
    enable_ceremonial_mode?: boolean;
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

export interface AssessmentStartResponse {
  session_id: string;
  persona: string;
  language: string;
  initial_message: string;
  status: string;
  neural_directive: NeuralDirective;
}

export interface AssessmentMessageResponse {
  response: string;
  session_id: string;
  assessment_complete: boolean;
  neural_directive: NeuralDirective;
  state_transition: StateTransition;
}

export interface AssessmentCompleteResponse {
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
}

export interface OSINTCheckResponse {
  risk_score: number;
  risk_level: string;
  indicators: string[];
  recommendation: string;
}

class FluxDNAClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE;
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
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; phoenix: string }>('/health');
  }

  // OSINT Safety Check
  async checkOSINT(): Promise<OSINTCheckResponse> {
    try {
      return await this.request<OSINTCheckResponse>('/osint/check', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } catch {
      // Return safe defaults if OSINT fails
      return {
        risk_score: 0,
        risk_level: 'LOW',
        indicators: [],
        recommendation: 'proceed_normal',
      };
    }
  }

  // Start Neural Assessment
  async startAssessment(data: {
    language: string;
    persona: string;
    user_email: string;
    osint_risk?: number;
  }): Promise<AssessmentStartResponse> {
    return this.request<AssessmentStartResponse>('/assessment/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Send message with Neural Routing
  async sendMessage(data: {
    session_id: string;
    message: string;
    osint_risk?: number;
  }): Promise<AssessmentMessageResponse> {
    return this.request<AssessmentMessageResponse>('/assessment/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Complete Assessment
  async completeAssessment(data: {
    session_id: string;
    user_id: string;
    all_responses_encrypted?: object;
  }): Promise<AssessmentCompleteResponse> {
    return this.request<AssessmentCompleteResponse>('/assessment/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Founder Metrics
  async getFounderMetrics(password: string) {
    return this.request('/founder/metrics', {
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }

  // Generate AI Strategic Briefing
  async getStrategicBriefing(password: string) {
    return this.request('/founder/strategic-briefing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }

  // Send AI-Driven Daily Pulse
  async sendAIPulse(password: string) {
    return this.request('/founder/send-ai-pulse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
      },
    });
  }

  // Download Certificate
  getCertificateURL(token: string): string {
    return `${this.baseURL}/certificate/download/${token}`;
  }
}

export const fluxAPI = new FluxDNAClient();
