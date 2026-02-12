"""
FLUX-DNA Groq Integration Test
Ultra-Fast Reasoning Model Validation
Version: 2026.1.0
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.groq_service import get_groq_service


async def test_groq_integration():
    """
    Test Groq integration with the compound model
    """
    print("🚀 FLUX-DNA Groq Integration Test")
    print("=" * 50)
    
    try:
        # Initialize Groq service
        groq = get_groq_service()
        print(f"✅ Groq service initialized with model: {groq.model}")
        
        # Test 1: Fast reasoning with your example
        print("\n📝 Test 1: Fast Reasoning")
        print("-" * 30)
        
        response = await groq.fast_reasoning(
            prompt="Explain why fast inference is critical for reasoning models",
            language='en'
        )
        
        if response["success"]:
            print("✅ Fast reasoning successful!")
            print(f"⚡ Inference Time: {response['inference_time_seconds']:.2f}s")
            print(f"📊 Tokens: {response['usage']['total_tokens']}")
            print(f"🧠 Response:")
            print(response["content"][:200] + "..." if len(response["content"]) > 200 else response["content"])
        else:
            print(f"❌ Fast reasoning failed: {response['error']}")
            return
        
        # Test 2: Neural analysis
        print("\n🧠 Test 2: Neural Analysis")
        print("-" * 30)
        
        assessment_context = {
            "current_scale": "hexaco",
            "progress": 25,
            "state": "curious"
        }
        
        neural_response = await groq.neural_analysis(
            user_input="I'm feeling excited about this assessment!",
            assessment_context=assessment_context,
            language='en'
        )
        
        if neural_response["success"]:
            print("✅ Neural analysis successful!")
            print(f"⚡ Inference Time: {neural_response['inference_time_seconds']:.2f}s")
            print(f"🧠 Analysis:")
            print(neural_response["content"][:300] + "..." if len(neural_response["content"]) > 300 else neural_response["content"])
        else:
            print(f"❌ Neural analysis failed: {neural_response['error']}")
        
        # Test 3: Benchmark
        print("\n📊 Test 3: Performance Benchmark")
        print("-" * 30)
        
        test_prompts = [
            "What is 2+2?",
            "Explain quantum computing in one sentence",
            "Why is the sky blue?",
            "Describe the perfect Saudi coffee"
        ]
        
        benchmark = await groq.benchmark_inference_speed(test_prompts)
        
        print(f"✅ Benchmark completed!")
        print(f"📈 Success Rate: {benchmark['results']['success_rate']:.1f}%")
        print(f"⚡ Average Inference Time: {benchmark['results']['average_inference_time_seconds']:.2f}s")
        print(f"🚀 Average Tokens/Second: {benchmark['results']['average_tokens_per_second']:.1f}")
        
        # Test 4: Arabic reasoning
        print("\n🇸🇦 Test 4: Arabic Reasoning")
        print("-" * 30)
        
        arabic_response = await groq.fast_reasoning(
            prompt="لماذا الاستدلال السريع مهم لنماذج الذكاء الاصطناعي؟",
            language='ar'
        )
        
        if arabic_response["success"]:
            print("✅ Arabic reasoning successful!")
            print(f"⚡ Inference Time: {arabic_response['inference_time_seconds']:.2f}s")
            print(f"🇸🇦 Arabic Response:")
            print(arabic_response["content"][:200] + "..." if len(arabic_response["content"]) > 200 else arabic_response["content"])
        else:
            print(f"❌ Arabic reasoning failed: {arabic_response['error']}")
        
        print("\n🎉 All tests completed!")
        print("🔥 Groq ultra-fast inference is integrated into FLUX-DNA Citadel")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("💡 Make sure GROQ_API_KEY is set in your environment")


if __name__ == "__main__":
    asyncio.run(test_groq_integration())
