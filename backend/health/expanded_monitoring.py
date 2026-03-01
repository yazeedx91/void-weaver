# 🏥 ShaheenPulse AI - Expanded Health Monitoring System
# ! PATENT-PENDING: SHAHEEN_CORE_LOGIC

import logging
import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import psutil
import requests
from functools import wraps
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('expanded_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    """Health status enumeration"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"

class AlertLevel(Enum):
    """Alert level enumeration"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class HealthMetric:
    """Health metric data structure"""
    name: str
    value: float
    unit: str
    threshold: float
    status: HealthStatus
    timestamp: datetime
    description: str

@dataclass
class SystemAlert:
    """System alert data structure"""
    id: str
    level: AlertLevel
    message: str
    source: str
    timestamp: datetime
    resolved: bool = False
    metadata: Dict[str, Any] = None

class HealthMonitor:
    """Expanded health monitoring system"""
    
    def __init__(self):
        self.metrics: Dict[str, HealthMetric] = {}
        self.alerts: List[SystemAlert] = []
        self.monitoring_active = False
        self.check_interval = 30  # seconds
        self.alert_callbacks: List[Callable] = []
        
    def add_alert_callback(self, callback: Callable) -> None:
        """Add callback for alert notifications"""
        self.alert_callbacks.append(callback)
        
    def remove_alert_callback(self, callback: Callable) -> None:
        """Remove alert callback"""
        if callback in self.alert_callbacks:
            self.alert_callbacks.remove(callback)
    
    def _trigger_alert(self, level: AlertLevel, message: str, source: str, metadata: Dict[str, Any] = None) -> None:
        """Trigger system alert"""
        alert_id = f"alert_{int(time.time())}_{len(self.alerts)}"
        alert = SystemAlert(
            id=alert_id,
            level=level,
            message=message,
            source=source,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        self.alerts.append(alert)
        logger.warning(f"ALERT [{level.value.upper()}] {source}: {message}")
        
        # Trigger callbacks
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"Error in alert callback: {str(e)}")
    
    def _check_metric_threshold(self, metric: HealthMetric) -> HealthStatus:
        """Check metric against threshold and determine status"""
        try:
            if metric.value <= metric.threshold * 0.5:
                return HealthStatus.HEALTHY
            elif metric.value <= metric.threshold * 0.8:
                return HealthStatus.DEGRADED
            elif metric.value <= metric.threshold:
                return HealthStatus.UNHEALTHY
            else:
                return HealthStatus.CRITICAL
        except Exception as e:
            logger.error(f"Error checking metric threshold: {str(e)}")
            return HealthStatus.UNHEALTHY
    
    def _update_metric(self, name: str, value: float, unit: str, threshold: float, description: str) -> None:
        """Update or create health metric"""
        try:
            metric = HealthMetric(
                name=name,
                value=value,
                unit=unit,
                threshold=threshold,
                status=HealthStatus.HEALTHY,
                timestamp=datetime.now(),
                description=description
            )
            
            # Determine status based on threshold
            metric.status = self._check_metric_threshold(metric)
            
            self.metrics[name] = metric
            
            # Trigger alert if needed
            if metric.status in [HealthStatus.UNHEALTHY, HealthStatus.CRITICAL]:
                level = AlertLevel.CRITICAL if metric.status == HealthStatus.CRITICAL else AlertLevel.ERROR
                self._trigger_alert(
                    level=level,
                    message=f"Metric {name} is {metric.status.value}: {value} {unit}",
                    source="health_monitor",
                    metadata={"metric_name": name, "value": value, "threshold": threshold}
                )
            
            logger.info(f"Updated metric {name}: {value} {unit} ({metric.status.value})")
            
        except Exception as e:
            logger.error(f"Error updating metric {name}: {str(e)}")
            logger.error(traceback.format_exc())
    
    def check_system_resources(self) -> Dict[str, Any]:
        """Check system resource utilization"""
        try:
            logger.info("Checking system resources")
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            self._update_metric(
                name="cpu_usage",
                value=cpu_percent,
                unit="percent",
                threshold=80.0,
                description="CPU utilization percentage"
            )
            
            # Memory usage
            memory = psutil.virtual_memory()
            self._update_metric(
                name="memory_usage",
                value=memory.percent,
                unit="percent",
                threshold=85.0,
                description="Memory utilization percentage"
            )
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            self._update_metric(
                name="disk_usage",
                value=disk_percent,
                unit="percent",
                threshold=90.0,
                description="Disk utilization percentage"
            )
            
            # Network I/O
            network = psutil.net_io_counters()
            self._update_metric(
                name="network_bytes_sent",
                value=network.bytes_sent,
                unit="bytes",
                threshold=1000000000,  # 1GB
                description="Network bytes sent"
            )
            
            self._update_metric(
                name="network_bytes_recv",
                value=network.bytes_recv,
                unit="bytes",
                threshold=1000000000,  # 1GB
                description="Network bytes received"
            )
            
            return {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "disk_usage": disk_percent,
                "network_bytes_sent": network.bytes_sent,
                "network_bytes_recv": network.bytes_recv,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking system resources: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e)}
    
    def check_application_health(self, endpoints: List[str]) -> Dict[str, Any]:
        """Check application endpoint health"""
        try:
            logger.info("Checking application health")
            
            results = {}
            
            for endpoint in endpoints:
                try:
                    start_time = time.time()
                    response = requests.get(endpoint, timeout=10)
                    response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                    
                    # Update response time metric
                    self._update_metric(
                        name=f"endpoint_{endpoint.replace(':', '_').replace('/', '_')}_response_time",
                        value=response_time,
                        unit="ms",
                        threshold=1000.0,  # 1 second
                        description=f"Response time for {endpoint}"
                    )
                    
                    # Update status code metric
                    self._update_metric(
                        name=f"endpoint_{endpoint.replace(':', '_').replace('/', '_')}_status",
                        value=response.status_code,
                        unit="status_code",
                        threshold=299,  # 2xx is good
                        description=f"Status code for {endpoint}"
                    )
                    
                    results[endpoint] = {
                        "status_code": response.status_code,
                        "response_time": response_time,
                        "healthy": response.status_code < 400,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    # Trigger alert if endpoint is unhealthy
                    if response.status_code >= 500:
                        self._trigger_alert(
                            level=AlertLevel.CRITICAL,
                            message=f"Endpoint {endpoint} returned {response.status_code}",
                            source="application_health",
                            metadata={"endpoint": endpoint, "status_code": response.status_code}
                        )
                    elif response.status_code >= 400:
                        self._trigger_alert(
                            level=AlertLevel.WARNING,
                            message=f"Endpoint {endpoint} returned {response.status_code}",
                            source="application_health",
                            metadata={"endpoint": endpoint, "status_code": response.status_code}
                        )
                    
                except requests.exceptions.Timeout:
                    results[endpoint] = {
                        "error": "timeout",
                        "healthy": False,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    self._trigger_alert(
                        level=AlertLevel.ERROR,
                        message=f"Endpoint {endpoint} timeout",
                        source="application_health",
                        metadata={"endpoint": endpoint, "error": "timeout"}
                    )
                    
                except requests.exceptions.ConnectionError:
                    results[endpoint] = {
                        "error": "connection_error",
                        "healthy": False,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    self._trigger_alert(
                        level=AlertLevel.ERROR,
                        message=f"Endpoint {endpoint} connection error",
                        source="application_health",
                        metadata={"endpoint": endpoint, "error": "connection_error"}
                    )
                    
                except Exception as e:
                    results[endpoint] = {
                        "error": str(e),
                        "healthy": False,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    self._trigger_alert(
                        level=AlertLevel.ERROR,
                        message=f"Endpoint {endpoint} error: {str(e)}",
                        source="application_health",
                        metadata={"endpoint": endpoint, "error": str(e)}
                    )
            
            return results
            
        except Exception as e:
            logger.error(f"Error checking application health: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e)}
    
    def check_database_health(self, connection_string: str) -> Dict[str, Any]:
        """Check database connection and performance"""
        try:
            logger.info("Checking database health")
            
            # This is a placeholder - in a real implementation, 
            # you would connect to your actual database
            # For now, we'll simulate database health checks
            
            # Simulate connection time
            connection_time = 50  # milliseconds
            self._update_metric(
                name="database_connection_time",
                value=connection_time,
                unit="ms",
                threshold=1000.0,
                description="Database connection time"
            )
            
            # Simulate query performance
            query_time = 25  # milliseconds
            self._update_metric(
                name="database_query_time",
                value=query_time,
                unit="ms",
                threshold=500.0,
                description="Database query time"
            )
            
            # Simulate active connections
            active_connections = 15
            self._update_metric(
                name="database_active_connections",
                value=active_connections,
                unit="connections",
                threshold=100.0,
                description="Active database connections"
            )
            
            return {
                "connection_time": connection_time,
                "query_time": query_time,
                "active_connections": active_connections,
                "healthy": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking database health: {str(e)}")
            logger.error(traceback.format_exc())
            
            self._trigger_alert(
                level=AlertLevel.CRITICAL,
                message=f"Database health check failed: {str(e)}",
                source="database_health",
                metadata={"error": str(e)}
            )
            
            return {"error": str(e), "healthy": False}
    
    def check_vitality_index_health(self) -> Dict[str, Any]:
        """Check Vitality Index™ system health"""
        try:
            logger.info("Checking Vitality Index health")
            
            # Simulate Vitality Index calculation
            vitality_score = 0.85  # 85% vitality
            self._update_metric(
                name="vitality_index_score",
                value=vitality_score,
                unit="score",
                threshold=0.7,
                description="Vitality Index score"
            )
            
            # Check calculation time
            calculation_time = 15  # milliseconds
            self._update_metric(
                name="vitality_calculation_time",
                value=calculation_time,
                unit="ms",
                threshold=100.0,
                description="Vitality Index calculation time"
            )
            
            # Check data freshness
            data_freshness = 5  # minutes old
            self._update_metric(
                name="vitality_data_freshness",
                value=data_freshness,
                unit="minutes",
                threshold=15.0,
                description="Vitality Index data freshness"
            )
            
            # Determine overall health
            overall_health = HealthStatus.HEALTHY
            if vitality_score < 0.5:
                overall_health = HealthStatus.CRITICAL
            elif vitality_score < 0.7:
                overall_health = HealthStatus.UNHEALTHY
            elif vitality_score < 0.8:
                overall_health = HealthStatus.DEGRADED
            
            return {
                "vitality_score": vitality_score,
                "calculation_time": calculation_time,
                "data_freshness": data_freshness,
                "overall_health": overall_health.value,
                "healthy": overall_health != HealthStatus.CRITICAL,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking Vitality Index health: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e), "healthy": False}
    
    def check_aeon_core_health(self) -> Dict[str, Any]:
        """Check Aeon™ Evolution Core health"""
        try:
            logger.info("Checking Aeon Core health")
            
            # Simulate Aeon Core metrics
            healing_active = True
            self._update_metric(
                name="aeon_healing_active",
                value=1.0 if healing_active else 0.0,
                unit="boolean",
                threshold=0.5,
                description="Aeon healing system active"
            )
            
            # Check healing events
            healing_events_today = 3
            self._update_metric(
                name="aeon_healing_events_today",
                value=healing_events_today,
                unit="events",
                threshold=10.0,
                description="Aeon healing events today"
            )
            
            # Check healing success rate
            healing_success_rate = 0.95  # 95% success
            self._update_metric(
                name="aeon_healing_success_rate",
                value=healing_success_rate,
                unit="rate",
                threshold=0.8,
                description="Aeon healing success rate"
            )
            
            return {
                "healing_active": healing_active,
                "healing_events_today": healing_events_today,
                "healing_success_rate": healing_success_rate,
                "healthy": healing_active and healing_success_rate > 0.8,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking Aeon Core health: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e), "healthy": False}
    
    def check_phalanx_gating_health(self) -> Dict[str, Any]:
        """Check Phalanx™ Twin-Gating health"""
        try:
            logger.info("Checking Phalanx Twin-Gating health")
            
            # Simulate Phalanx metrics
            gating_active = True
            self._update_metric(
                name="phalanx_gating_active",
                value=1.0 if gating_active else 0.0,
                unit="boolean",
                threshold=0.5,
                description="Phalanx twin-gating system active"
            )
            
            # Check gating events
            gating_events_today = 2
            self._update_metric(
                name="phalanx_gating_events_today",
                value=gating_events_today,
                unit="events",
                threshold=5.0,
                description="Phalanx gating events today"
            )
            
            # Check gating effectiveness
            gating_effectiveness = 0.98  # 98% effective
            self._update_metric(
                name="phalanx_gating_effectiveness",
                value=gating_effectiveness,
                unit="rate",
                threshold=0.9,
                description="Phalanx gating effectiveness"
            )
            
            return {
                "gating_active": gating_active,
                "gating_events_today": gating_events_today,
                "gating_effectiveness": gating_effectiveness,
                "healthy": gating_active and gating_effectiveness > 0.9,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking Phalanx Twin-Gating health: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e), "healthy": False}
    
    def get_overall_health_status(self) -> Dict[str, Any]:
        """Get overall system health status"""
        try:
            logger.info("Calculating overall health status")
            
            # Count metrics by status
            status_counts = {
                HealthStatus.HEALTHY: 0,
                HealthStatus.DEGRADED: 0,
                HealthStatus.UNHEALTHY: 0,
                HealthStatus.CRITICAL: 0
            }
            
            for metric in self.metrics.values():
                status_counts[metric.status] += 1
            
            total_metrics = sum(status_counts.values())
            
            # Calculate overall health percentage
            healthy_percentage = (status_counts[HealthStatus.HEALTHY] / total_metrics) * 100 if total_metrics > 0 else 0
            
            # Determine overall status
            if status_counts[HealthStatus.CRITICAL] > 0:
                overall_status = HealthStatus.CRITICAL
            elif status_counts[HealthStatus.UNHEALTHY] > 0:
                overall_status = HealthStatus.UNHEALTHY
            elif status_counts[HealthStatus.DEGRADED] > 0:
                overall_status = HealthStatus.DEGRADED
            else:
                overall_status = HealthStatus.HEALTHY
            
            # Get recent alerts
            recent_alerts = [
                alert for alert in self.alerts 
                if alert.timestamp > datetime.now() - timedelta(hours=1)
            ]
            
            return {
                "overall_status": overall_status.value,
                "healthy_percentage": healthy_percentage,
                "total_metrics": total_metrics,
                "status_breakdown": {status.value: count for status, count in status_counts.items()},
                "recent_alerts_count": len(recent_alerts),
                "recent_alerts": [
                    {
                        "id": alert.id,
                        "level": alert.level.value,
                        "message": alert.message,
                        "source": alert.source,
                        "timestamp": alert.timestamp.isoformat()
                    }
                    for alert in recent_alerts[-10:]  # Last 10 alerts
                ],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating overall health status: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e), "overall_status": HealthStatus.UNHEALTHY.value}
    
    async def start_monitoring(self, endpoints: List[str] = None) -> None:
        """Start continuous monitoring"""
        try:
            logger.info("Starting continuous health monitoring")
            
            self.monitoring_active = True
            endpoints = endpoints or [
                "http://localhost:3000/health",
                "http://localhost:3001/health"
            ]
            
            while self.monitoring_active:
                try:
                    # Check system resources
                    self.check_system_resources()
                    
                    # Check application health
                    if endpoints:
                        self.check_application_health(endpoints)
                    
                    # Check database health
                    self.check_database_health("postgresql://localhost:5432/shaheenpulse")
                    
                    # Check Vitality Index health
                    self.check_vitality_index_health()
                    
                    # Check Aeon Core health
                    self.check_aeon_core_health()
                    
                    # Check Phalanx Twin-Gating health
                    self.check_phalanx_gating_health()
                    
                    # Wait for next check
                    await asyncio.sleep(self.check_interval)
                    
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {str(e)}")
                    await asyncio.sleep(self.check_interval)
                    
        except Exception as e:
            logger.error(f"Error starting monitoring: {str(e)}")
            logger.error(traceback.format_exc())
    
    def stop_monitoring(self) -> None:
        """Stop continuous monitoring"""
        logger.info("Stopping health monitoring")
        self.monitoring_active = False
    
    def get_health_report(self) -> Dict[str, Any]:
        """Generate comprehensive health report"""
        try:
            logger.info("Generating health report")
            
            overall_status = self.get_overall_health_status()
            
            # Get all metrics
            metrics_data = {}
            for name, metric in self.metrics.items():
                metrics_data[name] = {
                    "value": metric.value,
                    "unit": metric.unit,
                    "threshold": metric.threshold,
                    "status": metric.status.value,
                    "timestamp": metric.timestamp.isoformat(),
                    "description": metric.description
                }
            
            # Get all alerts
            alerts_data = []
            for alert in self.alerts:
                alerts_data.append({
                    "id": alert.id,
                    "level": alert.level.value,
                    "message": alert.message,
                    "source": alert.source,
                    "timestamp": alert.timestamp.isoformat(),
                    "resolved": alert.resolved,
                    "metadata": alert.metadata
                })
            
            return {
                "overall_status": overall_status,
                "metrics": metrics_data,
                "alerts": alerts_data,
                "monitoring_active": self.monitoring_active,
                "check_interval": self.check_interval,
                "report_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating health report: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e)}

# Initialize health monitor
health_monitor = HealthMonitor()

# Export main classes and functions
__all__ = [
    'HealthMonitor',
    'HealthStatus',
    'AlertLevel',
    'HealthMetric',
    'SystemAlert',
    'health_monitor'
]
