"use client"

import React from 'react';
import { CheckCircle, Circle, Loader2, AlertCircle, Brain, Search, FileText } from 'lucide-react';
import './StatusSteps.css';

interface StatusStep {
  id: string
  label: string
  status: 'pending' | 'thinking' | 'executing' | 'completed' | 'error'
  icon?: React.ReactNode
  description?: string
}

interface StatusStepsProps {
  steps: StatusStep[]
  currentStep?: string
  className?: string
}

export function StatusSteps({ steps, currentStep, className = "" }: StatusStepsProps) {
  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'thinking':
        return <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'executing':
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'thinking':
        return 'border-blue-200 bg-blue-50'
      case 'executing':
        return 'border-orange-200 bg-orange-50'
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <h3 className="font-semibold text-gray-900">Agent Status</h3>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
              ${getStatusColor(step.status)}
              ${currentStep === step.id ? 'ring-2 ring-blue-400 shadow-sm' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {step.icon || getStatusIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {step.label}
                </span>
                {step.status === 'executing' && (
                  <span className="text-xs text-orange-600 font-medium animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
              
              {step.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-current opacity-60" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress indicator */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            data-width={`${Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}`}
          />
        </div>
        <p className="progress-text">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </p>
      </div>
    </div>
  )
}

// Predefined step types for common agent operations
export const createAgentSteps = (agentState: any): StatusStep[] => {
  const baseSteps: StatusStep[] = [
    {
      id: 'planning',
      label: 'Planning Strategy',
      status: 'pending',
      icon: <Brain className="w-4 h-4" />,
      description: 'Analyzing goal and creating execution plan'
    },
    {
      id: 'searching',
      label: 'Information Gathering',
      status: 'pending',
      icon: <Search className="w-4 h-4" />,
      description: 'Searching for relevant information'
    },
    {
      id: 'processing',
      label: 'Data Processing',
      status: 'pending',
      icon: <FileText className="w-4 h-4" />,
      description: 'Processing and analyzing collected data'
    },
    {
      id: 'finalizing',
      label: 'Finalizing Results',
      status: 'pending',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Compiling final results and insights'
    }
  ]

  // Update step statuses based on agent state
  if (agentState?.status === 'planning') {
    baseSteps[0].status = 'executing'
  } else if (agentState?.status === 'executing') {
    baseSteps[0].status = 'completed'
    baseSteps[1].status = 'executing'
  } else if (agentState?.status === 'reflecting') {
    baseSteps[0].status = 'completed'
    baseSteps[1].status = 'completed'
    baseSteps[2].status = 'executing'
  } else if (agentState?.status === 'completed') {
    baseSteps.forEach(step => step.status = 'completed')
  } else if (agentState?.status === 'error') {
    const currentStep = baseSteps.find(s => s.status === 'executing')
    if (currentStep) {
      currentStep.status = 'error'
    }
  }

  return baseSteps
}
