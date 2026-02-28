import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Activity, 
  Eye,
  Ban,
  TrendingUp,
  Globe,
  Clock,
  Users,
  Database
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  source_ip: string;
  user_agent: string;
  request_path: string;
  request_method: string;
  anomaly_score: number;
  blocked: boolean;
  details: any;
}

interface ThreatIntelligence {
  blocked_ips: number;
  ip_reputation: Record<string, number>;
  active_threats: number;
  recent_events: SecurityEvent[];
  system_status: {
    protection_active: boolean;
    anomaly_threshold: number;
    blocked_ips_count: number;
    threat_signatures_count: number;
    zero_day_patterns_count: number;
    last_update: string;
  };
}

const SecurityMonitor: React.FC = () => {
  const t = useTranslations('security');
  const [threatData, setThreatData] = useState<ThreatIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchThreatData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/security/threat-intelligence');
      setThreatData(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch threat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatData();

    if (autoRefresh) {
      const interval = setInterval(fetchThreatData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'HIGH':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'EMERGENCY':
        return <Shield className="w-5 h-5 text-red-700 animate-pulse" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-900 border-red-400 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'command_injection':
        return <Database className="w-4 h-4" />;
      case 'unknown_payload':
        return <AlertTriangle className="w-4 h-4" />;
      case 'anomalous_behavior':
        return <Activity className="w-4 h-4" />;
      case 'zero_day_exploit':
        return <Shield className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getIpReputationColor = (score: number) => {
    if (score < -0.5) return 'text-red-600';
    if (score < -0.2) return 'text-orange-600';
    if (score < 0) return 'text-yellow-600';
    if (score > 0.5) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading && !threatData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Shield className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading security data...</span>
      </div>
    );
  }

  if (!threatData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Security Monitor Unavailable</h2>
          <p className="text-gray-600 mb-4">Unable to fetch security threat data.</p>
          <Button onClick={fetchThreatData} className="bg-blue-500 hover:bg-blue-600">
            <Shield className="w-4 h-4 mr-2" />
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
              <Shield className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Zero-Day Protection Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Last refresh: {lastRefresh?.toLocaleTimeString() || 'Never'}
              </div>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button onClick={fetchThreatData} size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Protection System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  threatData.system_status.protection_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {threatData.system_status.protection_active ? 'ACTIVE' : 'INACTIVE'}
                </div>
                <p className="text-sm text-gray-600 mt-2">Protection Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{threatData.blocked_ips}</div>
                <p className="text-sm text-gray-600">Blocked IPs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{threatData.active_threats}</div>
                <p className="text-sm text-gray-600">Active Threats</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{threatData.system_status.threat_signatures_count}</div>
                <p className="text-sm text-gray-600">Threat Signatures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Threats */}
        {threatData.recent_events.filter(event => 
          ['CRITICAL', 'EMERGENCY'].includes(event.threat_level)
        ).length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Shield className="w-5 h-5 mr-2" />
                Critical Threats Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threatData.recent_events
                  .filter(event => ['CRITICAL', 'EMERGENCY'].includes(event.threat_level))
                  .slice(0, 5)
                  .map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center">
                        {getThreatIcon(event.threat_level)}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{event.event_type}</div>
                          <div className="text-sm text-gray-600">{event.source_ip} - {event.request_path}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(event.threat_level)}`}>
                          {event.threat_level}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.blocked ? 'BLOCKED' : 'MONITORED'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Security Events
                <Badge className="ml-2" variant="outline">
                  {threatData.recent_events.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {threatData.recent_events.slice(0, 10).map((event, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center">
                      {getThreatIcon(event.event_type)}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{event.event_type}</div>
                        <div className="text-sm text-gray-600">{event.source_ip}</div>
                        <div className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(event.threat_level)}`}>
                        {event.threat_level}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Score: {(event.anomaly_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IP Reputation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                IP Reputation Analysis
                <Badge className="ml-2" variant="outline">
                  {Object.keys(threatData.ip_reputation).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(threatData.ip_reputation)
                  .sort(([,a], [,b]) => a - b)
                  .slice(0, 15)
                  .map(([ip, score], index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{ip}</div>
                          <div className="text-xs text-gray-500">
                            {score < 0 ? 'Malicious' : score > 0 ? 'Trusted' : 'Neutral'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getIpReputationColor(score)}`}>
                          {score.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {score < -0.5 ? 'BLOCK' : score < 0 ? 'WATCH' : 'OK'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getThreatIcon(selectedEvent.event_type)}
                  <span className="ml-2">Event Details</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Event Type:</span>
                      <span className="ml-2 font-medium">{selectedEvent.event_type}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Threat Level:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(selectedEvent.threat_level)}`}>
                        {selectedEvent.threat_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Anomaly Score:</span>
                      <span className="ml-2 font-medium">{(selectedEvent.anomaly_score * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Blocked:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.blocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedEvent.blocked ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Request Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Source IP:</span>
                      <span className="ml-2 font-medium">{selectedEvent.source_ip}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="ml-2 font-medium">{selectedEvent.request_method}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Path:</span>
                      <span className="ml-2 font-medium">{selectedEvent.request_path}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="ml-2 font-medium">{formatTimestamp(selectedEvent.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedEvent.details && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Details</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Metrics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              System Security Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{threatData.system_status.anomaly_threshold}</div>
                <p className="text-sm text-gray-600">Anomaly Threshold</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{threatData.system_status.zero_day_patterns_count}</div>
                <p className="text-sm text-gray-600">Zero-Day Patterns</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{threatData.system_status.last_update ? 'Active' : 'Unknown'}</div>
                <p className="text-sm text-gray-600">Last Update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityMonitor;
