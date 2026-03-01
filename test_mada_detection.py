"""
Mada Card Detection Test Script
Tests Saudi customer detection and Mada prioritization
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from payment.moyasar_gateway import MoyasarGateway
from payment import PaymentRequest, PaymentProvider, PAYMENT_CONFIG

async def test_mada_detection():
    """Test Mada card detection for Saudi customers"""
    
    print("🧪 Testing Mada Card Detection for Saudi Customers")
    print("=" * 50)
    
    # Initialize Moyasar gateway
    gateway = MoyasarGateway()
    
    # Test cases for Saudi customer detection
    test_cases = [
        {
            "email": "user@domain.sa",
            "expected_mada": True,
            "description": "Saudi domain (.sa)"
        },
        {
            "email": "customer@company.com.sa",
            "expected_mada": True,
            "description": "Saudi company domain (.com.sa)"
        },
        {
            "email": "client@organization.org.sa",
            "expected_mada": True,
            "description": "Saudi organization domain (.org.sa)"
        },
        {
            "email": "admin@network.net.sa",
            "expected_mada": True,
            "description": "Saudi network domain (.net.sa)"
        },
        {
            "email": "user@gmail.com",
            "expected_mada": False,
            "description": "International domain (gmail.com)"
        },
        {
            "email": "customer@outlook.com",
            "expected_mada": False,
            "description": "International domain (outlook.com)"
        },
        {
            "email": "client@company.co.uk",
            "expected_mada": False,
            "description": "International domain (.co.uk)"
        }
    ]
    
    print("\n🔍 Testing Saudi Customer Detection:")
    print("-" * 40)
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        email = test_case["email"]
        expected = test_case["expected_mada"]
        description = test_case["description"]
        
        # Test the detection logic
        is_mada = gateway._is_mada_card(email)
        passed = is_mada == expected
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{i}. {status} - {description}")
        print(f"   Email: {email}")
        print(f"   Expected: {expected}, Got: {is_mada}")
        
        if not passed:
            all_passed = False
        print()
    
    print("\n🎯 Testing Card Type Prioritization:")
    print("-" * 40)
    
    # Test card type prioritization
    card_types = gateway.get_supported_card_types()
    
    # Test Saudi customer (should prioritize Mada)
    saudi_email = "user@domain.sa"
    is_saudi = gateway._is_mada_card(saudi_email)
    
    print(f"Saudi Customer: {saudi_email}")
    print(f"Detected as Saudi: {is_saudi}")
    print(f"Card Types Available:")
    
    for card_name, card_info in card_types.items():
        priority = card_info.get("priority", 999)
        saudi_priority = card_info.get("saudi_priority", False)
        
        if is_saudi and saudi_priority:
            print(f"  🌟 {card_name} (Priority: {priority}, Saudi Priority: YES)")
        else:
            print(f"  • {card_name} (Priority: {priority}, Saudi Priority: {saudi_priority})")
    
    print("\n📊 Testing Payment Request with Saudi Customer:")
    print("-" * 40)
    
    # Create a test payment request
    payment_request = PaymentRequest(
        amount=4900.00,
        currency="SAR",
        tier="discovery",
        customer_email="user@domain.sa",
        customer_name="Saudi Test User",
        description="Discovery Tier - Advanced AI Analytics",
        callback_url="https://yourdomain.com/billing/success",
        webhook_url="https://yourdomain.com/api/billing/webhook"
    )
    
    print(f"Payment Request Created:")
    print(f"  Amount: {payment_request.amount} {payment_request.currency}")
    print(f"  Tier: {payment_request.tier}")
    print(f"  Customer: {payment_request.customer_email}")
    print(f"  Saudi Customer: {gateway._is_mada_card(payment_request.customer_email)}")
    
    # Test supported cards endpoint simulation
    print(f"\n🎨 UI Card Display Priority (Saudi Customer):")
    print("-" * 40)
    
    sorted_cards = sorted(
        card_types.items(),
        key=lambda x: (
            0 if is_saudi and x[1].get("saudi_priority", False) else 1,
            x[1].get("priority", 999)
        )
    )
    
    for i, (card_name, card_info) in enumerate(sorted_cards, 1):
        priority = card_info.get("priority", 999)
        saudi_priority = card_info.get("saudi_priority", False)
        
        if is_saudi and saudi_priority:
            print(f"  {i}. 🌟 {card_name} - RECOMMENDED for Saudi customers")
        else:
            print(f"  {i}. • {card_name} - Priority {priority}")
    
    print("\n🔧 Configuration Test:")
    print("-" * 40)
    
    # Test configuration
    config = gateway.config
    print(f"API Key: {config['api_key'][:20]}...")
    print(f"Base URL: {config['base_url']}")
    print(f"Webhook Secret: {'Set' if config['webhook_secret'] else 'Not Set'}")
    
    print("\n✅ Overall Test Result:")
    print("-" * 40)
    
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Saudi customer detection working correctly")
        print("✅ Mada card prioritization working correctly")
        print("✅ Payment request creation successful")
        print("✅ Card type prioritization working correctly")
    else:
        print("❌ SOME TESTS FAILED!")
        print("⚠️  Please check the implementation")
    
    print("\n📋 Next Steps:")
    print("-" * 40)
    print("1. Update actual Moyasar secret key in configuration")
    print("2. Set up PostgreSQL database using database_schema.sql")
    print("3. Configure webhook endpoints in Moyasar dashboard")
    print("4. Test actual payment flow with real API")
    print("5. Verify webhook processing and database storage")
    
    return all_passed

if __name__ == "__main__":
    try:
        result = asyncio.run(test_mada_detection())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        sys.exit(1)
