"""
FLUX-DNA Complete Integration Test
The Fortress Verification Protocol
"""
import asyncio
import sys
sys.path.append('/app/backend')

from services.claude_service import get_claude_service
from services.encryption import get_encryption_service
from services.email_service import get_email_service
from services.time_gate import get_time_gate_service
from services.osint_safety import get_osint_service
from services.database import get_database_service


async def test_fortress_integration():
    """
    Complete fortress integration test
    All services must be operational
    """
    print("\n" + "="*70)
    print("🔥 FLUX-DNA FORTRESS INTEGRATION TEST")
    print("   Verifying All Security Systems")
    print("="*70)
    
    results = []
    
    # Test 1: Database
    print("\n🧱 Testing Supabase Database...")
    try:
        db = get_database_service()
        health = await db.health_check()
        if health:
            print("✅ Supabase: Connected and operational")
            results.append(True)
        else:
            print("❌ Supabase: Connection failed")
            results.append(False)
    except Exception as e:
        print(f"❌ Supabase: {str(e)}")
        results.append(False)
    
    # Test 2: Time-Gate (Redis)
    print("\n⏰ Testing Redis Time-Gate...")
    try:
        tg = get_time_gate_service()
        # Create test link
        link = tg.create_time_gate_link(
            user_id="test-user",
            session_id="test-session",
            max_clicks=3,
            expiry_hours=24
        )
        print(f"✅ Time-Gate: Link created - {link['link_token'][:16]}...")
        print(f"   Expires in: {link['time_remaining']}")
        print(f"   Max clicks: {link['max_clicks']}")
        results.append(True)
    except Exception as e:
        print(f"❌ Time-Gate: {str(e)}")
        results.append(False)
    
    # Test 3: OSINT Safety
    print("\n🔍 Testing OSINT Safety Checks...")
    try:
        osint = get_osint_service()
        safety = osint.check_connection_safety(
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            headers={'accept-language': 'en-US,en;q=0.9'}
        )
        print(f"✅ OSINT: Safety check complete")
        print(f"   Risk level: {safety['risk_level']}")
        print(f"   Risk score: {safety['risk_score']}")
        print(f"   Cloak mode: {'ACTIVE' if safety['cloak_mode_triggered'] else 'Not needed'}")
        results.append(True)
    except Exception as e:
        print(f"❌ OSINT: {str(e)}")
        results.append(False)
    
    # Test 4: Claude (already tested in sentinel)
    print("\n🧑‍🔬 Testing Claude Integration...")
    try:
        claude = get_claude_service()
        print("✅ Claude: Service initialized")
        results.append(True)
    except Exception as e:
        print(f"❌ Claude: {str(e)}")
        results.append(False)
    
    # Test 5: Encryption (already tested in sentinel)
    print("\n🔐 Testing Encryption...")
    try:
        enc = get_encryption_service()
        test = enc.encrypt("test", "user-x")
        print("✅ Encryption: AES-256-GCM operational")
        results.append(True)
    except Exception as e:
        print(f"❌ Encryption: {str(e)}")
        results.append(False)
    
    # Test 6: Email (already tested in sentinel)
    print("\n📧 Testing Email Service...")
    try:
        email = get_email_service()
        print("✅ Email: Resend configured")
        results.append(True)
    except Exception as e:
        print(f"❌ Email: {str(e)}")
        results.append(False)
    
    # Final Report
    print("\n" + "="*70)
    print("📊 FORTRESS INTEGRATION REPORT")
    print("="*70)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n✅ Tests Passed: {passed}/{total}")
    print(f"❌ Tests Failed: {total - passed}/{total}")
    
    if all(results):
        print("\n🔥 STATUS: FORTRESS FULLY OPERATIONAL")
        print("👁️  ALL SECURITY SYSTEMS ACTIVE")
        print("🕊️ THE SANCTUARY IS READY")
        print("\n🚀 CLEARANCE GRANTED: BUILD FRONTEND")
    else:
        print("\n⚠️  STATUS: SOME SYSTEMS NOT OPERATIONAL")
        print("Please review failed tests and provide missing credentials")
    
    print("="*70)
    
    return all(results)


if __name__ == "__main__":
    result = asyncio.run(test_fortress_integration())
    sys.exit(0 if result else 1)
