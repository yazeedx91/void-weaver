# 🔒 ShaheenPulse AI - Enhanced Security Protection System
# ! PATENT-PENDING: SHAHEEN_CORE_LOGIC

import logging
import hashlib
import hmac
import secrets
import time
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
from enum import Enum
from functools import wraps
import traceback
import re
import ipaddress
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enhanced_protection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    """Security level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatLevel(Enum):
    """Threat level enumeration"""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SecurityEvent:
    """Security event data structure"""
    id: str
    event_type: str
    threat_level: ThreatLevel
    source_ip: str
    timestamp: datetime
    description: str
    blocked: bool = False
    metadata: Dict[str, Any] = None

@dataclass
class SecurityMetrics:
    """Security metrics data structure"""
    total_requests: int
    blocked_requests: int
    suspicious_activities: int
    failed_authentications: int
    successful_authentications: int
    last_updated: datetime

class EnhancedSecuritySystem:
    """Enhanced security protection system"""
    
    def __init__(self):
        self.encryption_key = self._generate_encryption_key()
        self.jwt_secret = self._generate_jwt_secret()
        self.security_events: List[SecurityEvent] = []
        self.blocked_ips: Dict[str, datetime] = {}
        self.rate_limits: Dict[str, List[datetime]] = {}
        self.security_metrics = SecurityMetrics(0, 0, 0, 0, 0, datetime.now())
        self.threat_detection_enabled = True
        
        # Security configuration
        self.max_failed_attempts = 5
        self.block_duration = 3600  # 1 hour
        self.rate_limit_window = 300  # 5 minutes
        self.max_requests_per_window = 100
        
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key"""
        try:
            password = b"shaheenpulse_ai_encryption_password_2026"
            salt = b"shaheenpulse_ai_salt_2026"
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
                backend=default_backend()
            )
            key = base64.urlsafe_b64encode(kdf.derive(password))
            return key
        except Exception as e:
            logger.error(f"Error generating encryption key: {str(e)}")
            return Fernet.generate_key()
    
    def _generate_jwt_secret(self) -> str:
        """Generate JWT secret"""
        try:
            return secrets.token_urlsafe(64)
        except Exception as e:
            logger.error(f"Error generating JWT secret: {str(e)}")
            return "fallback_jwt_secret_shaheenpulse_ai_2026"
    
    def _log_security_event(self, event_type: str, threat_level: ThreatLevel, 
                           source_ip: str, description: str, blocked: bool = False, 
                           metadata: Dict[str, Any] = None) -> None:
        """Log security event"""
        try:
            event_id = f"sec_{int(time.time())}_{len(self.security_events)}"
            event = SecurityEvent(
                id=event_id,
                event_type=event_type,
                threat_level=threat_level,
                source_ip=source_ip,
                timestamp=datetime.now(),
                description=description,
                blocked=blocked,
                metadata=metadata or {}
            )
            
            self.security_events.append(event)
            
            # Log the event
            log_level = logging.WARNING if threat_level in [ThreatLevel.LOW, ThreatLevel.MEDIUM] else logging.ERROR
            logger.log(log_level, f"SECURITY [{threat_level.value.upper()}] {source_ip}: {description}")
            
            # Update metrics
            self._update_security_metrics(event)
            
        except Exception as e:
            logger.error(f"Error logging security event: {str(e)}")
            logger.error(traceback.format_exc())
    
    def _update_security_metrics(self, event: SecurityEvent) -> None:
        """Update security metrics"""
        try:
            self.security_metrics.total_requests += 1
            
            if event.blocked:
                self.security_metrics.blocked_requests += 1
            
            if event.event_type in ["suspicious_activity", "potential_attack"]:
                self.security_metrics.suspicious_activities += 1
            
            if event.event_type == "authentication_failed":
                self.security_metrics.failed_authentications += 1
            elif event.event_type == "authentication_success":
                self.security_metrics.successful_authentications += 1
            
            self.security_metrics.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"Error updating security metrics: {str(e)}")
    
    def validate_input_data(self, data: Any, data_type: str = "general") -> Tuple[bool, str]:
        """Validate input data for security threats"""
        try:
            if not data:
                return False, "Empty input data"
            
            # Convert to string for validation
            data_str = str(data)
            
            # Check for SQL injection patterns
            sql_patterns = [
                r"(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
                r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
                r"(\b(OR|AND)\s+['\"]\w+['\"]\s*=\s*['\"]\w+['\"])",
                r"(--|#|\/\*|\*\/)",
                r"(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR)\b)"
            ]
            
            for pattern in sql_patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    return False, f"Potential SQL injection detected: {pattern}"
            
            # Check for XSS patterns
            xss_patterns = [
                r"(<script[^>]*>.*?</script>)",
                r"(javascript:)",
                r"(on\w+\s*=)",
                r"(<iframe[^>]*>)",
                r"(<object[^>]*>)",
                r"(<embed[^>]*>)"
            ]
            
            for pattern in xss_patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    return False, f"Potential XSS detected: {pattern}"
            
            # Check for command injection
            cmd_patterns = [
                r"(\|\s*\w+)",
                r"(;\s*\w+)",
                r"(&\s*\w+)",
                r"(\$\([^)]*\))",
                r"`[^`]*`",
                r"(\b(curl|wget|nc|netcat|telnet)\b)"
            ]
            
            for pattern in cmd_patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    return False, f"Potential command injection detected: {pattern}"
            
            # Check for path traversal
            path_patterns = [
                r"(\.\./)",
                r"(\.\.\\)",
                r"(%2e%2e%2f)",
                r"(%2e%2e%5c)"
            ]
            
            for pattern in path_patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    return False, f"Potential path traversal detected: {pattern}"
            
            # Check data length
            if len(data_str) > 10000:  # 10KB limit
                return False, "Input data too large"
            
            return True, "Input data is valid"
            
        except Exception as e:
            logger.error(f"Error validating input data: {str(e)}")
            return False, f"Validation error: {str(e)}"
    
    def validate_ip_address(self, ip_address: str) -> Tuple[bool, str]:
        """Validate IP address and check against blacklist"""
        try:
            # Check if IP is blocked
            if ip_address in self.blocked_ips:
                block_time = self.blocked_ips[ip_address]
                if datetime.now() < block_time:
                    return False, f"IP address is blocked until {block_time}"
                else:
                    # Unblock if time has passed
                    del self.blocked_ips[ip_address]
            
            # Validate IP format
            try:
                ip = ipaddress.ip_address(ip_address)
            except ValueError:
                return False, "Invalid IP address format"
            
            # Check for private IP ranges (optional security measure)
            if ip.is_private:
                # Log private IP access
                self._log_security_event(
                    "private_ip_access",
                    ThreatLevel.LOW,
                    ip_address,
                    "Access from private IP range"
                )
            
            # Check for suspicious IP patterns
            if self._is_suspicious_ip(ip_address):
                self._log_security_event(
                    "suspicious_ip",
                    ThreatLevel.MEDIUM,
                    ip_address,
                    "Suspicious IP address detected"
                )
                return False, "Suspicious IP address detected"
            
            return True, "IP address is valid"
            
        except Exception as e:
            logger.error(f"Error validating IP address: {str(e)}")
            return False, f"IP validation error: {str(e)}"
    
    def _is_suspicious_ip(self, ip_address: str) -> bool:
        """Check if IP address is suspicious"""
        try:
            # Check against known malicious patterns
            suspicious_patterns = [
                r"^10\.",  # Private network
                r"^172\.(1[6-9]|2[0-9]|3[0-1])\.",  # Private network
                r"^192\.168\.",  # Private network
                r"^169\.254\.",  # Link-local
                r"^127\.",  # Loopback
                r"^0\.",  # Reserved
                r"^255\.",  # Reserved
            ]
            
            for pattern in suspicious_patterns:
                if re.match(pattern, ip_address):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking suspicious IP: {str(e)}")
            return False
    
    def check_rate_limit(self, identifier: str, max_requests: int = None) -> Tuple[bool, str]:
        """Check rate limiting"""
        try:
            max_requests = max_requests or self.max_requests_per_window
            current_time = datetime.now()
            window_start = current_time - timedelta(seconds=self.rate_limit_window)
            
            # Clean old entries
            if identifier in self.rate_limits:
                self.rate_limits[identifier] = [
                    req_time for req_time in self.rate_limits[identifier]
                    if req_time > window_start
                ]
            else:
                self.rate_limits[identifier] = []
            
            # Check current request count
            request_count = len(self.rate_limits[identifier])
            
            if request_count >= max_requests:
                self._log_security_event(
                    "rate_limit_exceeded",
                    ThreatLevel.MEDIUM,
                    identifier,
                    f"Rate limit exceeded: {request_count}/{max_requests}",
                    blocked=True
                )
                return False, f"Rate limit exceeded: {request_count}/{max_requests}"
            
            # Add current request
            self.rate_limits[identifier].append(current_time)
            
            return True, f"Request allowed: {request_count + 1}/{max_requests}"
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {str(e)}")
            return False, f"Rate limit error: {str(e)}"
    
    def encrypt_data(self, data: str) -> Tuple[bool, str]:
        """Encrypt data using Fernet encryption"""
        try:
            fernet = Fernet(self.encryption_key)
            encrypted_data = fernet.encrypt(data.encode())
            return True, encrypted_data.decode()
        except Exception as e:
            logger.error(f"Error encrypting data: {str(e)}")
            return False, f"Encryption error: {str(e)}"
    
    def decrypt_data(self, encrypted_data: str) -> Tuple[bool, str]:
        """Decrypt data using Fernet encryption"""
        try:
            fernet = Fernet(self.encryption_key)
            decrypted_data = fernet.decrypt(encrypted_data.encode())
            return True, decrypted_data.decode()
        except Exception as e:
            logger.error(f"Error decrypting data: {str(e)}")
            return False, f"Decryption error: {str(e)}"
    
    def hash_password(self, password: str, salt: str = None) -> Tuple[bool, str, str]:
        """Hash password with salt"""
        try:
            if salt is None:
                salt = secrets.token_hex(32)
            
            # Use PBKDF2 for password hashing
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt.encode(),
                iterations=100000,
                backend=default_backend()
            )
            
            hashed_password = kdf.derive(password.encode())
            hashed_hex = hashed_password.hex()
            
            return True, hashed_hex, salt
            
        except Exception as e:
            logger.error(f"Error hashing password: {str(e)}")
            return False, f"Password hashing error: {str(e)}", ""
    
    def verify_password(self, password: str, hashed_password: str, salt: str) -> bool:
        """Verify password against hash"""
        try:
            success, new_hash, _ = self.hash_password(password, salt)
            return success and new_hash == hashed_password
        except Exception as e:
            logger.error(f"Error verifying password: {str(e)}")
            return False
    
    def generate_jwt_token(self, user_id: str, expires_in: int = 3600) -> Tuple[bool, str]:
        """Generate JWT token (simplified version)"""
        try:
            header = {
                "alg": "HS256",
                "typ": "JWT"
            }
            
            payload = {
                "user_id": user_id,
                "exp": int(time.time()) + expires_in,
                "iat": int(time.time())
            }
            
            # Encode header and payload
            header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
            payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
            
            # Create signature
            message = f"{header_b64}.{payload_b64}"
            signature = hmac.new(
                self.jwt_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            signature_b64 = base64.urlsafe_b64encode(signature.encode()).decode().rstrip('=')
            
            token = f"{header_b64}.{payload_b64}.{signature_b64}"
            
            return True, token
            
        except Exception as e:
            logger.error(f"Error generating JWT token: {str(e)}")
            return False, f"Token generation error: {str(e)}"
    
    def verify_jwt_token(self, token: str) -> Tuple[bool, Dict[str, Any]]:
        """Verify JWT token"""
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return False, {"error": "Invalid token format"}
            
            header_b64, payload_b64, signature_b64 = parts
            
            # Reconstruct signature
            message = f"{header_b64}.{payload_b64}"
            expected_signature = hmac.new(
                self.jwt_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Verify signature
            if not hmac.compare_digest(signature_b64, expected_signature):
                return False, {"error": "Invalid token signature"}
            
            # Decode payload
            payload = json.loads(base64.urlsafe_b64decode(payload_b64 + '==').decode())
            
            # Check expiration
            if time.time() > payload.get('exp', 0):
                return False, {"error": "Token expired"}
            
            return True, payload
            
        except Exception as e:
            logger.error(f"Error verifying JWT token: {str(e)}")
            return False, {"error": f"Token verification error: {str(e)}"}
    
    def block_ip_address(self, ip_address: str, duration: int = None) -> bool:
        """Block IP address for specified duration"""
        try:
            duration = duration or self.block_duration
            block_until = datetime.now() + timedelta(seconds=duration)
            
            self.blocked_ips[ip_address] = block_until
            
            self._log_security_event(
                "ip_blocked",
                ThreatLevel.HIGH,
                ip_address,
                f"IP address blocked for {duration} seconds",
                blocked=True
            )
            
            logger.info(f"IP {ip_address} blocked until {block_until}")
            return True
            
        except Exception as e:
            logger.error(f"Error blocking IP address: {str(e)}")
            return False
    
    def unblock_ip_address(self, ip_address: str) -> bool:
        """Unblock IP address"""
        try:
            if ip_address in self.blocked_ips:
                del self.blocked_ips[ip_address]
                
                self._log_security_event(
                    "ip_unblocked",
                    ThreatLevel.LOW,
                    ip_address,
                    "IP address unblocked"
                )
                
                logger.info(f"IP {ip_address} unblocked")
                return True
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error unblocking IP address: {str(e)}")
            return False
    
    def detect_threats(self, request_data: Dict[str, Any]) -> ThreatLevel:
        """Detect potential threats in request data"""
        try:
            threat_level = ThreatLevel.NONE
            threat_indicators = []
            
            # Check IP address
            ip_address = request_data.get('ip_address', 'unknown')
            ip_valid, ip_message = self.validate_ip_address(ip_address)
            if not ip_valid:
                threat_level = ThreatLevel.HIGH
                threat_indicators.append(ip_message)
            
            # Check input data
            input_data = request_data.get('data', '')
            data_valid, data_message = self.validate_input_data(input_data)
            if not data_valid:
                threat_level = ThreatLevel.MEDIUM
                threat_indicators.append(data_message)
            
            # Check rate limiting
            identifier = request_data.get('identifier', ip_address)
            rate_valid, rate_message = self.check_rate_limit(identifier)
            if not rate_valid:
                threat_level = ThreatLevel.MEDIUM
                threat_indicators.append(rate_message)
            
            # Check for suspicious patterns
            if self._contains_suspicious_patterns(request_data):
                threat_level = ThreatLevel.HIGH
                threat_indicators.append("Suspicious patterns detected")
            
            # Log threat detection
            if threat_level != ThreatLevel.NONE:
                self._log_security_event(
                    "threat_detected",
                    threat_level,
                    ip_address,
                    f"Threat detected: {', '.join(threat_indicators)}",
                    blocked=threat_level == ThreatLevel.HIGH,
                    metadata={"indicators": threat_indicators}
                )
            
            return threat_level
            
        except Exception as e:
            logger.error(f"Error detecting threats: {str(e)}")
            return ThreatLevel.NONE
    
    def _contains_suspicious_patterns(self, request_data: Dict[str, Any]) -> bool:
        """Check for suspicious patterns in request data"""
        try:
            suspicious_patterns = [
                r"(\b(admin|root|administrator|test|debug)\b)",
                r"(\b(password|passwd|pwd|secret|key|token)\b)",
                r"(\b(attack|exploit|hack|crack|bypass)\b)",
                r"(\b(malware|virus|trojan|worm)\b)",
                r"(\b(bot|crawler|spider|scraper)\b)"
            ]
            
            data_str = str(request_data).lower()
            
            for pattern in suspicious_patterns:
                if re.search(pattern, data_str):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking suspicious patterns: {str(e)}")
            return False
    
    def get_security_report(self) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        try:
            logger.info("Generating security report")
            
            # Calculate security score
            total_requests = self.security_metrics.total_requests
            blocked_requests = self.security_metrics.blocked_requests
            security_score = 100 - ((blocked_requests / total_requests) * 100) if total_requests > 0 else 100
            
            # Get recent events
            recent_events = [
                event for event in self.security_events
                if event.timestamp > datetime.now() - timedelta(hours=24)
            ]
            
            # Get threat breakdown
            threat_counts = {
                threat_level.value: 0
                for threat_level in ThreatLevel
            }
            
            for event in recent_events:
                threat_counts[event.threat_level.value] += 1
            
            # Get blocked IPs
            current_blocked_ips = {
                ip: block_until.isoformat()
                for ip, block_until in self.blocked_ips.items()
                if block_until > datetime.now()
            }
            
            return {
                "security_score": round(security_score, 2),
                "security_metrics": {
                    "total_requests": self.security_metrics.total_requests,
                    "blocked_requests": self.security_metrics.blocked_requests,
                    "suspicious_activities": self.security_metrics.suspicious_activities,
                    "failed_authentications": self.security_metrics.failed_authentications,
                    "successful_authentications": self.security_metrics.successful_authentications,
                    "last_updated": self.security_metrics.last_updated.isoformat()
                },
                "recent_events": [
                    {
                        "id": event.id,
                        "event_type": event.event_type,
                        "threat_level": event.threat_level.value,
                        "source_ip": event.source_ip,
                        "timestamp": event.timestamp.isoformat(),
                        "description": event.description,
                        "blocked": event.blocked,
                        "metadata": event.metadata
                    }
                    for event in recent_events[-50:]  # Last 50 events
                ],
                "threat_breakdown": threat_counts,
                "blocked_ips": current_blocked_ips,
                "rate_limits": {
                    identifier: len(requests)
                    for identifier, requests in self.rate_limits.items()
                },
                "threat_detection_enabled": self.threat_detection_enabled,
                "report_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating security report: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": str(e)}

# Initialize enhanced security system
enhanced_security = EnhancedSecuritySystem()

# Export main classes and functions
__all__ = [
    'EnhancedSecuritySystem',
    'SecurityLevel',
    'ThreatLevel',
    'SecurityEvent',
    'SecurityMetrics',
    'enhanced_security'
]
