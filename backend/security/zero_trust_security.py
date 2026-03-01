# 🔒 ShaheenPulse AI - Zero Trust Security System
# ! PATENT-PENDING: SHAHEEN_CORE_LOGIC

import logging
import hashlib
import hmac
import secrets
import time
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, Set
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
        logging.FileHandler('zero_trust_security.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TrustLevel(Enum):
    """Trust level enumeration"""
    UNTRUSTED = "untrusted"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERIFIED = "verified"

class SecurityContext(Enum):
    """Security context enumeration"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

class ThreatType(Enum):
    """Threat type enumeration"""
    UNKNOWN = "unknown"
    MALICIOUS_IP = "malicious_ip"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    AUTHENTICATION_FAILURE = "authentication_failure"
    AUTHORIZATION_BREACH = "authorization_breach"
    DATA_EXFILTRATION = "data_exfiltration"
    DENIAL_OF_SERVICE = "denial_of_service"

@dataclass
class SecurityPolicy:
    """Security policy data structure"""
    id: str
    name: str
    context: SecurityContext
    trust_level: TrustLevel
    permissions: Set[str]
    restrictions: Set[str]
    created_at: datetime
    expires_at: Optional[datetime]

@dataclass
class SecuritySession:
    """Security session data structure"""
    id: str
    user_id: str
    trust_level: TrustLevel
    context: SecurityContext
    created_at: datetime
    expires_at: datetime
    last_activity: datetime
    ip_address: str
    user_agent: str
    permissions: Set[str]

@dataclass
class SecurityEvent:
    """Security event data structure"""
    id: str
    event_type: str
    threat_type: ThreatType
    severity: float
    source_ip: str
    user_id: Optional[str]
    session_id: Optional[str]
    timestamp: datetime
    description: str
    blocked: bool
    metadata: Dict[str, Any]

class ZeroTrustSecuritySystem:
    """Zero Trust Security System"""
    
    def __init__(self):
        self.encryption_key = self._generate_encryption_key()
        self.jwt_secret = self._generate_jwt_secret()
        self.security_policies: Dict[str, SecurityPolicy] = {}
        self.active_sessions: Dict[str, SecuritySession] = {}
        self.security_events: List[SecurityEvent] = []
        self.blocked_entities: Dict[str, datetime] = {}
        self.trust_scores: Dict[str, float] = {}
        
        # Initialize default policies
        self._initialize_default_policies()
        
        # Security configuration
        self.session_timeout = 3600  # 1 hour
        self.max_failed_attempts = 3
        self.block_duration = 7200  # 2 hours
        self.trust_decay_rate = 0.1  # Trust decay per hour
        
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key"""
        try:
            password = b"shaheenpulse_ai_zero_trust_2026"
            salt = b"zero_trust_salt_2026"
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
            return "zero_trust_jwt_secret_shaheenpulse_ai_2026"
    
    def _initialize_default_policies(self) -> None:
        """Initialize default security policies"""
        try:
            # Public context policy
            self.security_policies["public"] = SecurityPolicy(
                id="public",
                name="Public Access Policy",
                context=SecurityContext.PUBLIC,
                trust_level=TrustLevel.UNTRUSTED,
                permissions={"read_public", "access_public_api"},
                restrictions=set(),
                created_at=datetime.now(),
                expires_at=None
            )
            
            # Internal context policy
            self.security_policies["internal"] = SecurityPolicy(
                id="internal",
                name="Internal Access Policy",
                context=SecurityContext.INTERNAL,
                trust_level=TrustLevel.MEDIUM,
                permissions={"read_internal", "write_internal", "access_internal_api"},
                restrictions={"access_restricted", "access_confidential"},
                created_at=datetime.now(),
                expires_at=None
            )
            
            # Confidential context policy
            self.security_policies["confidential"] = SecurityPolicy(
                id="confidential",
                name="Confidential Access Policy",
                context=SecurityContext.CONFIDENTIAL,
                trust_level=TrustLevel.HIGH,
                permissions={"read_confidential", "write_confidential", "access_confidential_api"},
                restrictions={"access_public", "access_restricted"},
                created_at=datetime.now(),
                expires_at=None
            )
            
            # Restricted context policy
            self.security_policies["restricted"] = SecurityPolicy(
                id="restricted",
                name="Restricted Access Policy",
                context=SecurityContext.RESTRICTED,
                trust_level=TrustLevel.VERIFIED,
                permissions={"read_restricted", "write_restricted", "access_restricted_api"},
                restrictions={"access_public", "access_internal", "access_confidential"},
                created_at=datetime.now(),
                expires_at=None
            )
            
            logger.info("Default security policies initialized")
            
        except Exception as e:
            logger.error(f"Error initializing default policies: {str(e)}")
    
    def _log_security_event(self, event_type: str, threat_type: ThreatType, severity: float,
                           source_ip: str, user_id: Optional[str] = None, session_id: Optional[str] = None,
                           description: str = "", blocked: bool = False, metadata: Dict[str, Any] = None) -> None:
        """Log security event"""
        try:
            event_id = f"zts_{int(time.time())}_{len(self.security_events)}"
            event = SecurityEvent(
                id=event_id,
                event_type=event_type,
                threat_type=threat_type,
                severity=severity,
                source_ip=source_ip,
                user_id=user_id,
                session_id=session_id,
                timestamp=datetime.now(),
                description=description,
                blocked=blocked,
                metadata=metadata or {}
            )
            
            self.security_events.append(event)
            
            # Log the event
            log_level = logging.WARNING if severity < 0.7 else logging.ERROR
            logger.log(log_level, f"ZERO_TRUST [{threat_type.value.upper()}] {source_ip}: {description}")
            
            # Update trust scores
            self._update_trust_score(source_ip, -severity * 0.1)
            
        except Exception as e:
            logger.error(f"Error logging security event: {str(e)}")
    
    def _update_trust_score(self, entity_id: str, delta: float) -> None:
        """Update trust score for entity"""
        try:
            current_score = self.trust_scores.get(entity_id, 0.5)  # Default neutral trust
            new_score = max(0.0, min(1.0, current_score + delta))
            self.trust_scores[entity_id] = new_score
            
            logger.info(f"Updated trust score for {entity_id}: {current_score:.3f} -> {new_score:.3f}")
            
        except Exception as e:
            logger.error(f"Error updating trust score: {str(e)}")
    
    def _calculate_trust_level(self, entity_id: str, context: SecurityContext) -> TrustLevel:
        """Calculate trust level for entity"""
        try:
            trust_score = self.trust_scores.get(entity_id, 0.5)
            
            # Apply context-based trust adjustments
            context_multiplier = {
                SecurityContext.PUBLIC: 0.5,
                SecurityContext.INTERNAL: 0.7,
                SecurityContext.CONFIDENTIAL: 0.85,
                SecurityContext.RESTRICTED: 1.0
            }
            
            adjusted_score = trust_score * context_multiplier.get(context, 0.5)
            
            # Determine trust level
            if adjusted_score >= 0.9:
                return TrustLevel.VERIFIED
            elif adjusted_score >= 0.7:
                return TrustLevel.HIGH
            elif adjusted_score >= 0.5:
                return TrustLevel.MEDIUM
            elif adjusted_score >= 0.3:
                return TrustLevel.LOW
            else:
                return TrustLevel.UNTRUSTED
                
        except Exception as e:
            logger.error(f"Error calculating trust level: {str(e)}")
            return TrustLevel.UNTRUSTED
    
    def _verify_session(self, session_id: str) -> Optional[SecuritySession]:
        """Verify security session"""
        try:
            if session_id not in self.active_sessions:
                return None
            
            session = self.active_sessions[session_id]
            
            # Check if session is expired
            if datetime.now() > session.expires_at:
                del self.active_sessions[session_id]
                self._log_security_event(
                    "session_expired",
                    ThreatType.AUTHENTICATION_FAILURE,
                    0.5,
                    session.ip_address,
                    session.user_id,
                    session_id,
                    "Session expired"
                )
                return None
            
            # Update last activity
            session.last_activity = datetime.now()
            
            # Apply trust decay
            hours_since_creation = (datetime.now() - session.created_at).total_seconds() / 3600
            trust_decay = hours_since_creation * self.trust_decay_rate
            self._update_trust_score(session.user_id, -trust_decay)
            
            return session
            
        except Exception as e:
            logger.error(f"Error verifying session: {str(e)}")
            return None
    
    def _create_session(self, user_id: str, trust_level: TrustLevel, context: SecurityContext,
                       ip_address: str, user_agent: str) -> SecuritySession:
        """Create security session"""
        try:
            session_id = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(seconds=self.session_timeout)
            
            # Get permissions from policy
            policy_key = context.value
            policy = self.security_policies.get(policy_key)
            permissions = policy.permissions if policy else set()
            
            session = SecuritySession(
                id=session_id,
                user_id=user_id,
                trust_level=trust_level,
                context=context,
                created_at=datetime.now(),
                expires_at=expires_at,
                last_activity=datetime.now(),
                ip_address=ip_address,
                user_agent=user_agent,
                permissions=permissions
            )
            
            self.active_sessions[session_id] = session
            
            self._log_security_event(
                "session_created",
                ThreatType.UNKNOWN,
                0.1,
                ip_address,
                user_id,
                session_id,
                f"Session created with trust level {trust_level.value}"
            )
            
            return session
            
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            raise
    
    def authenticate_user(self, user_id: str, credentials: Dict[str, Any], context: SecurityContext,
                        ip_address: str, user_agent: str) -> Tuple[bool, Optional[str]]:
        """Authenticate user with zero trust principles"""
        try:
            logger.info(f"Authenticating user {user_id} in context {context.value}")
            
            # Check if entity is blocked
            if ip_address in self.blocked_entities:
                block_until = self.blocked_entities[ip_address]
                if datetime.now() < block_until:
                    self._log_security_event(
                        "authentication_blocked",
                        ThreatType.AUTHENTICATION_FAILURE,
                        0.8,
                        ip_address,
                        user_id,
                        None,
                        f"Authentication blocked for IP {ip_address}"
                    )
                    return False, None
            
            # Validate credentials (simplified)
            if not self._validate_credentials(credentials):
                self._log_security_event(
                    "authentication_failed",
                    ThreatType.AUTHENTICATION_FAILURE,
                    0.6,
                    ip_address,
                    user_id,
                    None,
                    "Invalid credentials"
                )
                
                # Block after multiple failures
                self._handle_authentication_failure(ip_address)
                return False, None
            
            # Calculate trust level
            trust_level = self._calculate_trust_level(user_id, context)
            
            # Check if trust level is sufficient for context
            required_trust = {
                SecurityContext.PUBLIC: TrustLevel.UNTRUSTED,
                SecurityContext.INTERNAL: TrustLevel.MEDIUM,
                SecurityContext.CONFIDENTIAL: TrustLevel.HIGH,
                SecurityContext.RESTRICTED: TrustLevel.VERIFIED
            }
            
            if trust_level.value < required_trust[context].value:
                self._log_security_event(
                    "insufficient_trust",
                    ThreatType.AUTHORIZATION_BREACH,
                    0.7,
                    ip_address,
                    user_id,
                    None,
                    f"Insufficient trust level: {trust_level.value} < {required_trust[context].value}"
                )
                return False, None
            
            # Create session
            session = self._create_session(user_id, trust_level, context, ip_address, user_agent)
            
            # Update trust score (positive)
            self._update_trust_score(user_id, 0.1)
            
            return True, session.id
            
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            logger.error(traceback.format_exc())
            return False, None
    
    def _validate_credentials(self, credentials: Dict[str, Any]) -> bool:
        """Validate user credentials"""
        try:
            # Simplified credential validation
            # In a real implementation, this would check against a user database
            
            username = credentials.get('username', '')
            password = credentials.get('password', '')
            
            # Basic validation
            if not username or not password:
                return False
            
            # Check for common weak passwords
            weak_passwords = ['password', '123456', 'admin', 'root', 'test']
            if password.lower() in weak_passwords:
                return False
            
            # Simulate credential check (always true for demo)
            return True
            
        except Exception as e:
            logger.error(f"Error validating credentials: {str(e)}")
            return False
    
    def _handle_authentication_failure(self, ip_address: str) -> None:
        """Handle authentication failure"""
        try:
            # Track failed attempts
            failed_key = f"failed_{ip_address}"
            failed_count = self.trust_scores.get(failed_key, 0) + 1
            self.trust_scores[failed_key] = failed_count
            
            # Block after threshold
            if failed_count >= self.max_failed_attempts:
                block_until = datetime.now() + timedelta(seconds=self.block_duration)
                self.blocked_entities[ip_address] = block_until
                
                self._log_security_event(
                    "ip_blocked",
                    ThreatType.MALICIOUS_IP,
                    0.9,
                    ip_address,
                    None,
                    None,
                    f"IP blocked after {failed_count} failed attempts"
                )
            
        except Exception as e:
            logger.error(f"Error handling authentication failure: {str(e)}")
    
    def authorize_request(self, session_id: str, required_permission: str, 
                         resource_context: SecurityContext) -> Tuple[bool, str]:
        """Authorize request with zero trust principles"""
        try:
            logger.info(f"Authorizing request for permission {required_permission}")
            
            # Verify session
            session = self._verify_session(session_id)
            if not session:
                return False, "Invalid or expired session"
            
            # Check if session has required permission
            if required_permission not in session.permissions:
                self._log_security_event(
                    "authorization_denied",
                    ThreatType.AUTHORIZATION_BREACH,
                    0.5,
                    session.ip_address,
                    session.user_id,
                    session_id,
                    f"Permission denied: {required_permission}"
                )
                return False, "Insufficient permissions"
            
            # Check context compatibility
            if session.context.value != resource_context.value:
                # Check if user can access different context
                context_hierarchy = {
                    SecurityContext.PUBLIC: 0,
                    SecurityContext.INTERNAL: 1,
                    SecurityContext.CONFIDENTIAL: 2,
                    SecurityContext.RESTRICTED: 3
                }
                
                user_context_level = context_hierarchy.get(session.context, 0)
                required_context_level = context_hierarchy.get(resource_context, 0)
                
                if user_context_level < required_context_level:
                    self._log_security_event(
                        "context_denied",
                        ThreatType.AUTHORIZATION_BREACH,
                        0.6,
                        session.ip_address,
                        session.user_id,
                        session_id,
                        f"Context denied: {session.context.value} -> {resource_context.value}"
                    )
                    return False, "Insufficient context access"
            
            # Update trust score (positive)
            self._update_trust_score(session.user_id, 0.05)
            
            return True, "Authorization successful"
            
        except Exception as e:
            logger.error(f"Error authorizing request: {str(e)}")
            logger.error(traceback.format_exc())
            return False, f"Authorization error: {str(e)}"
    
    def encrypt_sensitive_data(self, data: str, context: SecurityContext) -> Tuple[bool, str]:
        """Encrypt sensitive data based on context"""
        try:
            # Only encrypt data for confidential and restricted contexts
            if context not in [SecurityContext.CONFIDENTIAL, SecurityContext.RESTRICTED]:
                return True, data
            
            fernet = Fernet(self.encryption_key)
            encrypted_data = fernet.encrypt(data.encode())
            return True, encrypted_data.decode()
            
        except Exception as e:
            logger.error(f"Error encrypting data: {str(e)}")
            return False, f"Encryption error: {str(e)}"
    
    def decrypt_sensitive_data(self, encrypted_data: str, context: SecurityContext) -> Tuple[bool, str]:
        """Decrypt sensitive data based on context"""
        try:
            # Only decrypt data for confidential and restricted contexts
            if context not in [SecurityContext.CONFIDENTIAL, SecurityContext.RESTRICTED]:
                return True, encrypted_data
            
            fernet = Fernet(self.encryption_key)
            decrypted_data = fernet.decrypt(encrypted_data.encode())
            return True, decrypted_data.decode()
            
        except Exception as e:
            logger.error(f"Error decrypting data: {str(e)}")
            return False, f"Decryption error: {str(e)}"
    
    def detect_anomalies(self, request_data: Dict[str, Any]) -> List[str]:
        """Detect security anomalies"""
        try:
            anomalies = []
            
            # Check for suspicious IP patterns
            ip_address = request_data.get('ip_address', '')
            if self._is_suspicious_ip(ip_address):
                anomalies.append("suspicious_ip_address")
            
            # Check for unusual user agent
            user_agent = request_data.get('user_agent', '')
            if self._is_suspicious_user_agent(user_agent):
                anomalies.append("suspicious_user_agent")
            
            # Check for rapid requests
            user_id = request_data.get('user_id', '')
            if self._is_rapid_request(user_id):
                anomalies.append("rapid_requests")
            
            # Check for unusual access patterns
            session_id = request_data.get('session_id', '')
            if self._is_unusual_access_pattern(session_id):
                anomalies.append("unusual_access_pattern")
            
            # Log anomalies
            if anomalies:
                self._log_security_event(
                    "anomaly_detected",
                    ThreatType.SUSPICIOUS_ACTIVITY,
                    0.6,
                    ip_address,
                    user_id,
                    session_id,
                    f"Anomalies detected: {', '.join(anomalies)}"
                )
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            return []
    
    def _is_suspicious_ip(self, ip_address: str) -> bool:
        """Check if IP address is suspicious"""
        try:
            # Check against blocked entities
            if ip_address in self.blocked_entities:
                return True
            
            # Check for low trust score
            trust_score = self.trust_scores.get(ip_address, 0.5)
            if trust_score < 0.3:
                return True
            
            # Check for known malicious patterns
            suspicious_patterns = [
                r"^10\.",  # Private network (suspicious for external access)
                r"^172\.(1[6-9]|2[0-9]|3[0-1])\.",  # Private network
                r"^192\.168\.",  # Private network
                r"^169\.254\.",  # Link-local
                r"^127\.",  # Loopback
            ]
            
            for pattern in suspicious_patterns:
                if re.match(pattern, ip_address):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking suspicious IP: {str(e)}")
            return False
    
    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        try:
            suspicious_patterns = [
                r"(bot|crawler|spider|scraper)",
                r"(curl|wget|python|java)",
                r"(hack|attack|exploit)",
                r"(malware|virus|trojan)"
            ]
            
            user_agent_lower = user_agent.lower()
            for pattern in suspicious_patterns:
                if re.search(pattern, user_agent_lower):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking suspicious user agent: {str(e)}")
            return False
    
    def _is_rapid_request(self, user_id: str) -> bool:
        """Check for rapid requests from user"""
        try:
            # Simplified rapid request detection
            # In a real implementation, this would track request timestamps
            return False
            
        except Exception as e:
            logger.error(f"Error checking rapid requests: {str(e)}")
            return False
    
    def _is_unusual_access_pattern(self, session_id: str) -> bool:
        """Check for unusual access patterns"""
        try:
            # Simplified pattern detection
            # In a real implementation, this would analyze access patterns
            return False
            
        except Exception as e:
            logger.error(f"Error checking unusual access pattern: {str(e)}")
            return False
    
    def get_security_report(self) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        try:
            logger.info("Generating zero trust security report")
            
            # Calculate security metrics
            total_sessions = len(self.active_sessions)
            blocked_entities = len(self.blocked_entities)
            recent_events = len([e for e in self.security_events if e.timestamp > datetime.now() - timedelta(hours=24)])
            
            # Calculate trust score distribution
            trust_scores = list(self.trust_scores.values())
            avg_trust_score = sum(trust_scores) / len(trust_scores) if trust_scores else 0.5
            
            # Get threat breakdown
            threat_counts = {}
            for event in self.security_events:
                threat_type = event.threat_type.value
                threat_counts[threat_type] = threat_counts.get(threat_type, 0) + 1
            
            # Get active sessions details
            active_sessions_details = []
            for session in self.active_sessions.values():
                active_sessions_details.append({
                    'id': session.id,
                    'user_id': session.user_id,
                    'trust_level': session.trust_level.value,
                    'context': session.context.value,
                    'created_at': session.created_at.isoformat(),
                    'expires_at': session.expires_at.isoformat(),
                    'ip_address': session.ip_address,
                    'permissions': list(session.permissions)
                })
            
            return {
                'security_metrics': {
                    'total_sessions': total_sessions,
                    'blocked_entities': blocked_entities,
                    'recent_events': recent_events,
                    'average_trust_score': avg_trust_score
                },
                'threat_breakdown': threat_counts,
                'active_sessions': active_sessions_details,
                'security_policies': {
                    policy_id: {
                        'name': policy.name,
                        'context': policy.context.value,
                        'trust_level': policy.trust_level.value,
                        'permissions': list(policy.permissions),
                        'restrictions': list(policy.restrictions)
                    }
                    for policy_id, policy in self.security_policies.items()
                },
                'recent_events': [
                    {
                        'id': event.id,
                        'event_type': event.event_type,
                        'threat_type': event.threat_type.value,
                        'severity': event.severity,
                        'source_ip': event.source_ip,
                        'user_id': event.user_id,
                        'session_id': event.session_id,
                        'timestamp': event.timestamp.isoformat(),
                        'description': event.description,
                        'blocked': event.blocked
                    }
                    for event in self.security_events[-50:]  # Last 50 events
                ],
                'report_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating security report: {str(e)}")
            logger.error(traceback.format_exc())
            return {'error': str(e)}

# Initialize zero trust security system
zero_trust_security = ZeroTrustSecuritySystem()

# Export main classes and functions
__all__ = [
    'ZeroTrustSecuritySystem',
    'TrustLevel',
    'SecurityContext',
    'ThreatType',
    'SecurityPolicy',
    'SecuritySession',
    'SecurityEvent',
    'zero_trust_security'
]
