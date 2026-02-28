import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Code, 
  Palette, 
  TestTube, 
  Server, 
  Zap,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Layers,
  MessageSquare,
  Image,
  Globe
} from 'lucide-react';

interface LovableFeature {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'beta';
  icon: React.ReactNode;
  config?: any;
}

interface PlanModeData {
  id: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  goal: string;
  generated_at: string;
}

interface PromptQueueItem {
  id: string;
  prompt: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  repeat_count: number;
  priority: 'low' | 'normal' | 'high';
}

export function LovableFeaturesPanel({ locale }: { locale: string }) {
  const t = useTranslations();
  
  const [features, setFeatures] = useState<LovableFeature[]>([
    {
      id: 'plan_mode',
      name: t('lovable.features.planMode') || 'Plan Mode',
      description: t('lovable.features.planModeDesc') || 'Review and approve detailed plans before code generation',
      status: 'enabled',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      id: 'prompt_queue',
      name: t('lovable.features.promptQueue') || 'Prompt Queue',
      description: t('lovable.features.promptQueueDesc') || 'Queue, reorder, and repeat prompts',
      status: 'enabled',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 'visual_edits',
      name: t('lovable.features.visualEdits') || 'Visual Edits',
      description: t('lovable.features.visualEditsDesc') || 'AI-powered image generation and design',
      status: 'enabled',
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: 'browser_testing',
      name: t('lovable.features.browserTesting') || 'Browser Testing',
      description: t('lovable.features.browserTestingDesc') || 'End-to-end testing and screenshots',
      status: 'beta',
      icon: <TestTube className="w-5 h-5" />
    },
    {
      id: 'mcp_servers',
      name: t('lovable.features.mcpServers') || 'MCP Servers',
      description: t('lovable.features.mcpServersDesc') || 'Model Context Protocol integrations',
      status: 'enabled',
      icon: <Server className="w-5 h-5" />
    },
    {
      id: 'environments',
      name: t('lovable.features.environments') || 'Test/Live Environments',
      description: t('lovable.features.environmentsDesc') || 'Separate test and production environments',
      status: 'beta',
      icon: <Layers className="w-5 h-5" />
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState<PlanModeData | null>(null);
  const [promptQueue, setPromptQueue] = useState<PromptQueueItem[]>([]);
  const [isQueuePaused, setIsQueuePaused] = useState(false);

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, status: feature.status === 'enabled' ? 'disabled' : 'enabled' }
        : feature
    ));
  };

  const createPlan = async (goal: string) => {
    try {
      const response = await fetch('/api/lovable/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, locale })
      });
      
      const planData = await response.json();
      setCurrentPlan(planData);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const approvePlan = async () => {
    if (!currentPlan) return;
    
    try {
      const response = await fetch('/api/lovable/plan/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: currentPlan.id })
      });
      
      if (response.ok) {
        setCurrentPlan(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (error) {
      console.error('Failed to approve plan:', error);
    }
  };

  const addToQueue = (prompt: string, repeat: number = 1) => {
    const newItem: PromptQueueItem = {
      id: `queue_${Date.now()}`,
      prompt,
      status: 'queued',
      repeat_count: repeat,
      priority: 'normal'
    };
    
    setPromptQueue(prev => [...prev, newItem]);
  };

  const processQueue = async () => {
    if (isQueuePaused) return;
    
    const queuedItems = promptQueue.filter(item => item.status === 'queued');
    
    for (const item of queuedItems) {
      if (isQueuePaused) break;
      
      // Update status to running
      setPromptQueue(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'running' } : i
      ));
      
      try {
        // Process the prompt
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: item.prompt, locale })
        });
        
        // Update status to completed
        setPromptQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'completed' } : i
        ));
        
        // Handle repeat count
        if (item.repeat_count > 1) {
          const repeatItem = { ...item, repeat_count: item.repeat_count - 1 };
          setPromptQueue(prev => [...prev, repeatItem]);
        }
        
      } catch (error) {
        // Update status to failed
        setPromptQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'failed' } : i
        ));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-500';
      case 'disabled': return 'bg-gray-500';
      case 'beta': return 'bg-blue-500';
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Lovable 2.0 Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(feature => (
              <div
                key={feature.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="font-medium">{feature.name}</span>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeature(feature.id)}
                  className="w-full"
                >
                  {feature.status === 'enabled' ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Plan Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{currentPlan.goal}</h3>
                  <p className="text-sm text-gray-600">
                    Generated: {new Date(currentPlan.generated_at).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusColor(currentPlan.status)}>
                  {currentPlan.status}
                </Badge>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{currentPlan.plan}</pre>
              </div>
              
              {currentPlan.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={approvePlan} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Revise Plan
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">No active plan. Create one to get started.</p>
              <Button onClick={() => createPlan('Build bilingual agent interface')}>
                Create Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Prompt Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQueuePaused(!isQueuePaused)}
            >
              {isQueuePaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isQueuePaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={processQueue}
              disabled={isQueuePaused}
            >
              Process Queue
            </Button>
            <span className="text-sm text-gray-600">
              {promptQueue.filter(i => i.status === 'queued').length} queued
            </span>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {promptQueue.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                No prompts in queue
              </div>
            ) : (
              promptQueue.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.repeat_count > 1 && (
                        <span className="text-xs text-gray-600">
                          Repeat: {item.repeat_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* MCP Servers Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            MCP Servers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'ElevenLabs', status: 'connected', purpose: 'Voice generation' },
              { name: 'Perplexity', status: 'connected', purpose: 'Enhanced search' },
              { name: 'Firecrawl', status: 'connected', purpose: 'Web scraping' },
              { name: 'Miro', status: 'disconnected', purpose: 'Visual collaboration' }
            ].map(server => (
              <div key={server.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{server.name}</p>
                  <p className="text-sm text-gray-600">{server.purpose}</p>
                </div>
                <Badge className={server.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}>
                  {server.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
