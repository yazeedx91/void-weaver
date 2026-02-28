"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Loader2,
  Eye,
  MessageSquare
} from 'lucide-react'

interface ApprovalRequest {
  id: string
  type: 'tool_execution' | 'file_access' | 'web_search' | 'data_export'
  title: string
  description: string
  details?: {
    tool_name?: string
    parameters?: any
    file_path?: string
    url?: string
    risk_level?: 'low' | 'medium' | 'high'
  }
  timestamp: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
}

interface ApprovalButtonProps {
  request: ApprovalRequest
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onViewDetails?: (request: ApprovalRequest) => void
  autoApprove?: boolean
  className?: string
}

export function ApprovalButton({
  request,
  onApprove,
  onReject,
  onViewDetails,
  autoApprove = false,
  className = ""
}: ApprovalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: ApprovalRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const handleApprove = async () => {
    if (onApprove) {
      setIsProcessing(true)
      try {
        await onApprove(request.id)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleReject = async () => {
    if (onReject) {
      setIsProcessing(true)
      try {
        await onReject(request.id)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const isDisabled = request.status !== 'pending' || isProcessing

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            <CardTitle className="text-base font-semibold">
              {request.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {request.details?.risk_level && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getRiskColor(request.details.risk_level)}`}
              >
                {request.details.risk_level.toUpperCase()} RISK
              </Badge>
            )}
            
            <Badge 
              variant={request.status === 'pending' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {request.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">
          {request.description}
        </p>
        
        {/* Additional details */}
        {request.details && (
          <div className="text-xs text-gray-600 space-y-1">
            {request.details.tool_name && (
              <div>
                <strong>Tool:</strong> {request.details.tool_name}
              </div>
            )}
            {request.details.file_path && (
              <div>
                <strong>File:</strong> {request.details.file_path}
              </div>
            )}
            {request.details.url && (
              <div>
                <strong>URL:</strong> {request.details.url}
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          Requested: {new Date(request.timestamp).toLocaleString()}
        </div>
        
        {/* Action buttons */}
        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2 border-t">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(request)}
                className="flex items-center gap-1"
                disabled={isDisabled}
              >
                <Eye className="w-3 h-3" />
                Details
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isDisabled}
              className="flex items-center gap-1"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              Reject
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleApprove}
              disabled={isDisabled}
              className="flex items-center gap-1"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Approve
            </Button>
          </div>
        )}
        
        {/* Status message for non-pending requests */}
        {request.status !== 'pending' && (
          <div className="text-xs text-gray-500 italic">
            {request.status === 'approved' && '✅ Request approved'}
            {request.status === 'rejected' && '❌ Request rejected'}
            {request.status === 'expired' && '⏰ Request expired'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Approval Queue component for multiple requests
interface ApprovalQueueProps {
  requests: ApprovalRequest[]
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onViewDetails?: (request: ApprovalRequest) => void
  autoApproveLowRisk?: boolean
  className?: string
}

export function ApprovalQueue({
  requests,
  onApprove,
  onReject,
  onViewDetails,
  autoApproveLowRisk = false,
  className = ""
}: ApprovalQueueProps) {
  const pendingRequests = requests.filter(r => r.status === 'pending')
  
  if (pendingRequests.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No pending approvals</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-gray-900">
          Pending Approvals ({pendingRequests.length})
        </h3>
      </div>
      
      {pendingRequests.map((request) => (
        <ApprovalButton
          key={request.id}
          request={request}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetails={onViewDetails}
          autoApprove={autoApproveLowRisk && request.details?.risk_level === 'low'}
        />
      ))}
    </div>
  )
}

// Helper function to create approval requests from agent actions
export const createApprovalRequest = (
  action: any,
  type: ApprovalRequest['type']
): ApprovalRequest => {
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: `Approval needed for ${type.replace('_', ' ')}`,
    description: `The agent needs your permission to ${action.description || 'perform an action'}`,
    details: {
      tool_name: action.tool_name,
      parameters: action.parameters,
      risk_level: action.risk_level || 'medium'
    },
    timestamp: new Date().toISOString(),
    status: 'pending'
  }
}
