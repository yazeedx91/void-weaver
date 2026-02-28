"""
🏥 COMPREHENSIVE HEALTH MONITORING SYSTEM
Complete health checks for all FLUX-DNA components
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime, timedelta
import asyncio
import psutil
import aiohttp
import json
import os
import pytz
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
import subprocess
import sys
import pathlib

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

class HealthStatus(Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    UNHEALTHY = "UNHEALTHY"
    CRITICAL = "CRITICAL"

class ComponentType(Enum):
    DATABASE = "database"
    AI_SERVICE = "ai_service"
    EXTERNAL_API = "external_api"
    SYSTEM = "system"
    SECURITY = "security"
    MEMORY = "memory"

@dataclass
class HealthCheck:
    """Individual health check result"""
    component: str
    component_type: ComponentType
    status: HealthStatus
    message: str
    response_time: float
    timestamp: datetime
    details: Dict[str, Any] = None

class ComprehensiveHealthMonitor:
    """Complete health monitoring for FLUX-DNA system"""
    
    def __init__(self):
        self.router = APIRouter(prefix="/health")
        self.setup_routes()
        
        # Health check thresholds
        self.thresholds = {
            'response_time_warning': 2000,  # 2 seconds
            'response_time_critical': 5000,  # 5 seconds
            'cpu_warning': 70,  # 70%
            'cpu_critical': 90,  # 90%
            'memory_warning': 70,  # 70%
            'memory_critical': 90,  # 90%
            'disk_warning': 80,  # 80%
            'disk_critical': 95,  # 95%
        }

    def setup_routes(self):
        """Setup health check routes"""
        
        @self.router.get("/")
        @self.router.get("/basic")
        async def basic_health():
            """Basic health check for load balancers"""
            return {
                "status": "FORTRESS_ACTIVE",
                "mission": "SOVEREIGN_LIBERATION",
                "version": "2026.1.0",
                "timestamp": datetime.now(RIYADH_TZ).isoformat(),
                "phoenix": "ASCENDED",
                "guardian": "WATCHING",
                "people": "FREE"
            }

        @self.router.get("/comprehensive")
        async def comprehensive_health():
            """Complete system health check"""
            health_results = await self.run_all_health_checks()
            
            # Calculate overall status
            overall_status = self.calculate_overall_status(health_results)
            
            return {
                "overall_status": overall_status.value,
                "timestamp": datetime.now(RIYADH_TZ).isoformat(),
                "version": "2026.1.0",
                "environment": os.environ.get('NODE_ENV', 'development'),
                "checks": [self._serialize_health_check(check) for check in health_results],
                "summary": self._generate_summary(health_results),
                "uptime": self._get_system_uptime(),
                "guardian_status": "ACTIVE" if overall_status != HealthStatus.CRITICAL else "EMERGENCY"
            }

        @self.router.get("/database")
        async def database_health():
            """Database connectivity and performance"""
            return await self._check_database_health()

        @self.router.get("/ai-services")
        async def ai_services_health():
            """AI services health check"""
            return await self._check_ai_services()

        @self.router.get("/external-apis")
        async def external_apis_health():
            """External API connectivity"""
            return await self._check_external_apis()

        @self.router.get("/system")
        async def system_health():
            """System resources health"""
            return await self._check_system_resources()

        @self.router.get("/security")
        async def security_health():
            """Security systems health"""
            return await self._check_security_systems()

        @self.router.get("/memory")
        async def memory_health():
            """Memory systems health"""
            return await self._check_memory_systems()

        @self.router.post("/run-checks")
        async def run_health_checks(background_tasks: BackgroundTasks):
            """Run health checks in background"""
            background_tasks.add_task(self._run_background_health_checks)
            return {"message": "Health checks initiated", "timestamp": datetime.now(RIYADH_TZ).isoformat()}

        @self.router.get("/metrics")
        async def health_metrics():
            """Detailed health metrics"""
            return await self._get_detailed_metrics()

    async def run_all_health_checks(self) -> List[HealthCheck]:
        """Run all health checks concurrently"""
        tasks = [
            self._check_database_health(),
            self._check_ai_services(),
            self._check_external_apis(),
            self._check_system_resources(),
            self._check_security_systems(),
            self._check_memory_systems()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results and handle exceptions
        health_checks = []
        for result in results:
            if isinstance(result, list):
                health_checks.extend(result)
            elif isinstance(result, HealthCheck):
                health_checks.append(result)
            elif isinstance(result, dict) and 'checks' in result:
                # Handle dict responses
                pass
        
        return health_checks

    async def _check_database_health(self) -> List[HealthCheck]:
        """Check database connectivity and performance"""
        checks = []
        start_time = datetime.now(RIYADH_TZ)
        
        try:
            from supabase import create_client
            from backend.config.settings import settings

            if not settings.supabase_url or not settings.supabase_key:
                checks.append(HealthCheck(
                    component="Supabase",
                    component_type=ComponentType.DATABASE,
                    status=HealthStatus.DEGRADED,
                    message="Supabase credentials not configured",
                    response_time=0,
                    timestamp=start_time,
                    details={"supabase_url_set": bool(settings.supabase_url)}
                ))
                return checks
            
            # Test Supabase connection
            supabase = create_client(settings.supabase_url, settings.supabase_key)
            
            # Test basic query
            result = supabase.table('health_checks').select('count').execute()
            response_time = (datetime.now(RIYADH_TZ) - start_time).total_seconds() * 1000
            
            checks.append(HealthCheck(
                component="Supabase",
                component_type=ComponentType.DATABASE,
                status=HealthStatus.HEALTHY if response_time < self.thresholds['response_time_warning'] else HealthStatus.DEGRADED,
                message="Database connection successful",
                response_time=response_time,
                timestamp=start_time,
                details={"query_time": response_time, "records": len(result.data) if result.data else 0}
            ))
            
            # Test pgvector extension
            try:
                vector_result = supabase.rpc('test_pgvector').execute()
                checks.append(HealthCheck(
                    component="pgvector",
                    component_type=ComponentType.DATABASE,
                    status=HealthStatus.HEALTHY,
                    message="pgvector extension working",
                    response_time=0,
                    timestamp=start_time
                ))
            except Exception as e:
                checks.append(HealthCheck(
                    component="pgvector",
                    component_type=ComponentType.DATABASE,
                    status=HealthStatus.DEGRADED,
                    message=f"pgvector issue: {str(e)}",
                    response_time=0,
                    timestamp=start_time
                ))
                
        except Exception as e:
            checks.append(HealthCheck(
                component="Supabase",
                component_type=ComponentType.DATABASE,
                status=HealthStatus.CRITICAL,
                message=f"Database connection failed: {str(e)}",
                response_time=0,
                timestamp=start_time
            ))
        
        return checks

    async def _check_ai_services(self) -> List[HealthCheck]:
        """Check AI services connectivity"""
        checks = []
        start_time = datetime.now(RIYADH_TZ)
        
        # Check OpenAI
        try:
            import openai
            from backend.config.settings import settings

            if not settings.openai_api_key:
                checks.append(HealthCheck(
                    component="OpenAI",
                    component_type=ComponentType.AI_SERVICE,
                    status=HealthStatus.DEGRADED,
                    message="OpenAI API key not configured",
                    response_time=0,
                    timestamp=start_time
                ))
            else:
                client = openai.OpenAI(api_key=settings.openai_api_key)
                response_time = (datetime.now(RIYADH_TZ) - start_time).total_seconds() * 1000
            
                # Test with minimal request
                models = client.models.list()
                checks.append(HealthCheck(
                    component="OpenAI",
                    component_type=ComponentType.AI_SERVICE,
                    status=HealthStatus.HEALTHY if response_time < self.thresholds['response_time_warning'] else HealthStatus.DEGRADED,
                    message="OpenAI API accessible",
                    response_time=response_time,
                    timestamp=start_time,
                    details={"models_available": len(models.data) if models.data else 0}
                ))
            
        except Exception as e:
            checks.append(HealthCheck(
                component="OpenAI",
                component_type=ComponentType.AI_SERVICE,
                status=HealthStatus.UNHEALTHY,
                message=f"OpenAI API error: {str(e)}",
                response_time=0,
                timestamp=start_time
            ))
        
        # Check Groq
        try:
            from groq import Groq
            from backend.config.settings import settings

            groq_api_key = os.getenv('GROQ_API_KEY', '')
            if not groq_api_key:
                checks.append(HealthCheck(
                    component="Groq",
                    component_type=ComponentType.AI_SERVICE,
                    status=HealthStatus.DEGRADED,
                    message="Groq API key not configured",
                    response_time=0,
                    timestamp=start_time
                ))
            else:
                client = Groq(api_key=groq_api_key)
                response_time = (datetime.now(RIYADH_TZ) - start_time).total_seconds() * 1000
            
                # Test connection
                models = client.models.list()
                checks.append(HealthCheck(
                    component="Groq",
                    component_type=ComponentType.AI_SERVICE,
                    status=HealthStatus.HEALTHY if response_time < self.thresholds['response_time_warning'] else HealthStatus.DEGRADED,
                    message="Groq API accessible",
                    response_time=response_time,
                    timestamp=start_time,
                    details={"models_available": len(models.data) if models.data else 0}
                ))
            
        except Exception as e:
            checks.append(HealthCheck(
                component="Groq",
                component_type=ComponentType.AI_SERVICE,
                status=HealthStatus.UNHEALTHY,
                message=f"Groq API error: {str(e)}",
                response_time=0,
                timestamp=start_time
            ))
        
        return checks

    async def _check_external_apis(self) -> List[HealthCheck]:
        """Check external API connectivity"""
        checks = []
        
        # Check Tavily API
        try:
            from backend.config.settings import settings
            start_time = datetime.now(RIYADH_TZ)

            if not settings.tavily_api_key:
                checks.append(HealthCheck(
                    component="Tavily",
                    component_type=ComponentType.EXTERNAL_API,
                    status=HealthStatus.DEGRADED,
                    message="Tavily API key not configured",
                    response_time=0,
                    timestamp=start_time
                ))
                return checks
            
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {settings.tavily_api_key}"}
                async with session.get("https://api.tavily.com/search", headers=headers, params={"query": "test", "max_results": 1}) as response:
                    response_time = (datetime.now(RIYADH_TZ) - start_time).total_seconds() * 1000
                    
                    checks.append(HealthCheck(
                        component="Tavily",
                        component_type=ComponentType.EXTERNAL_API,
                        status=HealthStatus.HEALTHY if response.status == 200 else HealthStatus.UNHEALTHY,
                        message=f"Tavily API status: {response.status}",
                        response_time=response_time,
                        timestamp=start_time
                    ))
                    
        except Exception as e:
            checks.append(HealthCheck(
                component="Tavily",
                component_type=ComponentType.EXTERNAL_API,
                status=HealthStatus.UNHEALTHY,
                message=f"Tavily API error: {str(e)}",
                response_time=0,
                timestamp=datetime.now(RIYADH_TZ)
            ))
        
        return checks

    async def _check_system_resources(self) -> List[HealthCheck]:
        """Check system resources"""
        checks = []
        timestamp = datetime.now(RIYADH_TZ)
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_status = HealthStatus.HEALTHY
        if cpu_percent > self.thresholds['cpu_critical']:
            cpu_status = HealthStatus.CRITICAL
        elif cpu_percent > self.thresholds['cpu_warning']:
            cpu_status = HealthStatus.DEGRADED
            
        checks.append(HealthCheck(
            component="CPU",
            component_type=ComponentType.SYSTEM,
            status=cpu_status,
            message=f"CPU usage: {cpu_percent}%",
            response_time=0,
            timestamp=timestamp,
            details={"usage_percent": cpu_percent, "cores": psutil.cpu_count()}
        ))
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_status = HealthStatus.HEALTHY
        if memory.percent > self.thresholds['memory_critical']:
            memory_status = HealthStatus.CRITICAL
        elif memory.percent > self.thresholds['memory_warning']:
            memory_status = HealthStatus.DEGRADED
            
        checks.append(HealthCheck(
            component="Memory",
            component_type=ComponentType.SYSTEM,
            status=memory_status,
            message=f"Memory usage: {memory.percent}%",
            response_time=0,
            timestamp=timestamp,
            details={"usage_percent": memory.percent, "available_gb": memory.available / (1024**3)}
        ))
        
        # Disk usage
        try:
            disk = psutil.disk_usage(str(pathlib.Path.cwd().anchor or '/'))
        except Exception:
            disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        disk_status = HealthStatus.HEALTHY
        if disk_percent > self.thresholds['disk_critical']:
            disk_status = HealthStatus.CRITICAL
        elif disk_percent > self.thresholds['disk_warning']:
            disk_status = HealthStatus.DEGRADED
            
        checks.append(HealthCheck(
            component="Disk",
            component_type=ComponentType.SYSTEM,
            status=disk_status,
            message=f"Disk usage: {disk_percent:.1f}%",
            response_time=0,
            timestamp=timestamp,
            details={"usage_percent": disk_percent, "free_gb": disk.free / (1024**3)}
        ))
        
        return checks

    async def _check_security_systems(self) -> List[HealthCheck]:
        """Check security systems"""
        checks = []
        timestamp = datetime.now(RIYADH_TZ)
        
        try:
            from backend.security.citadel_armor import get_citadel_armor
            
            armor = get_citadel_armor()
            
            # Test token generation
            test_token = armor.generate_secure_token("test_user")
            
            # Test token validation
            validated = armor.validate_token(test_token)
            
            checks.append(HealthCheck(
                component="Citadel Armor",
                component_type=ComponentType.SECURITY,
                status=HealthStatus.HEALTHY if validated else HealthStatus.UNHEALTHY,
                message="Security systems operational",
                response_time=0,
                timestamp=timestamp,
                details={"token_validation": validated is not None}
            ))
            
        except Exception as e:
            checks.append(HealthCheck(
                component="Citadel Armor",
                component_type=ComponentType.SECURITY,
                status=HealthStatus.CRITICAL,
                message=f"Security system error: {str(e)}",
                response_time=0,
                timestamp=timestamp
            ))

        try:
            from backend.security.zero_day_protection import get_zero_day_protection
            
            zdp = get_zero_day_protection()
            status = await zdp._get_system_security_status()
            
            checks.append(HealthCheck(
                component="Zero-Day Protection",
                component_type=ComponentType.SECURITY,
                status=HealthStatus.HEALTHY if status.get('protection_active') else HealthStatus.UNHEALTHY,
                message="Zero-day protection operational" if status.get('protection_active') else "Zero-day protection inactive",
                response_time=0,
                timestamp=timestamp,
                details=status
            ))
            
        except Exception as e:
            checks.append(HealthCheck(
                component="Zero-Day Protection",
                component_type=ComponentType.SECURITY,
                status=HealthStatus.UNHEALTHY,
                message=f"Zero-day protection error: {str(e)}",
                response_time=0,
                timestamp=timestamp
            ))
        
        return checks

    async def _check_memory_systems(self) -> List[HealthCheck]:
        """Check memory systems"""
        checks = []
        timestamp = datetime.now(RIYADH_TZ)
        
        try:
            from backend.agent.enhanced_al_hakim import get_enhanced_agent
            
            agent = get_enhanced_agent()
            metrics = agent.get_performance_metrics()
            
            checks.append(HealthCheck(
                component="Neural Memory",
                component_type=ComponentType.MEMORY,
                status=HealthStatus.HEALTHY,
                message="Memory systems operational",
                response_time=0,
                timestamp=timestamp,
                details=metrics
            ))
            
        except Exception as e:
            checks.append(HealthCheck(
                component="Neural Memory",
                component_type=ComponentType.MEMORY,
                status=HealthStatus.UNHEALTHY,
                message=f"Memory system error: {str(e)}",
                response_time=0,
                timestamp=timestamp
            ))
        
        return checks

    def calculate_overall_status(self, health_checks: List[HealthCheck]) -> HealthStatus:
        """Calculate overall system status"""
        if not health_checks:
            return HealthStatus.UNHEALTHY
        
        # Count statuses
        status_counts = {status: 0 for status in HealthStatus}
        for check in health_checks:
            status_counts[check.status] += 1
        
        # Determine overall status
        if status_counts[HealthStatus.CRITICAL] > 0:
            return HealthStatus.CRITICAL
        elif status_counts[HealthStatus.UNHEALTHY] > 0:
            return HealthStatus.UNHEALTHY
        elif status_counts[HealthStatus.DEGRADED] > len(health_checks) * 0.3:  # 30% degraded
            return HealthStatus.DEGRADED
        else:
            return HealthStatus.HEALTHY

    def _serialize_health_check(self, check: HealthCheck) -> Dict[str, Any]:
        """Serialize health check for JSON response"""
        return {
            "component": check.component,
            "component_type": check.component_type.value,
            "status": check.status.value,
            "message": check.message,
            "response_time": check.response_time,
            "timestamp": check.timestamp.isoformat(),
            "details": check.details or {}
        }

    def _generate_summary(self, health_checks: List[HealthCheck]) -> Dict[str, Any]:
        """Generate health check summary"""
        status_counts = {status: 0 for status in HealthStatus}
        type_counts = {ctype: 0 for ctype in ComponentType}
        
        total_response_time = 0
        check_count = 0
        
        for check in health_checks:
            status_counts[check.status] += 1
            type_counts[check.component_type] += 1
            total_response_time += check.response_time
            check_count += 1
        
        return {
            "total_checks": check_count,
            "status_breakdown": {status.value: count for status, count in status_counts.items()},
            "type_breakdown": {ctype.value: count for ctype, count in type_counts.items()},
            "average_response_time": total_response_time / check_count if check_count > 0 else 0,
            "critical_issues": [check.component for check in health_checks if check.status == HealthStatus.CRITICAL],
            "degraded_components": [check.component for check in health_checks if check.status == HealthStatus.DEGRADED]
        }

    def _get_system_uptime(self) -> str:
        """Get system uptime"""
        try:
            uptime_seconds = psutil.boot_time()
            uptime = datetime.now() - datetime.fromtimestamp(uptime_seconds)
            days = uptime.days
            hours, remainder = divmod(uptime.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            
            return f"{days}d {hours}h {minutes}m"
        except:
            return "Unknown"

    async def _run_background_health_checks(self):
        """Run health checks in background"""
        try:
            health_results = await self.run_all_health_checks()
            
            # Store results in database
            from supabase import create_client
            from backend.config.settings import settings

            service_key = os.getenv('SUPABASE_SERVICE_KEY', '')
            if not settings.supabase_url or not service_key:
                return
            
            supabase = create_client(settings.supabase_url, service_key)
            
            health_record = {
                "timestamp": datetime.now(RIYADH_TZ).isoformat(),
                "overall_status": self.calculate_overall_status(health_results).value,
                "checks": [self._serialize_health_check(check) for check in health_results],
                "summary": self._generate_summary(health_results)
            }
            
            supabase.table('health_check_history').insert(health_record).execute()
            
        except Exception as e:
            print(f"Background health check error: {e}")

    async def _get_detailed_metrics(self) -> Dict[str, Any]:
        """Get detailed health metrics"""
        health_checks = await self.run_all_health_checks()
        
        return {
            "timestamp": datetime.now(RIYADH_TZ).isoformat(),
            "checks": [self._serialize_health_check(check) for check in health_checks],
            "system_metrics": {
                "cpu": psutil.cpu_percent(interval=1),
                "memory": psutil.virtual_memory()._asdict(),
                "disk": psutil.disk_usage('/')._asdict(),
                "network": psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {}
            },
            "process_info": {
                "pid": os.getpid(),
                "memory_info": psutil.Process().memory_info()._asdict(),
                "cpu_percent": psutil.Process().cpu_percent(),
                "num_threads": psutil.Process().num_threads(),
                "create_time": psutil.Process().create_time()
            }
        }

# Global health monitor instance
health_monitor = ComprehensiveHealthMonitor()

# Export router for FastAPI app
def get_health_router():
    """Get health check router"""
    return health_monitor.router
