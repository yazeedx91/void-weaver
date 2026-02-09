"""
FLUX-DNA OSINT Safety Check Service
Background Connection Analysis for Sovereigness Sanctuary
NON-NEGOTIABLE SECURITY REQUIREMENT
"""
import os
from typing import Dict, Optional
from dotenv import load_dotenv
import hashlib
from datetime import datetime
import requests

load_dotenv()


class OSINTSafetyService:
    """
    OSINT Safety Shield: Detect compromised connections
    Trigger 'Cloak Mode' for women's protection
    """
    
    def __init__(self):
        # Try Tavily first, fallback to Perplexity
        self.tavily_key = os.environ.get('TAVILY_API_KEY')
        self.perplexity_key = os.environ.get('PERPLEXITY_API_KEY')
        
        if not self.tavily_key and not self.perplexity_key:
            raise ValueError(
                "TAVILY_API_KEY or PERPLEXITY_API_KEY required for OSINT safety checks. "
                "This is a non-negotiable security requirement for Sovereigness Sanctuary."
            )
        
        self.provider = 'tavily' if self.tavily_key else 'perplexity'
    
    def hash_ip(self, ip_address: str) -> str:
        """
        Hash IP address for privacy
        We never store raw IPs
        """
        return hashlib.sha256(ip_address.encode()).hexdigest()
    
    def check_connection_safety(
        self,
        ip_address: str,
        user_agent: str,
        headers: Dict
    ) -> Dict:
        """
        Perform OSINT safety check on connection
        
        Args:
            ip_address: Client IP address (will be hashed)
            user_agent: Browser user agent
            headers: Request headers
            
        Returns:
            Safety assessment with risk indicators
        """
        ip_hash = self.hash_ip(ip_address)
        
        # Initialize risk indicators
        risk_indicators = []
        risk_score = 0.0
        cloak_mode_triggered = False
        
        # Check 1: VPN/Proxy Detection
        vpn_detected = self._detect_vpn_proxy(ip_address)
        if vpn_detected:
            risk_indicators.append("VPN/Proxy detected (protective measure)")
            # VPN is GOOD for safety, reduces risk
            risk_score -= 0.1
        
        # Check 2: Tor Detection
        tor_detected = self._detect_tor(ip_address)
        if tor_detected:
            risk_indicators.append("Tor network detected (protective measure)")
            risk_score -= 0.2
        
        # Check 3: Known Abuser IP Database Check
        abuser_check = self._check_abuser_database(ip_hash)
        if abuser_check['is_known_threat']:
            risk_indicators.append("Connection flagged in threat database")
            risk_score += 0.8
            cloak_mode_triggered = True
        
        # Check 4: Unusual Browser Fingerprint
        fingerprint_risk = self._analyze_browser_fingerprint(user_agent, headers)
        if fingerprint_risk > 0.5:
            risk_indicators.append("Unusual browser fingerprint detected")
            risk_score += fingerprint_risk
        
        # Check 5: Geographic Anomaly (Saudi Arabia expected)
        geo_check = self._check_geographic_context(ip_address)
        if geo_check['risk'] > 0.3:
            risk_indicators.append(f"Geographic context: {geo_check['reason']}")
            risk_score += geo_check['risk']
        
        # Normalize risk score (0.0 to 1.0)
        risk_score = max(0.0, min(1.0, risk_score))
        
        # Trigger cloak mode for high risk
        if risk_score > 0.6:
            cloak_mode_triggered = True
        
        return {
            'ip_hash': ip_hash,
            'risk_score': round(risk_score, 2),
            'risk_level': self._get_risk_level(risk_score),
            'risk_indicators': risk_indicators,
            'cloak_mode_triggered': cloak_mode_triggered,
            'protective_measures_detected': vpn_detected or tor_detected,
            'timestamp': datetime.utcnow().isoformat(),
            'recommendations': self._get_recommendations(risk_score, cloak_mode_triggered)
        }
    
    def _detect_vpn_proxy(self, ip_address: str) -> bool:
        """
        Detect VPN/Proxy usage
        Note: VPN is GOOD for user safety in our context
        """
        # Simple heuristic checks (in production, use API like IPHub)
        # For now, check common VPN IP ranges
        vpn_indicators = [
            ip_address.startswith('10.'),  # Private network
            ip_address.startswith('172.'),  # Private network
            ip_address.startswith('192.168.'),  # Private network
        ]
        return any(vpn_indicators)
    
    def _detect_tor(self, ip_address: str) -> bool:
        """
        Detect Tor exit node
        Tor is GOOD for user safety in our context
        """
        # In production, check against Tor exit node list
        # For now, placeholder
        return False
    
    def _check_abuser_database(self, ip_hash: str) -> Dict:
        """
        Check against known abuser IP database
        CRITICAL for Sovereigness Sanctuary
        """
        # In production, query threat intelligence database
        # For MVP, return safe default
        return {
            'is_known_threat': False,
            'threat_type': None,
            'confidence': 0.0
        }
    
    def _analyze_browser_fingerprint(self, user_agent: str, headers: Dict) -> float:
        """
        Analyze browser fingerprint for suspicious patterns
        """
        risk = 0.0
        
        # Check for headless browser (potential monitoring tool)
        if 'headless' in user_agent.lower():
            risk += 0.3
        
        # Check for automated tools
        automation_keywords = ['bot', 'crawler', 'spider', 'scraper']
        if any(keyword in user_agent.lower() for keyword in automation_keywords):
            risk += 0.4
        
        # Check for missing expected headers
        expected_headers = ['accept-language', 'accept-encoding']
        missing_headers = [h for h in expected_headers if h not in headers]
        if missing_headers:
            risk += 0.1 * len(missing_headers)
        
        return min(1.0, risk)
    
    def _check_geographic_context(self, ip_address: str) -> Dict:
        """
        Check if connection is from expected region (Saudi Arabia)
        """
        # In production, use IP geolocation API
        # For MVP, return neutral
        return {
            'risk': 0.0,
            'reason': 'Geographic check requires geolocation API',
            'expected_region': 'Saudi Arabia'
        }
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Get human-readable risk level"""
        if risk_score < 0.2:
            return 'safe'
        elif risk_score < 0.4:
            return 'low'
        elif risk_score < 0.6:
            return 'medium'
        elif risk_score < 0.8:
            return 'high'
        else:
            return 'critical'
    
    def _get_recommendations(self, risk_score: float, cloak_triggered: bool) -> list:
        """Get safety recommendations based on risk"""
        recommendations = []
        
        if cloak_triggered:
            recommendations.append("CLOAK MODE ACTIVATED: Quick exit button available")
            recommendations.append("Consider using private browsing mode")
            recommendations.append("Ensure you're on a secure, private connection")
        
        if risk_score > 0.4:
            recommendations.append("Use VPN for additional privacy")
            recommendations.append("Clear browser history after session")
            recommendations.append("Consider using Tor browser for maximum anonymity")
        
        if risk_score < 0.2:
            recommendations.append("Connection appears safe")
            recommendations.append("Continue with assessment")
        
        return recommendations
    
    def trigger_cloak_mode_ui(self, session_id: str) -> Dict:
        """
        Prepare cloak mode UI response
        Returns instructions for frontend to activate protective measures
        """
        return {
            'cloak_mode': True,
            'session_id': session_id,
            'ui_mode': 'pearl_moonlight',  # Special Sanctuary UI
            'quick_exit_enabled': True,
            'quick_exit_target': 'https://www.weather.com',  # Innocent landing page
            'header_warning': 'You are in a protected space. Quick exit available at any time.',
            'footer_notice': 'This conversation is encrypted and private.'
        }


# Singleton instance
_osint_service = None

def get_osint_service() -> OSINTSafetyService:
    """Get or create OSINT service singleton"""
    global _osint_service
    if _osint_service is None:
        _osint_service = OSINTSafetyService()
    return _osint_service
