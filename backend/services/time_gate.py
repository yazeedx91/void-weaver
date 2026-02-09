"""
FLUX-DNA Redis Time-Gate Service
24-Hour / 3-Click Link Expiration System
NON-NEGOTIABLE SECURITY REQUIREMENT
"""
import os
from typing import Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import redis
import json
import uuid

load_dotenv()


class TimeGateService:
    """
    The Time-Gate: 24-Hour / 3-Click Self-Destruct Links
    Security mechanism for results delivery
    """
    
    def __init__(self):
        redis_url = os.environ.get('UPSTASH_REDIS_URL')
        redis_token = os.environ.get('UPSTASH_REDIS_TOKEN')
        
        if not redis_url or not redis_token:
            raise ValueError("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN required for Time-Gate security")
        
        # Upstash Redis connection
        # Format: redis://default:token@host:port
        self.redis_client = redis.from_url(
            redis_url,
            password=redis_token,
            decode_responses=True
        )
        
        # Test connection
        self.redis_client.ping()
    
    def create_time_gate_link(
        self,
        user_id: str,
        session_id: str,
        max_clicks: int = 3,
        expiry_hours: int = 24
    ) -> Dict:
        """
        Create a time-gated link with 24h expiration and 3-click limit
        
        Args:
            user_id: User's unique identifier
            session_id: Assessment session ID
            max_clicks: Maximum allowed accesses (default: 3)
            expiry_hours: Link expiration in hours (default: 24)
            
        Returns:
            Dictionary with link token and metadata
        """
        # Generate unique link token
        link_token = str(uuid.uuid4())
        
        # Calculate expiration
        created_at = datetime.utcnow()
        expires_at = created_at + timedelta(hours=expiry_hours)
        
        # Link metadata
        link_data = {
            'user_id': user_id,
            'session_id': session_id,
            'created_at': created_at.isoformat(),
            'expires_at': expires_at.isoformat(),
            'max_clicks': max_clicks,
            'current_clicks': 0,
            'is_active': True,
            'deactivation_reason': None
        }
        
        # Store in Redis with TTL
        redis_key = f"time_gate:{link_token}"
        ttl_seconds = expiry_hours * 3600
        
        self.redis_client.setex(
            redis_key,
            ttl_seconds,
            json.dumps(link_data)
        )
        
        return {
            'link_token': link_token,
            'expires_at': expires_at.isoformat(),
            'max_clicks': max_clicks,
            'link_url': f"/results/{link_token}",
            'time_remaining': f"{expiry_hours} hours"
        }
    
    def validate_and_increment(self, link_token: str) -> Dict:
        """
        Validate link and increment click counter
        
        Args:
            link_token: The time-gate link token
            
        Returns:
            Validation result with link data or error
        """
        redis_key = f"time_gate:{link_token}"
        
        # Get link data
        link_data_str = self.redis_client.get(redis_key)
        
        if not link_data_str:
            return {
                'valid': False,
                'reason': 'expired',
                'message': 'This link has expired. Time-gate closed.'
            }
        
        link_data = json.loads(link_data_str)
        
        # Check if already deactivated
        if not link_data['is_active']:
            return {
                'valid': False,
                'reason': link_data['deactivation_reason'],
                'message': f"Link deactivated: {link_data['deactivation_reason']}"
            }
        
        # Check click limit
        if link_data['current_clicks'] >= link_data['max_clicks']:
            # Deactivate link
            link_data['is_active'] = False
            link_data['deactivation_reason'] = 'max_clicks_reached'
            self.redis_client.set(redis_key, json.dumps(link_data))
            
            return {
                'valid': False,
                'reason': 'max_clicks',
                'message': f"Maximum access limit reached ({link_data['max_clicks']} clicks)"
            }
        
        # Increment click counter
        link_data['current_clicks'] += 1
        link_data['last_accessed'] = datetime.utcnow().isoformat()
        
        # Update in Redis
        ttl = self.redis_client.ttl(redis_key)
        self.redis_client.setex(redis_key, ttl, json.dumps(link_data))
        
        # Calculate remaining
        clicks_remaining = link_data['max_clicks'] - link_data['current_clicks']
        expires_at = datetime.fromisoformat(link_data['expires_at'])
        time_remaining = expires_at - datetime.utcnow()
        
        return {
            'valid': True,
            'user_id': link_data['user_id'],
            'session_id': link_data['session_id'],
            'clicks_remaining': clicks_remaining,
            'time_remaining_hours': round(time_remaining.total_seconds() / 3600, 1),
            'expires_at': link_data['expires_at'],
            'warning': clicks_remaining <= 1  # Show warning on last click
        }
    
    def revoke_link(self, link_token: str, reason: str = 'user_revoked') -> bool:
        """
        Manually revoke a time-gate link
        
        Args:
            link_token: Link token to revoke
            reason: Reason for revocation
            
        Returns:
            Success status
        """
        redis_key = f"time_gate:{link_token}"
        link_data_str = self.redis_client.get(redis_key)
        
        if not link_data_str:
            return False
        
        link_data = json.loads(link_data_str)
        link_data['is_active'] = False
        link_data['deactivation_reason'] = reason
        link_data['revoked_at'] = datetime.utcnow().isoformat()
        
        # Keep for audit trail but mark as revoked
        ttl = self.redis_client.ttl(redis_key)
        self.redis_client.setex(redis_key, ttl, json.dumps(link_data))
        
        return True
    
    def get_link_status(self, link_token: str) -> Optional[Dict]:
        """
        Get current status of a time-gate link
        
        Args:
            link_token: Link token to check
            
        Returns:
            Link status or None if not found
        """
        redis_key = f"time_gate:{link_token}"
        link_data_str = self.redis_client.get(redis_key)
        
        if not link_data_str:
            return None
        
        link_data = json.loads(link_data_str)
        ttl = self.redis_client.ttl(redis_key)
        
        return {
            **link_data,
            'ttl_seconds': ttl,
            'ttl_hours': round(ttl / 3600, 1)
        }
    
    def cleanup_expired_links(self) -> int:
        """
        Cleanup expired links (Redis handles this automatically with TTL)
        This is for manual cleanup if needed
        
        Returns:
            Number of links cleaned up
        """
        # Redis handles TTL automatically
        # This method is for compatibility with database-based systems
        pattern = "time_gate:*"
        expired_count = 0
        
        for key in self.redis_client.scan_iter(pattern):
            link_data_str = self.redis_client.get(key)
            if link_data_str:
                link_data = json.loads(link_data_str)
                expires_at = datetime.fromisoformat(link_data['expires_at'])
                
                if datetime.utcnow() > expires_at:
                    self.redis_client.delete(key)
                    expired_count += 1
        
        return expired_count


# Singleton instance
_time_gate_service = None

def get_time_gate_service() -> TimeGateService:
    """Get or create time-gate service singleton"""
    global _time_gate_service
    if _time_gate_service is None:
        _time_gate_service = TimeGateService()
    return _time_gate_service
