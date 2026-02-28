import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Cpu,
  Shield,
  Brain,
  Globe,
  Server
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface HealthCheck {
  component: string;
  component_type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL';
  message: string;
  response_time: number;
  timestamp: string;
  details: any;
}

interface HealthData {
  overall_status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL';
  timestamp: string;
  version: string;
  environment: string;
  checks: HealthCheck[];
  summary: {
    total_checks: number;
    status_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
    average_response_time: number;
    critical_issues: string[];
    degraded_components: string[];
  };
  uptime: string;
  guardian_status: string;
}

const HealthMonitor: React.FC = () => {
  const t = useTranslations('health');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.healthCheck();
      setHealthData(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'UNHEALTHY':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-600 animate-pulse" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DEGRADED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNHEALTHY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComponentIcon = (componentType: string) => {
    switch (componentType) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'system':
        return <Cpu className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'memory':
        return <Brain className="w-4 h-4" />;
      case 'ai_service':
        return <Activity className="w-4 h-4" />;
      case 'external_api':
        return <Globe className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading health data...</span>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Health Check Failed</h2>
          <p className="text-gray-600 mb-4">Unable to fetch health data from the server.</p>
          <Button onClick={fetchHealthData} className="bg-blue-500 hover:bg-blue-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">System Health Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-1" />
                Last refresh: {lastRefresh?.toLocaleTimeString() || 'Never'}
              </div>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button onClick={fetchHealthData} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(healthData.overall_status)}
              <span className="ml-2">Overall System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.overall_status)}`}>
                  {healthData.overall_status}
                </div>
                <p className="text-sm text-gray-600 mt-2">System Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{healthData.summary.total_checks}</div>
                <p className="text-sm text-gray-600">Total Checks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{healthData.summary.average_response_time.toFixed(0)}ms</div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{healthData.uptime}</div>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        {healthData.summary.critical_issues.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="w-5 h-5 mr-2" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthData.summary.critical_issues.map((issue, index) => (
                  <div key={index} className="flex items-center text-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    {issue}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Checks by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {Object.entries(
            healthData.checks.reduce((acc, check) => {
              if (!acc[check.component_type]) {
                acc[check.component_type] = [];
              }
              acc[check.component_type].push(check);
              return acc;
            }, {} as Record<string, HealthCheck[]>)
          ).map(([type, checks]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getComponentIcon(type)}
                  <span className="ml-2 capitalize">{type.replace('_', ' ')}</span>
                  <Badge className="ml-2" variant="outline">
                    {checks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getStatusIcon(check.status)}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{check.component}</div>
                          <div className="text-sm text-gray-600">{check.message}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{check.response_time.toFixed(0)}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="w-5 h-5 mr-2" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{healthData.version}</div>
                <p className="text-sm text-gray-600">Version</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{healthData.environment}</div>
                <p className="text-sm text-gray-600">Environment</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{healthData.guardian_status}</div>
                <p className="text-sm text-gray-600">Guardian Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthMonitor;
