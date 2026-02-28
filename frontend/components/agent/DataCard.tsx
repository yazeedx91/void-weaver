"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Copy,
  Eye,
  Calendar,
  Tag
} from 'lucide-react'

interface DataItem {
  id: string
  title: string
  content: string
  type: 'text' | 'url' | 'file' | 'search_result'
  metadata?: {
    url?: string
    source?: string
    timestamp?: string
    tags?: string[]
    size?: number
  }
}

interface DataCardProps {
  data: DataItem
  onView?: (data: DataItem) => void
  onCopy?: (content: string) => void
  onDownload?: (data: DataItem) => void
  className?: string
}

export function DataCard({ 
  data, 
  onView, 
  onCopy, 
  onDownload, 
  className = "" 
}: DataCardProps) {
  const getTypeIcon = (type: DataItem['type']) => {
    switch (type) {
      case 'url':
        return <ExternalLink className="w-4 h-4 text-blue-500" />
      case 'file':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'search_result':
        return <Eye className="w-4 h-4 text-orange-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: DataItem['type']) => {
    switch (type) {
      case 'url':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'file':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'search_result':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(data.content)
    } else {
      await navigator.clipboard.writeText(data.content)
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(data.type)}
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {data.title}
            </CardTitle>
          </div>
          
          <Badge 
            variant="outline" 
            className={`ml-2 ${getTypeColor(data.type)}`}
          >
            {data.type.replace('_', ' ')}
          </Badge>
        </div>
        
        {/* Metadata */}
        {data.metadata && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.metadata.source && (
              <Badge variant="secondary" className="text-xs">
                Source: {data.metadata.source}
              </Badge>
            )}
            {data.metadata.timestamp && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(data.metadata.timestamp).toLocaleDateString()}
              </div>
            )}
            {data.metadata.size && (
              <Badge variant="outline" className="text-xs">
                {formatFileSize(data.metadata.size)}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Content preview */}
        <div className="text-sm text-gray-700 leading-relaxed">
          {formatContent(data.content)}
        </div>
        
        {/* Tags */}
        {data.metadata?.tags && data.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.metadata.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(data)}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
          
          {data.metadata?.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(data.metadata!.url, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </Button>
          )}
          
          {onDownload && data.type === 'file' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(data)}
              className="flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Data Grid component for multiple cards
interface DataGridProps {
  data: DataItem[]
  onView?: (data: DataItem) => void
  onCopy?: (content: string) => void
  onDownload?: (data: DataItem) => void
  className?: string
}

export function DataGrid({ 
  data, 
  onView, 
  onCopy, 
  onDownload, 
  className = "" 
}: DataGridProps) {
  if (data.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {data.map((item) => (
        <DataCard
          key={item.id}
          data={item}
          onView={onView}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      ))}
    </div>
  )
}

// Helper function to create data items from agent tool outputs
export const createDataItemsFromToolOutput = (toolOutputs: any): DataItem[] => {
  const items: DataItem[] = []
  
  Object.entries(toolOutputs).forEach(([key, output]: [string, any]) => {
    if (key.includes('error')) return
    
    if (key.includes('web_search') && output?.results) {
      output.results.forEach((result: any, index: number) => {
        items.push({
          id: `${key}_${index}`,
          title: result.title || `Search Result ${index + 1}`,
          content: result.snippet || result.content || '',
          type: 'search_result',
          metadata: {
            url: result.url,
            source: result.source || 'web_search',
            timestamp: new Date().toISOString(),
            tags: ['search', 'web']
          }
        })
      })
    } else if (key.includes('file_writer') && output) {
      items.push({
        id: key,
        title: output.file_path || `File Operation`,
        content: output.content || `File ${output.action} successfully`,
        type: 'file',
        metadata: {
          source: 'file_writer',
          timestamp: new Date().toISOString(),
          tags: ['file', 'document'],
          size: output.size
        }
      })
    }
  })
  
  return items
}
