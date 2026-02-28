"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusSteps, createAgentSteps } from '@/components/agent/StatusSteps'
import { DataCard, DataGrid, createDataItemsFromToolOutput } from '@/components/agent/DataCard'
import { ApprovalQueue, createApprovalRequest } from '@/components/agent/ApprovalButton'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  PlayCircle,
  PauseCircle,
  Square,
  Download,
  RefreshCw,
  MessageSquare
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

interface AgentState {
  status: 'thinking' | 'planning' | 'executing' | 'reflecting' | 'completed' | 'error'
  current_step: string
  step_count: number
  max_steps: number
  plan: string[]
  tools_output: Record<string, any>
  error_message?: string
  session_id: string
  user_goal: string
}

interface UIState {
  isRunning: boolean
  currentView: 'chat' | 'data' | 'approvals'
  pendingApprovals: any[]
  showDetails: boolean
}

export default function AgentInterface() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'thinking',
    current_step: '',
    step_count: 0,
    max_steps: 10,
    plan: [],
    tools_output: {},
    session_id: '',
    user_goal: ''
  })
  
  const [uiState, setUIState] = useState<UIState>({
    isRunning: false,
    currentView: 'chat',
    pendingApprovals: [],
    showDetails: false
  })

  const [dataItems, setDataItems] = useState<any[]>([])
  const [approvalRequests, setApprovalRequests] = useState<any[]>([])

  // Update data items when agent state changes
  useEffect(() => {
    if (agentState.tools_output && Object.keys(agentState.tools_output).length > 0) {
      const items = createDataItemsFromToolOutput(agentState.tools_output)
      setDataItems(items)
    }
  }, [agentState.tools_output])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || uiState.isRunning) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setUIState(prev => ({ ...prev, isRunning: true }))

    try {
      // Call the agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goal: input.trim(),
          sessionId: agentState.session_id || undefined
        })
      })

      if (!response.ok) throw new Error('Failed to start agent')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              
              if (data.type === 'state_update') {
                setAgentState(data.state)
              } else if (data.type === 'message') {
                setMessages(prev => [...prev, data.message])
              } else if (data.type === 'approval_request') {
                const approval = createApprovalRequest(data.request, data.request.type)
                setApprovalRequests(prev => [...prev, approval])
                setUIState(prev => ({ ...prev, currentView: 'approvals' }))
              } else if (data.type === 'completion' || data.type === 'error') {
                setUIState(prev => ({ ...prev, isRunning: false }))
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Agent execution error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date().toISOString()
      }])
      setUIState(prev => ({ ...prev, isRunning: false }))
    }
  }

  // Handle approval actions
  const handleApprove = async (requestId: string) => {
    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    )
    
    // Notify backend of approval
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' })
      })
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const }
          : req
      )
    )
    
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject' })
      })
    } catch (error) {
      console.error('Rejection error:', error)
    }
  }

  const handleReset = () => {
    setMessages([])
    setAgentState({
      status: 'thinking',
      current_step: '',
      step_count: 0,
      max_steps: 10,
      plan: [],
      tools_output: {},
      session_id: '',
      user_goal: ''
    })
    setUIState({
      isRunning: false,
      currentView: 'chat',
      pendingApprovals: [],
      showDetails: false
    })
    setDataItems([])
    setApprovalRequests([])
  }

  const agentSteps = createAgentSteps(agentState)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-blue-500" />
                <div>
                  <CardTitle className="text-2xl">OMEGA-1 Agent Interface</CardTitle>
                  <p className="text-gray-600">Level 3 AI-Native Agentic System</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={agentState.status === 'completed' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {agentState.status.toUpperCase()}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={uiState.isRunning}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Messages */}
            <Card className="h-[500px] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation with the agent</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Bot className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <User className="w-8 h-8 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Input Form */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your goal or task..."
                    disabled={uiState.isRunning}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || uiState.isRunning}
                  >
                    {uiState.isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Steps */}
            <StatusSteps 
              steps={agentSteps}
              currentStep={agentState.current_step}
            />

            {/* View Tabs */}
            <Card>
              <CardHeader>
                <div className="flex gap-2">
                  <Button
                    variant={uiState.currentView === 'chat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'chat' }))}
                  >
                    Chat
                  </Button>
                  <Button
                    variant={uiState.currentView === 'data' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'data' }))}
                  >
                    Data ({dataItems.length})
                  </Button>
                  <Button
                    variant={uiState.currentView === 'approvals' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'approvals' }))}
                  >
                    Approvals ({approvalRequests.filter(r => r.status === 'pending').length})
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {uiState.currentView === 'data' && (
                  <DataGrid 
                    data={dataItems}
                    className="max-h-[300px] overflow-y-auto"
                  />
                )}
                
                {uiState.currentView === 'approvals' && (
                  <ApprovalQueue
                    requests={approvalRequests}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    className="max-h-[300px] overflow-y-auto"
                  />
                )}
                
                {uiState.currentView === 'chat' && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Session:</strong> {agentState.session_id || 'Not started'}</p>
                    <p><strong>Steps:</strong> {agentState.step_count}/{agentState.max_steps}</p>
                    <p><strong>Goal:</strong> {agentState.user_goal || 'None'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
