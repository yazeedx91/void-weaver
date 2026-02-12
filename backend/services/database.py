"""
FLUX-DNA Supabase Database Service
The Neural Fortress
"""
import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


class DatabaseService:
    """
    Supabase database service
    PostgreSQL + pgvector for Neural Signatures
    """
    
    def __init__(self):
        url = os.environ.get('SUPABASE_URL')
        service_key = os.environ.get('SUPABASE_SERVICE_KEY')  # Use service key for backend
        
        if not url or not service_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY required. "
                "Please set up Supabase project and provide credentials."
            )
        
        self.client: Client = create_client(url, service_key)
        self.url = url
    
    def get_client(self) -> Client:
        """Get Supabase client"""
        return self.client
    
    async def health_check(self) -> bool:
        """
        Check database connection health
        """
        try:
            # Simple query to test connection
            result = self.client.table('users').select('id').limit(1).execute()
            return True
        except Exception as e:
            print(f"Database health check failed: {e}")
            return False
    
    # User operations
    async def create_user(self, email: str, language: str = 'en') -> dict:
        """Create new user"""
        data = {
            'email': email,
            'preferred_language': language
        }
        result = self.client.table('users').insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        result = self.client.table('users').select('*').eq('email', email).execute()
        return result.data[0] if result.data else None
    
    # Assessment operations
    async def create_assessment_session(self, user_id: str, language: str, persona: str) -> dict:
        """Create new assessment session"""
        data = {
            'user_id': user_id,
            'language': language,
            'persona_used': persona,
            'session_status': 'in_progress'
        }
        result = self.client.table('assessment_sessions').insert(data).execute()
        return result.data[0] if result.data else None
    
    # Time-gate operations
    async def store_time_gate_link(self, link_data: dict) -> dict:
        """Store time-gate link metadata in database"""
        result = self.client.table('time_gate_links').insert(link_data).execute()
        return result.data[0] if result.data else None
    
    # Forensic vault operations
    async def store_evidence(self, user_id: str, evidence_data: dict) -> dict:
        """Store encrypted evidence in forensic vault"""
        data = {
            'user_id': user_id,
            **evidence_data
        }
        result = self.client.table('forensic_vault').insert(data).execute()
        return result.data[0] if result.data else None
    
    # Analytics operations
    async def log_founder_event(self, event_type: str, metadata: dict) -> dict:
        """Log event for founder analytics"""
        data = {
            'event_type': event_type,
            'event_metadata': metadata
        }
        result = self.client.table('founder_analytics').insert(data).execute()
        return result.data[0] if result.data else None


# Singleton instance
_database_service = None

def get_database_service() -> DatabaseService:
    """Get or create database service singleton"""
    global _database_service
    if _database_service is None:
        _database_service = DatabaseService()
    return _database_service
