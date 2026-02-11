"""
FLUX-DNA Zero-Knowledge Encryption Service
Client-Side AES-256-GCM Encryption Utilities
"""
import os
import base64
from typing import Dict, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import secrets


class EncryptionService:
    """
    Zero-Knowledge Encryption Service
    All encryption happens client-side; server only stores ciphertext
    """
    
    def __init__(self):
        # Master key for server-side operations (32 bytes)
        master_key_hex = os.environ.get('ENCRYPTION_MASTER_KEY')
        if not master_key_hex or len(master_key_hex) != 64:
            raise ValueError("ENCRYPTION_MASTER_KEY must be 64 hex characters (32 bytes)")
        self.master_key = bytes.fromhex(master_key_hex)
    
    def derive_user_key(self, user_id: str, salt: bytes = None) -> Tuple[bytes, bytes]:
        """
        Derive a user-specific encryption key using PBKDF2
        
        Args:
            user_id: User's unique identifier
            salt: Salt for key derivation (generated if not provided)
            
        Returns:
            Tuple of (derived_key, salt)
        """
        if salt is None:
            salt = secrets.token_bytes(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        # Combine master key with user ID for derivation
        key_material = self.master_key + user_id.encode('utf-8')
        derived_key = kdf.derive(key_material)
        
        return derived_key, salt
    
    def encrypt(self, plaintext: str, user_id: str) -> str:
        """
        Encrypt data with user-specific key
        
        Args:
            plaintext: Data to encrypt
            user_id: User's unique identifier
            
        Returns:
            Encrypted data in format: iv:auth_tag:salt:ciphertext (base64)
        """
        # Derive user-specific key
        derived_key, salt = self.derive_user_key(user_id)
        
        # Create AESGCM cipher
        aesgcm = AESGCM(derived_key)
        
        # Generate random IV (12 bytes for GCM)
        iv = secrets.token_bytes(12)
        
        # Encrypt
        ciphertext_with_tag = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
        
        # Separate ciphertext and auth tag (last 16 bytes)
        ciphertext = ciphertext_with_tag[:-16]
        auth_tag = ciphertext_with_tag[-16:]
        
        # Encode to base64 and combine
        iv_b64 = base64.b64encode(iv).decode('utf-8')
        tag_b64 = base64.b64encode(auth_tag).decode('utf-8')
        salt_b64 = base64.b64encode(salt).decode('utf-8')
        ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
        
        return f"{iv_b64}:{tag_b64}:{salt_b64}:{ciphertext_b64}"
    
    def decrypt(self, encrypted_data: str, user_id: str) -> str:
        """
        Decrypt data with user-specific key
        
        Args:
            encrypted_data: Encrypted data in format iv:auth_tag:salt:ciphertext
            user_id: User's unique identifier
            
        Returns:
            Decrypted plaintext
        """
        # Parse encrypted data
        parts = encrypted_data.split(':')
        if len(parts) != 4:
            raise ValueError("Invalid encrypted data format")
        
        iv_b64, tag_b64, salt_b64, ciphertext_b64 = parts
        
        # Decode from base64
        iv = base64.b64decode(iv_b64)
        auth_tag = base64.b64decode(tag_b64)
        salt = base64.b64decode(salt_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
        
        # Derive user-specific key with stored salt
        derived_key, _ = self.derive_user_key(user_id, salt)
        
        # Create AESGCM cipher
        aesgcm = AESGCM(derived_key)
        
        # Decrypt
        plaintext = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        
        return plaintext.decode('utf-8')
    
    def generate_client_encryption_params(self) -> Dict:
        """
        Generate parameters for client-side encryption
        
        Returns:
            Dictionary with encryption parameters for client
        """
        return {
            'algorithm': 'AES-256-GCM',
            'iv_length': 12,
            'tag_length': 16,
            'iterations': 100000,
            'hash': 'SHA-256'
        }


# Singleton instance
_encryption_service = None

def get_encryption_service() -> EncryptionService:
    """Get or create encryption service singleton"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service
