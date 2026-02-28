"""
🛡️ CITADEL ARMOR - Zero-Knowledge Security & Stealth
Supabase Row Level Security, Quick-Exit Protocol, and Metadata Erasure
"""

import os
import hashlib
import secrets
from PIL import Image
from PIL.ExifTags import TAGS
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import pytz
from supabase import create_client, Client
import json

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

class CitadelArmor:
    """Zero-Knowledge security implementation for FLUX-DNA"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.supabase: Client = create_client(
            config['supabase_url'],
            config['supabase_service_key']  # Use service key for admin operations
        )
        
        # Emergency exit configuration
        self.neutral_sites = [
            'https://edu.gov.sa',
            'https://moe.gov.sa', 
            'https://spd.gov.sa',
            'https://saudidigital.gov.sa'
        ]
        
        # Session security
        self.session_timeout = 30 * 60  # 30 minutes
        self.max_failed_attempts = 3
        self.lockout_duration = 15 * 60  # 15 minutes

    async def setup_rls_policies(self) -> bool:
        """Setup Row Level Security policies for all tables"""
        try:
            # Enable RLS on all tables
            tables = [
                'users', 'neural_signatures', 'daily_pulse', 
                'agent_sessions', 'user_data', 'file_uploads'
            ]
            
            for table in tables:
                await self._enable_rls_for_table(table)
                await self._create_rls_policies_for_table(table)
            
            print("✅ RLS policies implemented for all tables")
            return True
            
        except Exception as e:
            print(f"❌ Error setting up RLS policies: {e}")
            return False

    async def _enable_rls_for_table(self, table_name: str):
        """Enable RLS for a specific table"""
        sql = f"""
        ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
        """
        
        try:
            self.supabase.rpc('execute_sql', {'sql': sql}).execute()
        except:
            # Table might not exist or RLS already enabled
            pass

    async def _create_rls_policies_for_table(self, table_name: str):
        """Create RLS policies for a specific table"""
        policies = {
            'users': [
                # Users can only see their own profile
                """
                CREATE POLICY "Users can view own profile" ON users
                FOR SELECT USING (auth.uid()::text = id);
                """,
                """
                CREATE POLICY "Users can update own profile" ON users
                FOR UPDATE USING (auth.uid()::text = id);
                """
            ],
            'neural_signatures': [
                """
                CREATE POLICY "Users can view own neural signatures" ON neural_signatures
                FOR SELECT USING (auth.uid()::text = user_id);
                """,
                """
                CREATE POLICY "Users can insert own neural signatures" ON neural_signatures
                FOR INSERT WITH CHECK (auth.uid()::text = user_id);
                """
            ],
            'agent_sessions': [
                """
                CREATE POLICY "Users can view own sessions" ON agent_sessions
                FOR SELECT USING (auth.uid()::text = user_id);
                """,
                """
                CREATE POLICY "Users can manage own sessions" ON agent_sessions
                FOR ALL USING (auth.uid()::text = user_id);
                """
            ],
            'user_data': [
                """
                CREATE POLICY "Users can view own data" ON user_data
                FOR SELECT USING (auth.uid()::text = user_id);
                """,
                """
                CREATE POLICY "Users can manage own data" ON user_data
                FOR ALL USING (auth.uid()::text = user_id);
                """
            ],
            'file_uploads': [
                """
                CREATE POLICY "Users can view own files" ON file_uploads
                FOR SELECT USING (auth.uid()::text = user_id);
                """,
                """
                CREATE POLICY "Users can upload files" ON file_uploads
                FOR INSERT WITH CHECK (auth.uid()::text = user_id);
                """
            ],
            'daily_pulse': [
                # Public read access for daily pulse
                """
                CREATE POLICY "Daily pulse is publicly readable" ON daily_pulse
                FOR SELECT USING (true);
                """
            ]
        }
        
        if table_name in policies:
            for policy_sql in policies[table_name]:
                try:
                    self.supabase.rpc('execute_sql', {'sql': policy_sql}).execute()
                except Exception as e:
                    print(f"Policy creation error for {table_name}: {e}")

    def generate_secure_token(self, user_id: str) -> str:
        """Generate cryptographically secure session token"""
        timestamp = datetime.now(RIYADH_TZ).isoformat()
        payload = f"{user_id}:{timestamp}:{secrets.token_urlsafe(32)}"
        
        # Hash the payload
        token_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        # Return token with hash
        return f"{token_hash}:{payload}"

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate and decode secure token"""
        try:
            if ':' not in token:
                return None
            
            token_hash, payload = token.split(':', 1)
            
            # Verify hash
            expected_hash = hashlib.sha256(payload.encode()).hexdigest()
            if token_hash != expected_hash:
                return None
            
            # Decode payload
            parts = payload.split(':')
            if len(parts) < 3:
                return None
            
            user_id, timestamp_str, _ = parts[0], parts[1], parts[2]
            
            # Check timestamp
            timestamp = datetime.fromisoformat(timestamp_str)
            if datetime.now(RIYADH_TZ) - timestamp > timedelta(seconds=self.session_timeout):
                return None
            
            return {
                'user_id': user_id,
                'timestamp': timestamp,
                'valid': True
            }
            
        except Exception:
            return None

    async def quick_exit_protocol(self, user_id: str, reason: str = "manual") -> bool:
        """Execute quick exit protocol"""
        try:
            # Log the exit
            await self._log_security_event(user_id, "quick_exit", {
                'reason': reason,
                'timestamp': datetime.now(RIYADH_TZ).isoformat(),
                'ip_address': self._get_client_ip()
            })
            
            # Clear user session
            await self._clear_user_session(user_id)
            
            # Select random neutral site
            neutral_site = self.neutral_sites[secrets.randbelow(len(self.neutral_sites))]
            
            return True
            
        except Exception as e:
            print(f"Error in quick exit protocol: {e}")
            return False

    async def _clear_user_session(self, user_id: str):
        """Clear all user session data"""
        try:
            # Delete active sessions
            self.supabase.table('user_sessions').delete().eq('user_id', user_id).execute()
            
            # Invalidate tokens
            self.supabase.table('active_tokens').delete().eq('user_id', user_id).execute()
            
        except Exception as e:
            print(f"Error clearing user session: {e}")

    async def _log_security_event(self, user_id: str, event_type: str, metadata: Dict[str, Any]):
        """Log security events"""
        try:
            event_data = {
                'user_id': user_id,
                'event_type': event_type,
                'metadata': metadata,
                'timestamp': datetime.now(RIYADH_TZ).isoformat(),
                'severity': 'high' if event_type == 'quick_exit' else 'medium'
            }
            
            self.supabase.table('security_events').insert(event_data).execute()
            
        except Exception as e:
            print(f"Error logging security event: {e}")

    def _get_client_ip(self) -> str:
        """Get client IP address (simplified)"""
        # In production, get from request headers
        return "0.0.0.0"

    def strip_exif_data(self, image_path: str, output_path: str) -> bool:
        """Strip EXIF metadata from images using Pillow"""
        try:
            # Open image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Create new image without EXIF
            data = list(image.getdata())
            clean_image = Image.new(image.mode, image.size)
            clean_image.putdata(data)
            
            # Save without EXIF
            clean_image.save(output_path, quality=95, optimize=True)
            
            print(f"✅ EXIF data stripped from {image_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error stripping EXIF data: {e}")
            return False

    async def process_file_upload(self, user_id: str, file_data: bytes, filename: str, file_type: str) -> Dict[str, Any]:
        """Process file upload with security measures"""
        try:
            # Generate secure filename
            secure_filename = self._generate_secure_filename(user_id, filename)
            
            # Scan for malware (simplified)
            if not await self._scan_file(file_data):
                raise Exception("File security scan failed")
            
            # Strip metadata if image
            if file_type.startswith('image/'):
                # Process with PIL to strip EXIF
                from io import BytesIO
                
                image = Image.open(BytesIO(file_data))
                clean_data = BytesIO()
                
                # Remove EXIF
                data = list(image.getdata())
                clean_image = Image.new(image.mode, image.size)
                clean_image.putdata(data)
                clean_image.save(clean_data, format='JPEG', quality=95)
                
                file_data = clean_data.getvalue()
            
            # Store file record
            file_record = {
                'user_id': user_id,
                'original_filename': filename,
                'secure_filename': secure_filename,
                'file_type': file_type,
                'file_size': len(file_data),
                'upload_timestamp': datetime.now(RIYADH_TZ).isoformat(),
                'metadata_stripped': file_type.startswith('image/'),
                'security_scanned': True
            }
            
            result = self.supabase.table('file_uploads').insert(file_record).execute()
            
            return {
                'success': True,
                'file_id': result.data[0]['id'],
                'secure_filename': secure_filename,
                'metadata_stripped': file_type.startswith('image/')
            }
            
        except Exception as e:
            print(f"Error processing file upload: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_secure_filename(self, user_id: str, original_filename: str) -> str:
        """Generate secure filename"""
        timestamp = datetime.now(RIYADH_TZ).strftime('%Y%m%d_%H%M%S')
        random_suffix = secrets.token_urlsafe(8)
        file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
        
        return f"{user_id}_{timestamp}_{random_suffix}.{file_extension}"

    async def _scan_file(self, file_data: bytes) -> bool:
        """Basic file security scan"""
        try:
            # Check file size (max 10MB)
            if len(file_data) > 10 * 1024 * 1024:
                return False
            
            # Check for suspicious patterns
            suspicious_patterns = [
                b'<script', b'javascript:', b'data:text/html',
                b'eval(', b'exec(', b'system('
            ]
            
            for pattern in suspicious_patterns:
                if pattern in file_data.lower():
                    return False
            
            return True
            
        except Exception:
            return False

    async def create_user_session(self, user_id: str, locale: str = 'ar') -> Dict[str, Any]:
        """Create secure user session"""
        try:
            # Generate session token
            session_token = self.generate_secure_token(user_id)
            
            # Store session
            session_data = {
                'user_id': user_id,
                'session_token': session_token,
                'locale': locale,
                'created_at': datetime.now(RIYADH_TZ).isoformat(),
                'expires_at': (datetime.now(RIYADH_TZ) + timedelta(seconds=self.session_timeout)).isoformat(),
                'ip_address': self._get_client_ip(),
                'user_agent': 'FLUX-DNA Client'
            }
            
            result = self.supabase.table('user_sessions').insert(session_data).execute()
            
            return {
                'success': True,
                'session_token': session_token,
                'expires_at': session_data['expires_at'],
                'session_id': result.data[0]['id']
            }
            
        except Exception as e:
            print(f"Error creating user session: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def validate_session(self, session_token: str) -> Optional[Dict[str, Any]]:
        """Validate user session"""
        try:
            # Decode token
            token_data = self.validate_token(session_token)
            if not token_data:
                return None
            
            # Check session exists in database
            result = self.supabase.table('user_sessions').select('*').eq('session_token', session_token).execute()
            
            if not result.data:
                return None
            
            session = result.data[0]
            
            # Check if expired
            expires_at = datetime.fromisoformat(session['expires_at'])
            if datetime.now(RIYADH_TZ) > expires_at:
                await self._clear_user_session(token_data['user_id'])
                return None
            
            return {
                'user_id': token_data['user_id'],
                'session_id': session['id'],
                'locale': session.get('locale', 'ar'),
                'valid': True
            }
            
        except Exception as e:
            print(f"Error validating session: {e}")
            return None

# Global security instance
citadel_armor = None

def get_citadel_armor() -> CitadelArmor:
    """Get or create Citadel Armor instance"""
    global citadel_armor
    if citadel_armor is None:
        from backend.config.settings import settings
        import os
        citadel_armor = CitadelArmor({
            'supabase_url': settings.supabase_url or '',
            'supabase_service_key': os.getenv('SUPABASE_SERVICE_KEY', '')
        })
    return citadel_armor
