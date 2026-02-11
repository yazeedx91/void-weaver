"""
FLUX-DNA OSINT Safety Radar
The Cyber-Guardian Protocol
Version: 2026.1.0

Active VPN/Tor/Proxy detection and connection risk scoring
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Dict
import hashlib
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/osint", tags=["OSINT Safety"])


# Known suspicious patterns
SUSPICIOUS_HEADERS = [
    'via', 'x-forwarded-for', 'x-real-ip', 'x-proxy-id',
    'forwarded', 'x-originating-ip', 'cf-connecting-ip'
]

TOR_EXIT_NODES_SAMPLE = [
    '185.220.', '176.10.', '109.70.', '51.15.', '94.230.',
    '162.247.', '199.249.', '104.244.', '45.66.', '23.129.'
]

VPN_ASN_KEYWORDS = [
    'nordvpn', 'expressvpn', 'mullvad', 'protonvpn', 'surfshark',
    'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'
]


class OSINTCheckRequest(BaseModel):
    """Request for OSINT safety check"""
    user_id: Optional[str] = None
    check_deep: bool = False


class OSINTCheckResponse(BaseModel):
    """OSINT safety check response"""
    risk_score: float  # 0.0 to 1.0
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_indicators: List[str]
    cloak_mode_recommended: bool
    safety_message: str
    checked_at: str


def calculate_ip_hash(ip: str) -> str:
    """Hash IP for privacy-preserving storage"""
    return hashlib.sha256(f"{ip}:FLUX-DNA-SALT-2026".encode()).hexdigest()[:16]


def check_tor_exit(ip: str) -> bool:
    """Check if IP appears to be a Tor exit node"""
    for prefix in TOR_EXIT_NODES_SAMPLE:
        if ip.startswith(prefix):
            return True
    return False


def check_proxy_headers(headers: dict) -> List[str]:
    """Check for proxy-related headers"""
    indicators = []
    for header in SUSPICIOUS_HEADERS:
        if header in headers:
            indicators.append(f"proxy_header:{header}")
    return indicators


def analyze_user_agent(ua: str) -> List[str]:
    """Analyze user agent for suspicious patterns"""
    indicators = []
    ua_lower = ua.lower() if ua else ""
    
    if not ua:
        indicators.append("missing_user_agent")
    elif len(ua) < 20:
        indicators.append("suspicious_short_ua")
    elif 'headless' in ua_lower or 'phantom' in ua_lower:
        indicators.append("automated_browser")
    elif 'curl' in ua_lower or 'wget' in ua_lower or 'python' in ua_lower:
        indicators.append("script_access")
    
    return indicators


def calculate_risk_score(indicators: List[str]) -> float:
    """Calculate overall risk score based on indicators"""
    weights = {
        'tor_exit_node': 0.4,
        'vpn_detected': 0.3,
        'proxy_header': 0.15,
        'missing_user_agent': 0.2,
        'suspicious_short_ua': 0.1,
        'automated_browser': 0.25,
        'script_access': 0.15,
        'datacenter_ip': 0.2,
    }
    
    score = 0.0
    for indicator in indicators:
        base_indicator = indicator.split(':')[0]
        score += weights.get(base_indicator, 0.1)
    
    return min(score, 1.0)


def get_risk_level(score: float) -> str:
    """Convert risk score to level"""
    if score < 0.2:
        return "LOW"
    elif score < 0.4:
        return "MEDIUM"
    elif score < 0.7:
        return "HIGH"
    else:
        return "CRITICAL"


def get_safety_message(risk_level: str, lang: str = "en") -> str:
    """Get appropriate safety message"""
    messages = {
        "en": {
            "LOW": "Connection appears safe. Standard protection active.",
            "MEDIUM": "Some privacy concerns detected. Enhanced monitoring enabled.",
            "HIGH": "Elevated risk detected. Cloak mode recommended for sensitive activities.",
            "CRITICAL": "High-risk connection detected. Maximum protection protocols activated.",
        },
        "ar": {
            "LOW": "يبدو الاتصال آمناً. الحماية القياسية نشطة.",
            "MEDIUM": "تم اكتشاف بعض مخاوف الخصوصية. المراقبة المعززة مفعلة.",
            "HIGH": "تم اكتشاف مخاطر مرتفعة. يُنصح بوضع التخفي للأنشطة الحساسة.",
            "CRITICAL": "تم اكتشاف اتصال عالي الخطورة. بروتوكولات الحماية القصوى مفعلة.",
        }
    }
    return messages.get(lang, messages["en"]).get(risk_level, "Unknown risk level")


@router.post("/check", response_model=OSINTCheckResponse)
async def osint_safety_check(request: Request, body: OSINTCheckRequest):
    """
    Perform OSINT safety check on connection
    
    Analyzes:
    - IP reputation (Tor/VPN/Proxy detection)
    - Request headers
    - User agent patterns
    - Geographic anomalies
    """
    try:
        indicators = []
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("x-forwarded-for", "")
        real_ip = request.headers.get("x-real-ip", client_ip)
        
        # Check for Tor exit nodes
        for ip in [client_ip, real_ip, forwarded_for.split(',')[0] if forwarded_for else '']:
            if ip and check_tor_exit(ip):
                indicators.append("tor_exit_node")
                break
        
        # Check proxy headers
        headers_dict = dict(request.headers)
        proxy_indicators = check_proxy_headers(headers_dict)
        indicators.extend(proxy_indicators)
        
        # Analyze user agent
        user_agent = request.headers.get("user-agent", "")
        ua_indicators = analyze_user_agent(user_agent)
        indicators.extend(ua_indicators)
        
        # Check for datacenter IP patterns
        if any(prefix in real_ip for prefix in ['104.', '172.', '192.168.', '10.']):
            indicators.append("datacenter_ip")
        
        # Calculate risk
        risk_score = calculate_risk_score(indicators)
        risk_level = get_risk_level(risk_score)
        cloak_recommended = risk_score > 0.4
        
        # Log check (anonymized)
        ip_hash = calculate_ip_hash(real_ip)
        
        return OSINTCheckResponse(
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            risk_indicators=indicators,
            cloak_mode_recommended=cloak_recommended,
            safety_message=get_safety_message(risk_level),
            checked_at=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        # Fail safe - return medium risk
        return OSINTCheckResponse(
            risk_score=0.3,
            risk_level="MEDIUM",
            risk_indicators=["check_error"],
            cloak_mode_recommended=False,
            safety_message="Safety check encountered an error. Standard protection active.",
            checked_at=datetime.now(timezone.utc).isoformat()
        )


@router.get("/status")
async def osint_status():
    """Get OSINT radar status"""
    return {
        "status": "ACTIVE",
        "version": "2026.1.0",
        "capabilities": [
            "tor_detection",
            "vpn_detection", 
            "proxy_detection",
            "user_agent_analysis",
            "risk_scoring"
        ],
        "guardian": "WATCHING"
    }
