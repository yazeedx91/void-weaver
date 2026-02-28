// 🌌 VOID-Weaver API Client - Sovereign Communication Layer
// Unified API orchestration for Railway backend communication with robust error handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Railway backend configuration
const RAILWAY_BACKEND_URL = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://void-weaver-production.railway.app'
const API_TIMEOUT = 30000 // 30 seconds

class SovereignAPIClient {
  private client: AxiosInstance
  private retryCount = 3
  private retryDelay = 1000

  constructor() {
    this.client = axios.create({
      baseURL: RAILWAY_BACKEND_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': 'FLUX-DNA-v1.0.0',
        'X-Sovereign-Request': 'true'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('sovereign_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add locale header for bilingual support
        const locale = localStorage.getItem('preferred_locale') || 'ar'
        config.headers['Accept-Language'] = locale
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle errors gracefully
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          // Clear invalid token
          localStorage.removeItem('sovereign_token')
          
          // Redirect to neutral site
          this.quickExit()
          return Promise.reject(error)
        }

        // Handle 404 - Not Found
        if (error.response?.status === 404) {
          toast.error('Service temporarily unavailable. Please try again.')
          return this.fallbackResponse(originalRequest)
        }

        // Handle 500 - Server Error
        if (error.response?.status === 500) {
          toast.error('System experiencing high load. Retrying...')
          return this.retryRequest(originalRequest)
        }

        // Handle network errors
        if (!error.response) {
          toast.error('Connection lost. Attempting to reconnect...')
          return this.retryRequest(originalRequest)
        }

        return Promise.reject(error)
      }
    )
  }

  private async retryRequest(originalRequest: AxiosRequestConfig): Promise<any> {
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        return await this.client(originalRequest)
      } catch (error) {
        if (attempt === this.retryCount) {
          toast.error('Service unavailable. Please try again later.')
          throw error
        }
      }
    }
  }

  private fallbackResponse(originalRequest: AxiosRequestConfig): any {
    // Provide cached or fallback data for critical requests
    if (originalRequest.url?.includes('/agent/status')) {
      return Promise.resolve({
        data: {
          status: 'offline',
          message: 'Agent temporarily unavailable',
          last_seen: new Date().toISOString()
        }
      })
    }
    
    return Promise.reject(new Error('Service unavailable'))
  }

  private quickExit() {
    // Emergency redirect to neutral Saudi educational site
    const neutralSites = [
      'https://edu.gov.sa',
      'https://moe.gov.sa',
      'https://spd.gov.sa'
    ]
    
    const randomSite = neutralSites[Math.floor(Math.random() * neutralSites.length)]
    
    // Clear session
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirect
    window.location.href = randomSite
  }

  // Generic HTTP Methods (thin wrappers around Axios)
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  // Agent API Methods
  async startAgent(goal: string, locale: string = 'ar') {
    return this.client.post('/api/agent/start', { goal, locale })
  }

  async getAgentStatus(sessionId: string) {
    return this.client.get(`/api/agent/status/${sessionId}`)
  }

  async sendMessage(sessionId: string, message: string) {
    return this.client.post(`/api/agent/message/${sessionId}`, { message })
  }

  async approveRequest(requestId: string, approved: boolean) {
    return this.client.post(`/api/approvals/${requestId}`, { approved })
  }

  // Lovable Features API
  async createPlan(goal: string, locale: string = 'ar') {
    return this.client.post('/api/lovable/plan', { goal, locale })
  }

  async approvePlan(planId: string) {
    return this.client.post('/api/lovable/plan/approve', { plan_id: planId })
  }

  async getPromptQueue() {
    return this.client.get('/api/lovable/queue')
  }

  async addToQueue(prompt: string, repeatCount: number = 1, priority: string = 'normal') {
    return this.client.post('/api/lovable/queue/add', {
      prompt,
      repeat_count: repeatCount,
      priority
    })
  }

  // Memory API
  async storeMemory(sessionId: string, memory: any) {
    return this.client.post('/api/memory/store', { session_id: sessionId, memory })
  }

  async retrieveMemory(userId: string, limit: number = 10) {
    return this.client.get(`/api/memory/retrieve/${userId}?limit=${limit}`)
  }

  // OSINT & Pulse API
  async getDailyPulse(locale: string = 'ar') {
    return this.client.get(`/api/pulse/daily?locale=${locale}`)
  }

  async getIntergalacticBriefing() {
    return this.client.get('/api/pulse/briefing')
  }

  // Health Check
  async healthCheck() {
    return this.client.get('/api/health')
  }

  // File Upload with Metadata Erasure
  async uploadFile(file: File, type: string = 'general') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('strip_metadata', 'true')

    return this.client.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Singleton instance
export const apiClient = new SovereignAPIClient()

// Emergency exit function
export const quickExit = () => {
  apiClient['quickExit']()
}

// Breathing Emerald Button component integration
export const triggerEmergencyExit = () => {
  if (confirm('Activate Quick-Exit Protocol? This will clear your session and redirect to a safe site.')) {
    quickExit()
  }
}

// Global keyboard shortcut (Escape key)
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && event.ctrlKey) {
      event.preventDefault()
      triggerEmergencyExit()
    }
  })
}

export default apiClient
