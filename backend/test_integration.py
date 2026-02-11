"""
FLUX-DNA Integration Test Suite
Verify all core components are working
"""
import asyncio
import sys
sys.path.append('/app/backend')

from services.claude_service import get_claude_service
from services.encryption import get_encryption_service


async def test_claude_integration():
    """Test Claude 4 Sonnet integration"""
    print("\n🧪 Testing Claude Integration...")
    
    try:
        claude = get_claude_service()
        print("✅ Claude service initialized")
        
        # Create a test conversation
        chat = await claude.create_conversation(
            session_id="test-integration",
            persona="al_hakim",
            language="en"
        )
        print("✅ Conversation created with Al-Hakim persona")
        
        # Send a test message
        response = await claude.send_message(
            chat,
            "Hello, I'm ready to begin my assessment."
        )
        print(f"✅ Claude responded: {response[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Claude test failed: {e}")
        return False


def test_encryption():
    """Test Zero-Knowledge encryption"""
    print("\n🧪 Testing Encryption Service...")
    
    try:
        encryption = get_encryption_service()
        print("✅ Encryption service initialized")
        
        # Test data
        plaintext = "Sensitive psychometric data: DASS Depression=10, Anxiety=8"
        user_id = "test-user-123"
        
        # Encrypt
        encrypted = encryption.encrypt(plaintext, user_id)
        print(f"✅ Data encrypted: {encrypted[:60]}...")
        
        # Decrypt
        decrypted = encryption.decrypt(encrypted, user_id)
        print(f"✅ Data decrypted: {decrypted}")
        
        # Verify
        assert plaintext == decrypted, "Decryption mismatch!"
        print("✅ Encryption/Decryption verified")
        
        return True
        
    except Exception as e:
        print(f"❌ Encryption test failed: {e}")
        return False


async def run_all_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("🔥 FLUX-DNA INTEGRATION TESTS")
    print("="*60)
    
    results = []
    
    # Test encryption (synchronous)
    results.append(test_encryption())
    
    # Test Claude integration (asynchronous)
    results.append(await test_claude_integration())
    
    print("\n" + "="*60)
    if all(results):
        print("✅ ALL TESTS PASSED")
        print("🔥 THE PHOENIX IS READY TO ASCEND")
    else:
        print("❌ SOME TESTS FAILED")
        print("🔧 Review errors above")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
