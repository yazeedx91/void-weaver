"""
🛡️ ZERO-DAY PROTECTION MIDDLEWARE
FastAPI middleware for real-time threat detection and prevention
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import json
import logging
from typing import Dict, Any
from datetime import datetime
import pytz

from backend.security.zero_day_protection import get_zero_day_protection, SecurityEvent

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

class ZeroDayProtectionMiddleware(BaseHTTPMiddleware):
    """Middleware for zero-day attack protection"""
    
    def __init__(self, app, config: Dict[str, Any] = None):
        super().__init__(app)
        self.config = config or {}
        self.logger = logging.getLogger('zero_day_middleware')
        self.protection_system = get_zero_day_protection()
        
        # Paths to exclude from protection
        self.excluded_paths = {
            '/health',
            '/health/basic',
            '/metrics',
            '/static',
            '/favicon.ico'
        }
        
        # Rate limiting per endpoint
        self.endpoint_limits = {
            '/api/agent/start': 10,  # 10 requests per minute
            '/api/agent/message': 30,  # 30 requests per minute
            '/api/upload': 5,  # 5 requests per minute
            '/api/memory/store': 20,  # 20 requests per minute
        }

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request through zero-day protection"""
        
        # Skip protection for excluded paths
        if request.url.path in self.excluded_paths or request.url.path.startswith('/health'):
            return await call_next(request)
        
        # Extract request data
        request_data = await self._extract_request_data(request)
        
        # Track request for pattern analysis
        self.protection_system.track_request(request_data['source_ip'])
        
        # Analyze request for threats
        security_event = await self.protection_system.analyze_request(request_data)
        
        # Log security event
        self._log_request_analysis(request_data, security_event)
        
        # Block request if critical threat detected
        if security_event.blocked:
            return self._create_blocked_response(security_event)
        
        # Check endpoint-specific rate limiting
        if self._is_endpoint_rate_limited(request):
            return self._create_rate_limit_response()
        
        # Add security headers
        response = await call_next(request)
        self._add_security_headers(response)
        
        return response

    async def _extract_request_data(self, request: Request) -> Dict[str, Any]:
        """Extract relevant data from request"""
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check for forwarded IP
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Get request body
        payload = ""
        try:
            if request.method in ["POST", "PUT", "PATCH"]:
                body = await request.body()
                payload = body.decode('utf-8', errors='ignore')
        except Exception:
            payload = ""
        
        return {
            'source_ip': client_ip,
            'user_agent': request.headers.get('user-agent', ''),
            'path': request.url.path,
            'method': request.method,
            'payload': payload,
            'query_params': dict(request.query_params),
            'headers': dict(request.headers),
            'session_id': self._get_session_id(request),
            'timestamp': datetime.now(RIYADH_TZ)
        }

    def _get_session_id(self, request: Request) -> str:
        """Extract session ID from request"""
        # Try to get from Authorization header
        auth_header = request.headers.get('authorization')
        if auth_header:
            return auth_header[:32]  # Truncate for privacy
        
        # Try to get from cookies
        session_cookie = request.headers.get('cookie')
        if session_cookie:
            return session_cookie[:32]
        
        return "anonymous"

    def _log_request_analysis(self, request_data: Dict[str, Any], security_event: SecurityEvent):
        """Log request analysis results"""
        log_data = {
            'timestamp': security_event.timestamp.isoformat(),
            'source_ip': request_data['source_ip'],
            'path': request_data['path'],
            'method': request_data['method'],
            'threat_level': security_event.threat_level.value,
            'anomaly_score': security_event.anomaly_score,
            'blocked': security_event.blocked,
            'event_type': security_event.event_type.value
        }
        
        if security_event.threat_level.value in ['CRITICAL', 'EMERGENCY']:
            self.logger.critical(f"Critical threat detected: {json.dumps(log_data)}")
        elif security_event.threat_level.value == 'HIGH':
            self.logger.warning(f"High threat detected: {json.dumps(log_data)}")
        elif security_event.anomaly_score > 0.5:
            self.logger.info(f"Anomalous request: {json.dumps(log_data)}")

    def _create_blocked_response(self, security_event: SecurityEvent) -> JSONResponse:
        """Create response for blocked requests"""
        return JSONResponse(
            status_code=429,
            content={
                'error': 'Request blocked due to security concerns',
                'threat_level': security_event.threat_level.value,
                'event_type': security_event.event_type.value,
                'anomaly_score': security_event.anomaly_score,
                'timestamp': security_event.timestamp.isoformat(),
                'blocked': True
            }
        )

    def _create_rate_limit_response(self) -> JSONResponse:
        """Create response for rate limited requests"""
        return JSONResponse(
            status_code=429,
            content={
                'error': 'Rate limit exceeded',
                'message': 'Too many requests. Please try again later.',
                'retry_after': 60
            }
        )

    def _is_endpoint_rate_limited(self, request: Request) -> bool:
        """Check if endpoint is rate limited"""
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        
        # Get rate limit for endpoint
        limit = self.endpoint_limits.get(path, 100)  # Default 100 requests per minute
        
        # Count requests in last minute
        current_time = time.time()
        window_start = current_time - 60
        
        # This is a simplified implementation
        # In production, use Redis or similar for distributed rate limiting
        request_count = self._count_requests_in_window(client_ip, window_start)
        
        return request_count > limit

    def _count_requests_in_window(self, client_ip: str, window_start: float) -> int:
        """Count requests from IP in time window"""
        # Simplified implementation - use proper storage in production
        return 0  # Placeholder

    def _add_security_headers(self, response: Response):
        """Add security headers to response"""
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        
        # Add security headers
        response.headers["Content-Security-Policy"] = csp
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Custom security headers
        response.headers["X-FLUX-DNA-Protection"] = "Active"
        response.headers["X-Threat-Level"] = "Monitored"
        response.headers["X-Security-Timestamp"] = datetime.now(RIYADH_TZ).isoformat()

# FastAPI dependency for protection system
async def get_protection_status():
    """Get current protection system status"""
    protection_system = get_zero_day_protection()
    return await protection_system.get_threat_intelligence()

# Security event logging endpoint
async def log_security_event(event: SecurityEvent):
    """Log security event for monitoring"""
    protection_system = get_zero_day_protection()
    await protection_system._log_security_event(event)

# Threat intelligence endpoint
async def get_threat_intelligence():
    """Get current threat intelligence"""
    protection_system = get_zero_day_protection()
    return await protection_system.get_threat_intelligence()
