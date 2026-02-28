"""
🛡️ ZERO-DAY ATTACK PROTECTION SYSTEM
Advanced threat detection and prevention for unknown vulnerabilities
"""

import asyncio
import hashlib
import hmac
import secrets
import time
import re
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import pytz
from collections import defaultdict, deque
import psutil
import aiohttp
from urllib.parse import urlparse, parse_qs
from IPy import IP
import logging

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

class ThreatLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"

class AttackType(Enum):
    UNKNOWN_PAYLOAD = "unknown_payload"
    ANOMALOUS_BEHAVIOR = "anomalous_behavior"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    AUTHENTICATION_BYPASS = "authentication_bypass"
    DATA_EXFILTRATION = "data_exfiltration"
    COMMAND_INJECTION = "command_injection"
    ZERO_DAY_EXPLOIT = "zero_day_exploit"

@dataclass
class SecurityEvent:
    """Security event for threat detection"""
    timestamp: datetime
    event_type: AttackType
    threat_level: ThreatLevel
    source_ip: str
    user_agent: str
    request_path: str
    request_method: str
    payload: str
    anomaly_score: float
    details: Dict[str, Any] = field(default_factory=dict)
    blocked: bool = False
    session_id: Optional[str] = None

@dataclass
class ThreatSignature:
    """Threat signature for pattern matching"""
    pattern: str
    threat_type: AttackType
    threat_level: ThreatLevel
    description: str
    created_at: datetime
    updated_at: datetime
    match_count: int = 0

class ZeroDayProtectionSystem:
    """Advanced zero-day attack protection system"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger('zero_day_protection')
        
        # Threat detection parameters
        self.anomaly_threshold = config.get('anomaly_threshold', 0.7)
        self.rate_limit_window = config.get('rate_limit_window', 300)  # 5 minutes
        self.max_requests_per_window = config.get('max_requests_per_window', 100)
        self.block_duration = config.get('block_duration', 3600)  # 1 hour
        
        # Tracking systems
        self.request_patterns = defaultdict(lambda: deque(maxlen=1000))
        self.ip_reputation = defaultdict(float)
        self.blocked_ips = defaultdict(datetime)
        self.session_anomalies = defaultdict(list)
        self.threat_signatures: List[ThreatSignature] = []
        
        # Behavioral baselines
        self.baselines = {
            'avg_request_size': 1024,
            'avg_response_time': 200,
            'normal_paths': set(['/api/health', '/api/agent/start', '/api/agent/status']),
            'normal_methods': {'GET', 'POST'},
            'normal_user_agents': set(),
            'request_frequency': 10  # requests per minute
        }
        
        # Initialize threat signatures
        self._initialize_threat_signatures()
        
        # Zero-day detection patterns
        self.zero_day_patterns = [
            # SQL Injection variations
            r'(?i)(union\s+select|select\s+.*\s+from\s+information_schema)',
            r'(?i)(or\s+1\s*=\s*1|or\s+true|and\s+1\s*=\s*1)',
            r'(?i)(drop\s+table|delete\s+from|insert\s+into)',
            
            # Command injection
            r'(?i)(;\s*rm\s+-rf|;\s*cat\s+/etc/passwd|;\s*wget\s+)',
            r'(?i)(eval\s*\(|exec\s*\(|system\s*\()',
            r'(?i)(\$\{|\`|\$\(|<\?php)',
            
            # Path traversal
            r'(?i)(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)',
            r'(?i)(\/etc\/passwd|\/etc\/shadow|\/proc\/version)',
            
            # XSS variations
            r'(?i)(<script|javascript:|onload\s*=|onerror\s*=)',
            r'(?i)(<iframe|<object|<embed|<link)',
            
            # NoSQL injection
            r'(?i)(\$ne|\$gt|\$lt|\$where|\$regex)',
            r'(?i)(\{.*\$.*\}|\[.*\$.*\])',
            
            # Template injection
            r'(?i)(\{\{.*\}\}|\{%.*%\}|\{#.*#\})',
            r'(?i)(\${.*}|#\{.*\}|\%{.*\})',
            
            # Deserialization attacks
            r'(?i)(O:\d+:|a:\d+:|s:\d+:)',
            r'(?i)(__reduce__|__getitem__|__setitem__)',
            
            # XXE attacks
            r'(?i)(<!ENTITY.*SYSTEM|<!DOCTYPE.*\[)',
            r'(?i)(&ent;|&xxe;|%26ent;)',
            
            # SSRF attacks
            r'(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)',
            r'(?i)(169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)',
            
            # LDAP injection
            r'(?i)(\(\|\(.*\)\)|\)\(\)|\*\))',
            r'(?i)(cn=|ou=|dc=|uid=)',
            
            # XPath injection
            r'(?i)(\/\/|\*|\[.*\]\|\|)',
            r'(?i)(count\(|sum\(|avg\()',
            
            # Buffer overflow patterns
            r'(A{50,})',  # Large repeated characters
            r'(%41{50,})',  # URL encoded large repeated characters
            
            # Race condition indicators
            r'(?i)(race|condition|concurrent|parallel)',
            
            # Memory corruption patterns
            r'(?i)(overflow|corruption|segfault|buffer)',
            
            # Crypto attack patterns
            r'(?i)(padding|oracle|cbc|ecb|nonce)',
            
            # Privilege escalation
            r'(?i)(sudo|root|admin|privilege|escalate)',
            
            # Data exfiltration
            r'(?i)(exfiltrate|extract|dump|backup|export)',
        ]
        
        # Initialize reputation system
        self._initialize_ip_reputation()

    def _initialize_threat_signatures(self):
        """Initialize known threat signatures"""
        signatures = [
            # SQL Injection
            ThreatSignature(
                pattern=r'(?i)(union\s+select|select\s+.*\s+from\s+information_schema)',
                threat_type=AttackType.COMMAND_INJECTION,
                threat_level=ThreatLevel.HIGH,
                description="SQL Union Injection Attempt",
                created_at=datetime.now(RIYADH_TZ),
                updated_at=datetime.now(RIYADH_TZ)
            ),
            
            # Command Injection
            ThreatSignature(
                pattern=r'(?i)(;\s*rm\s+-rf|;\s*cat\s+/etc/passwd)',
                threat_type=AttackType.COMMAND_INJECTION,
                threat_level=ThreatLevel.CRITICAL,
                description="Command Injection Attempt",
                created_at=datetime.now(RIYADH_TZ),
                updated_at=datetime.now(RIYADH_TZ)
            ),
            
            # Path Traversal
            ThreatSignature(
                pattern=r'(?i)(\.\.\/|\.\.\\|%2e%2e%2f)',
                threat_type=AttackType.UNKNOWN_PAYLOAD,
                threat_level=ThreatLevel.HIGH,
                description="Path Traversal Attempt",
                created_at=datetime.now(RIYADH_TZ),
                updated_at=datetime.now(RIYADH_TZ)
            ),
            
            # XSS
            ThreatSignature(
                pattern=r'(?i)(<script|javascript:|onload\s*=)',
                threat_type=AttackType.UNKNOWN_PAYLOAD,
                threat_level=ThreatLevel.MEDIUM,
                description="XSS Attempt",
                created_at=datetime.now(RIYADH_TZ),
                updated_at=datetime.now(RIYADH_TZ)
            ),
        ]
        
        self.threat_signatures = signatures

    def _initialize_ip_reputation(self):
        """Initialize IP reputation with known malicious ranges"""
        malicious_ranges = [
            # Known malicious IP ranges (example)
            '192.0.2.0/24',  # TEST-NET-1
            '203.0.113.0/24',  # TEST-NET-2
            '198.51.100.0/24',  # TEST-NET-3
        ]
        
        for ip_range in malicious_ranges:
            try:
                ip_network = IP(ip_range)
                for ip in ip_network:
                    self.ip_reputation[str(ip)] = -1.0  # Mark as malicious
            except:
                continue

    async def analyze_request(self, request_data: Dict[str, Any]) -> SecurityEvent:
        """Analyze incoming request for zero-day threats"""
        timestamp = datetime.now(RIYADH_TZ)
        
        # Extract request information
        source_ip = request_data.get('source_ip', 'unknown')
        user_agent = request_data.get('user_agent', '')
        request_path = request_data.get('path', '')
        request_method = request_data.get('method', 'GET')
        payload = request_data.get('payload', '')
        session_id = request_data.get('session_id')
        
        # Initialize security event
        event = SecurityEvent(
            timestamp=timestamp,
            event_type=AttackType.UNKNOWN_PAYLOAD,
            threat_level=ThreatLevel.LOW,
            source_ip=source_ip,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
            payload=payload,
            anomaly_score=0.0,
            session_id=session_id
        )
        
        # Check if IP is blocked
        if self._is_ip_blocked(source_ip):
            event.threat_level = ThreatLevel.EMERGENCY
            event.blocked = True
            event.details['block_reason'] = 'IP previously blocked'
            return event
        
        # Perform threat analysis
        anomaly_score = await self._calculate_anomaly_score(request_data)
        event.anomaly_score = anomaly_score
        
        # Check against known signatures
        signature_match = await self._check_signatures(payload)
        if signature_match:
            event.event_type = signature_match.threat_type
            event.threat_level = signature_match.threat_level
            event.details['signature_match'] = signature_match.description
        
        # Check for zero-day patterns
        zero_day_match = await self._check_zero_day_patterns(payload)
        if zero_day_match:
            event.event_type = AttackType.ZERO_DAY_EXPLOIT
            event.threat_level = ThreatLevel.CRITICAL
            event.details['zero_day_pattern'] = zero_day_match
        
        # Behavioral analysis
        behavioral_threat = await self._analyze_behavior(request_data)
        if behavioral_threat:
            event.event_type = AttackType.ANOMALOUS_BEHAVIOR
            event.threat_level = max(event.threat_level, behavioral_threat['threat_level'])
            event.details.update(behavioral_threat['details'])
        
        # Rate limiting check
        if self._is_rate_limited(source_ip):
            event.threat_level = max(event.threat_level, ThreatLevel.HIGH)
            event.details['rate_limit_exceeded'] = True
        
        # Update IP reputation
        self._update_ip_reputation(source_ip, event.threat_level)
        
        # Block if critical threat
        if event.threat_level in [ThreatLevel.CRITICAL, ThreatLevel.EMERGENCY]:
            event.blocked = True
            self._block_ip(source_ip)
        
        # Log event
        await self._log_security_event(event)
        
        return event

    async def _calculate_anomaly_score(self, request_data: Dict[str, Any]) -> float:
        """Calculate anomaly score for request"""
        score = 0.0
        
        # Request size anomaly
        payload_size = len(request_data.get('payload', ''))
        if payload_size > self.baselines['avg_request_size'] * 10:
            score += 0.3
        
        # Path anomaly
        path = request_data.get('path', '')
        if path not in self.baselines['normal_paths']:
            score += 0.2
        
        # Method anomaly
        method = request_data.get('method', 'GET')
        if method not in self.baselines['normal_methods']:
            score += 0.1
        
        # User agent anomaly
        user_agent = request_data.get('user_agent', '')
        if not user_agent or user_agent in ['curl', 'wget', 'python-requests']:
            score += 0.2
        
        # IP reputation
        source_ip = request_data.get('source_ip', '')
        ip_rep = self.ip_reputation.get(source_ip, 0.0)
        if ip_rep < -0.5:
            score += 0.4
        
        # Request frequency
        if self._is_high_frequency_request(source_ip):
            score += 0.3
        
        # Payload complexity
        payload = request_data.get('payload', '')
        if len(payload) > 10000:  # Large payload
            score += 0.2
        
        # Encoding anomalies
        if self._has_suspicious_encoding(payload):
            score += 0.3
        
        return min(score, 1.0)

    async def _check_signatures(self, payload: str) -> Optional[ThreatSignature]:
        """Check payload against known threat signatures"""
        for signature in self.threat_signatures:
            if re.search(signature.pattern, payload):
                signature.match_count += 1
                return signature
        return None

    async def _check_zero_day_patterns(self, payload: str) -> Optional[str]:
        """Check for zero-day attack patterns"""
        for pattern in self.zero_day_patterns:
            if re.search(pattern, payload):
                return pattern
        return None

    async def _analyze_behavior(self, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze behavioral patterns for anomalies"""
        source_ip = request_data.get('source_ip', '')
        session_id = request_data.get('session_id')
        
        # Check for behavioral anomalies
        anomalies = []
        
        # Rapid successive requests
        if self._is_rapid_succession(source_ip):
            anomalies.append({
                'threat_level': ThreatLevel.MEDIUM,
                'details': {'anomaly_type': 'rapid_succession'}
            })
        
        # Session anomalies
        if session_id and self._has_session_anomalies(session_id):
            anomalies.append({
                'threat_level': ThreatLevel.HIGH,
                'details': {'anomaly_type': 'session_anomaly'}
            })
        
        # Resource exhaustion attempts
        if self._is_resource_exhaustion_attempt(request_data):
            anomalies.append({
                'threat_level': ThreatLevel.HIGH,
                'details': {'anomaly_type': 'resource_exhaustion'}
            })
        
        return anomalies[0] if anomalies else None

    def _is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is blocked"""
        if ip in self.blocked_ips:
            block_time = self.blocked_ips[ip]
            if datetime.now(RIYADH_TZ) - block_time < timedelta(seconds=self.block_duration):
                return True
            else:
                # Unblock expired blocks
                del self.blocked_ips[ip]
        return False

    def _block_ip(self, ip: str):
        """Block an IP address"""
        self.blocked_ips[ip] = datetime.now(RIYADH_TZ)
        self.ip_reputation[ip] = -1.0

    def _is_rate_limited(self, ip: str) -> bool:
        """Check if IP is rate limited"""
        current_time = time.time()
        window_start = current_time - self.rate_limit_window
        
        # Count requests in window
        request_count = 0
        for timestamp in self.request_patterns[ip]:
            if timestamp > window_start:
                request_count += 1
        
        return request_count > self.max_requests_per_window

    def _is_high_frequency_request(self, ip: str) -> bool:
        """Check for high frequency requests"""
        current_time = time.time()
        recent_requests = [t for t in self.request_patterns[ip] if current_time - t < 60]  # Last minute
        
        return len(recent_requests) > self.baselines['request_frequency']

    def _is_rapid_succession(self, ip: str) -> bool:
        """Check for rapid successive requests"""
        if len(self.request_patterns[ip]) < 5:
            return False
        
        # Check if 5 requests came within 10 seconds
        recent_requests = sorted(self.request_patterns[ip])[-5:]
        return recent_requests[-1] - recent_requests[0] < 10

    def _has_session_anomalies(self, session_id: str) -> bool:
        """Check for session anomalies"""
        if session_id not in self.session_anomalies:
            return False
        
        recent_anomalies = [
            a for a in self.session_anomalies[session_id]
            if datetime.now(RIYADH_TZ) - a['timestamp'] < timedelta(minutes=10)
        ]
        
        return len(recent_anomalies) > 3

    def _is_resource_exhaustion_attempt(self, request_data: Dict[str, Any]) -> bool:
        """Check for resource exhaustion attempts"""
        payload = request_data.get('payload', '')
        
        # Check for large payloads
        if len(payload) > 100000:  # 100KB
            return True
        
        # Check for memory exhaustion patterns
        if 'A' * 10000 in payload or '0' * 10000 in payload:
            return True
        
        # Check for CPU exhaustion patterns
        if any(pattern in payload.lower() for pattern in ['fork()', 'while(true)', 'for(;;)']):
            return True
        
        return False

    def _has_suspicious_encoding(self, payload: str) -> bool:
        """Check for suspicious encoding patterns"""
        # Multiple encoding layers
        encoding_patterns = [
            r'%25',  # Double URL encoding
            r'%u00',  # Unicode encoding
            r'&#x',   # Hex encoding
            r'&#[0-9]',  # HTML entity encoding
        ]
        
        encoding_count = sum(1 for pattern in encoding_patterns if re.search(pattern, payload))
        return encoding_count > 2

    def _update_ip_reputation(self, ip: str, threat_level: ThreatLevel):
        """Update IP reputation based on threat level"""
        current_rep = self.ip_reputation.get(ip, 0.0)
        
        # Adjust reputation based on threat level
        if threat_level == ThreatLevel.LOW:
            change = 0.01
        elif threat_level == ThreatLevel.MEDIUM:
            change = -0.1
        elif threat_level == ThreatLevel.HIGH:
            change = -0.3
        elif threat_level == ThreatLevel.CRITICAL:
            change = -0.5
        elif threat_level == ThreatLevel.EMERGENCY:
            change = -1.0
        else:
            change = 0
        
        self.ip_reputation[ip] = max(-1.0, min(1.0, current_rep + change))

    async def _log_security_event(self, event: SecurityEvent):
        """Log security event for analysis"""
        log_data = {
            'timestamp': event.timestamp.isoformat(),
            'event_type': event.event_type.value,
            'threat_level': event.threat_level.value,
            'source_ip': event.source_ip,
            'user_agent': event.user_agent,
            'request_path': event.request_path,
            'request_method': event.request_method,
            'anomaly_score': event.anomaly_score,
            'blocked': event.blocked,
            'details': event.details
        }
        
        self.logger.warning(f"Security Event: {json.dumps(log_data)}")
        
        # Store in database for analysis
        try:
            from supabase import create_client
            from backend.config.settings import settings
            
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            
            supabase.table('security_events').insert(log_data).execute()
            
        except Exception as e:
            self.logger.error(f"Failed to log security event: {e}")

    def track_request(self, ip: str):
        """Track request for pattern analysis"""
        self.request_patterns[ip].append(time.time())

    async def get_threat_intelligence(self) -> Dict[str, Any]:
        """Get current threat intelligence"""
        return {
            'blocked_ips': len(self.blocked_ips),
            'ip_reputation': dict(self.ip_reputation),
            'active_threats': len([s for s in self.threat_signatures if s.match_count > 0]),
            'recent_events': await self._get_recent_events(),
            'system_status': await self._get_system_security_status()
        }

    async def _get_recent_events(self) -> List[Dict[str, Any]]:
        """Get recent security events"""
        try:
            from supabase import create_client
            from backend.config.settings import settings
            
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            
            result = supabase.table('security_events').select('*').order('timestamp', desc=True).limit(50).execute()
            
            return result.data
            
        except Exception:
            return []

    async def _get_system_security_status(self) -> Dict[str, Any]:
        """Get system security status"""
        return {
            'protection_active': True,
            'anomaly_threshold': self.anomaly_threshold,
            'blocked_ips_count': len(self.blocked_ips),
            'threat_signatures_count': len(self.threat_signatures),
            'zero_day_patterns_count': len(self.zero_day_patterns),
            'last_update': datetime.now(RIYADH_TZ).isoformat()
        }

# Global zero-day protection instance
zero_day_protection = None

def get_zero_day_protection() -> ZeroDayProtectionSystem:
    """Get or create zero-day protection instance"""
    global zero_day_protection
    if zero_day_protection is None:
        from backend.config.settings import settings
        zero_day_protection = ZeroDayProtectionSystem({
            'anomaly_threshold': 0.7,
            'rate_limit_window': 300,
            'max_requests_per_window': 100,
            'block_duration': 3600
        })
    return zero_day_protection
