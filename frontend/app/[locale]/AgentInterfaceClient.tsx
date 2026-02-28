"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusSteps, createAgentSteps } from '@/components/agent/StatusSteps';
import { DataGrid, createDataItemsFromToolOutput } from '@/components/agent/DataCard';
import { ApprovalQueue, createApprovalRequest } from '@/components/agent/ApprovalButton';
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface AgentState {
  status: 'thinking' | 'planning' | 'executing' | 'reflecting' | 'completed' | 'error';
  current_step: string;
  step_count: number;
  max_steps: number;
  plan: string[];
  tools_output: Record<string, any>;
  error_message?: string;
  session_id: string;
  user_goal: string;
}

interface UIState {
  isRunning: boolean;
  currentView: 'chat' | 'data' | 'approvals';
  pendingApprovals: any[];
  showDetails: boolean;
}

export default function AgentInterfaceClient({ locale }: { locale: string }) {
  const t = useTranslations();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'thinking',
    current_step: '',
    step_count: 0,
    max_steps: 10,
    plan: [],
    tools_output: {},
    session_id: '',
    user_goal: ''
  });

  const [uiState, setUIState] = useState<UIState>({
    isRunning: false,
    currentView: 'chat',
    pendingApprovals: [],
    showDetails: false
  });

  const [dataItems, setDataItems] = useState<any[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
  const [showHijri, setShowHijri] = useState(locale === 'ar');

  useEffect(() => {
    if (agentState.tools_output && Object.keys(agentState.tools_output).length > 0) {
      const items = createDataItemsFromToolOutput(agentState.tools_output);
      setDataItems(items);
    }
  }, [agentState.tools_output]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || uiState.isRunning) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUIState(prev => ({ ...prev, isRunning: true }));

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        },
        body: JSON.stringify({
          goal: input.trim(),
          sessionId: agentState.session_id || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to start agent');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.type === 'state_update') {
                setAgentState(data.state);
              } else if (data.type === 'message') {
                setMessages(prev => [...prev, data.message]);
              } else if (data.type === 'approval_request') {
                const approval = createApprovalRequest(data.request, data.request.type);
                setApprovalRequests(prev => [...prev, approval]);
                setUIState(prev => ({ ...prev, currentView: 'approvals' }));
              } else if (data.type === 'completion' || data.type === 'error') {
                setUIState(prev => ({ ...prev, isRunning: false }));
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('Agent execution error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ ${t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          timestamp: new Date().toISOString()
        }
      ]);
      setUIState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const agentSteps = createAgentSteps(agentState);

  const formatDate = (date: Date) => {
    if (locale === 'ar' && showHijri) {
      return date.toLocaleDateString('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-blue-500" />
                <div>
                  <CardTitle className="text-2xl">{t('common.appName')}</CardTitle>
                  <p className="text-gray-600">
                    {locale === 'ar'
                      ? 'نظام الوكيل من المستوى الثالث'
                      : 'Level 3 AI-Native Agentic System'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {locale === 'ar' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHijri(!showHijri)}
                  >
                    {showHijri ? t('time.gregorian') : t('time.hijri')}
                  </Button>
                )}

                <Badge
                  variant={agentState.status === 'completed' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {t(`agent.status.${agentState.status}`)}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessages([]);
                    setAgentState({
                      status: 'thinking',
                      current_step: '',
                      step_count: 0,
                      max_steps: 10,
                      plan: [],
                      tools_output: {},
                      session_id: '',
                      user_goal: ''
                    });
                    setUIState({
                      isRunning: false,
                      currentView: 'chat',
                      pendingApprovals: [],
                      showDetails: false
                    });
                    setDataItems([]);
                    setApprovalRequests([]);
                  }}
                  disabled={uiState.isRunning}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {t('agent.actions.reset')}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-[500px] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('navigation.messages')}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('agent.messages.startConversation')}</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatDate(new Date(message.timestamp))}
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

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t('agent.messages.placeholder')}
                    disabled={uiState.isRunning}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!input.trim() || uiState.isRunning}>
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

          <div className="space-y-4">
            <StatusSteps steps={agentSteps} currentStep={agentState.current_step} />

            <Card>
              <CardHeader>
                <div className="flex gap-2">
                  <Button
                    variant={uiState.currentView === 'chat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'chat' }))}
                  >
                    {t('navigation.messages')}
                  </Button>
                  <Button
                    variant={uiState.currentView === 'data' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'data' }))}
                  >
                    {t('navigation.data')} ({dataItems.length})
                  </Button>
                  <Button
                    variant={uiState.currentView === 'approvals' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUIState(prev => ({ ...prev, currentView: 'approvals' }))}
                  >
                    {t('navigation.approvals')} ({approvalRequests.filter(r => r.status === 'pending').length})
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {uiState.currentView === 'data' && (
                  <DataGrid data={dataItems} className="max-h-[300px] overflow-y-auto" />
                )}

                {uiState.currentView === 'approvals' && (
                  <ApprovalQueue
                    requests={approvalRequests}
                    onApprove={async requestId => {
                      setApprovalRequests(prev =>
                        prev.map(req =>
                          req.id === requestId ? { ...req, status: 'approved' as const } : req
                        )
                      );
                    }}
                    onReject={async requestId => {
                      setApprovalRequests(prev =>
                        prev.map(req =>
                          req.id === requestId ? { ...req, status: 'rejected' as const } : req
                        )
                      );
                    }}
                    className="max-h-[300px] overflow-y-auto"
                  />
                )}

                {uiState.currentView === 'chat' && (
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>{t('time.now')}:</strong> {formatDate(new Date())}
                    </p>
                    <p>
                      <strong>{t('agent.status.completed')}:</strong> {agentState.step_count}/{agentState.max_steps}
                    </p>
                    <p>
                      <strong>{locale === 'ar' ? 'الهدف' : 'Goal'}:</strong>{' '}
                      {agentState.user_goal || t('common.loading')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
