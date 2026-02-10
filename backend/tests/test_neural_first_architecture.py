"""
FLUX-DNA Neural-First Architecture Tests
Tests for AI-driven state detection and mode switching
Version: 2026.2.0
"""
import pytest
import requests
import os
import time

# Use the public URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://neural-sanctuary.preview.emergentagent.com').rstrip('/')


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns FORTRESS_ACTIVE"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "FORTRESS_ACTIVE"
        assert "phoenix" in data
        print(f"✅ Health check passed: {data['status']}")


class TestAssessmentStartNeuralDirective:
    """Test Assessment Start API returns neural_directive with detected_state and ui_commands"""
    
    def test_start_assessment_returns_neural_directive(self):
        """Assessment Start API returns neural_directive with detected_state and ui_commands"""
        response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_neural@flux-dna.com",
            "osint_risk": 0.0
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify neural_directive exists
        assert "neural_directive" in data, "neural_directive missing from response"
        neural = data["neural_directive"]
        
        # Verify detected_state
        assert "detected_state" in neural, "detected_state missing from neural_directive"
        assert neural["detected_state"] == "curious", f"Expected 'curious', got '{neural['detected_state']}'"
        
        # Verify ui_commands
        assert "ui_commands" in neural, "ui_commands missing from neural_directive"
        ui_commands = neural["ui_commands"]
        assert "pulse_color" in ui_commands, "pulse_color missing from ui_commands"
        
        print(f"✅ Assessment Start returns neural_directive: detected_state={neural['detected_state']}, pulse_color={ui_commands.get('pulse_color')}")
        return data["session_id"]
    
    def test_start_assessment_high_osint_risk_triggers_sanctuary(self):
        """High OSINT risk (>0.7) should trigger sanctuary mode"""
        response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_high_risk@flux-dna.com",
            "osint_risk": 0.8  # High risk
        })
        assert response.status_code == 200
        data = response.json()
        
        neural = data["neural_directive"]
        assert neural["should_pivot"] == True, "High OSINT risk should trigger pivot"
        assert neural["pivot_to_mode"] == "sanctuary", f"Expected 'sanctuary', got '{neural['pivot_to_mode']}'"
        assert neural["ui_commands"].get("cloak_mode") == True, "Cloak mode should be enabled"
        
        print(f"✅ High OSINT risk triggers sanctuary mode: pivot_to={neural['pivot_to_mode']}, cloak_mode={neural['ui_commands'].get('cloak_mode')}")


class TestAssessmentMessageNormalFlow:
    """Test Assessment Message API with normal messages keeps mode as 'phoenix'"""
    
    def test_normal_message_keeps_phoenix_mode(self):
        """Normal message should keep mode as 'phoenix'"""
        # Start assessment first
        start_response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_normal@flux-dna.com",
            "osint_risk": 0.0
        })
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Wait for AI response
        time.sleep(2)
        
        # Send normal message
        message_response = requests.post(f"{BASE_URL}/api/assessment/message", json={
            "session_id": session_id,
            "message": "I am feeling good today. I want to learn more about myself.",
            "osint_risk": 0.0
        })
        assert message_response.status_code == 200
        data = message_response.json()
        
        # Verify neural_directive
        assert "neural_directive" in data
        neural = data["neural_directive"]
        
        # Normal message should not trigger pivot
        assert neural["detected_state"] == "assessment", f"Expected 'assessment', got '{neural['detected_state']}'"
        
        # Verify state_transition
        assert "state_transition" in data
        state = data["state_transition"]
        assert state["mode"] == "phoenix", f"Expected 'phoenix' mode, got '{state['mode']}'"
        
        print(f"✅ Normal message keeps phoenix mode: state={neural['detected_state']}, mode={state['mode']}")


class TestAssessmentMessageDistressDetection:
    """Test Assessment Message API with distress keywords triggers pivot to 'sanctuary' mode"""
    
    def test_distress_keywords_trigger_sanctuary(self):
        """Distress keywords ('scared', 'trapped', 'controls') should trigger pivot to 'sanctuary' mode"""
        # Start assessment first
        start_response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_distress@flux-dna.com",
            "osint_risk": 0.0
        })
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Wait for AI response
        time.sleep(2)
        
        # Send distress message with multiple indicators
        message_response = requests.post(f"{BASE_URL}/api/assessment/message", json={
            "session_id": session_id,
            "message": "I feel scared and trapped. He controls everything I do. I feel isolated.",
            "osint_risk": 0.0
        })
        assert message_response.status_code == 200
        data = message_response.json()
        
        # Verify neural_directive
        assert "neural_directive" in data
        neural = data["neural_directive"]
        
        # Distress should trigger sanctuary mode
        assert neural["detected_state"] in ["distress", "sanctuary"], f"Expected distress/sanctuary state, got '{neural['detected_state']}'"
        assert neural["should_pivot"] == True, "Distress should trigger pivot"
        assert neural["pivot_to_mode"] == "sanctuary", f"Expected 'sanctuary', got '{neural['pivot_to_mode']}'"
        
        # Verify UI commands for sanctuary
        ui_commands = neural["ui_commands"]
        assert ui_commands.get("enable_quick_exit") == True, "Quick exit should be enabled"
        
        print(f"✅ Distress keywords trigger sanctuary: state={neural['detected_state']}, mode={neural['pivot_to_mode']}, quick_exit={ui_commands.get('enable_quick_exit')}")


class TestAssessmentMessageCrisisDetection:
    """Test Assessment Message API with crisis keywords triggers pivot to 'guardian' mode"""
    
    def test_crisis_keywords_trigger_guardian(self):
        """Crisis keywords ('suicide', 'end it', 'tonight') should trigger pivot to 'guardian' mode with emergency_resources=true"""
        # Start assessment first
        start_response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_crisis@flux-dna.com",
            "osint_risk": 0.0
        })
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Wait for AI response
        time.sleep(2)
        
        # Send crisis message with multiple indicators
        message_response = requests.post(f"{BASE_URL}/api/assessment/message", json={
            "session_id": session_id,
            "message": "I want to end it all tonight. I can't take it anymore. There's no other way.",
            "osint_risk": 0.0
        })
        assert message_response.status_code == 200
        data = message_response.json()
        
        # Verify neural_directive
        assert "neural_directive" in data
        neural = data["neural_directive"]
        
        # Crisis should trigger guardian mode
        assert neural["detected_state"] == "crisis", f"Expected 'crisis' state, got '{neural['detected_state']}'"
        assert neural["should_pivot"] == True, "Crisis should trigger pivot"
        assert neural["pivot_to_mode"] == "guardian", f"Expected 'guardian', got '{neural['pivot_to_mode']}'"
        assert neural["emergency_resources"] == True, "Emergency resources should be true for crisis"
        
        # Verify UI commands for guardian
        ui_commands = neural["ui_commands"]
        assert ui_commands.get("show_emergency_resources") == True, "Emergency resources should be shown"
        assert ui_commands.get("enable_quick_exit") == True, "Quick exit should be enabled"
        assert ui_commands.get("pulse_color") == "red", f"Expected 'red' pulse, got '{ui_commands.get('pulse_color')}'"
        
        print(f"✅ Crisis keywords trigger guardian: state={neural['detected_state']}, mode={neural['pivot_to_mode']}, emergency_resources={neural['emergency_resources']}")


class TestAssessmentCompleteCeremonial:
    """Test Assessment Complete API transitions to 'ceremonial' mode with confetti UI command"""
    
    def test_complete_assessment_triggers_ceremonial(self):
        """Assessment Complete API should transition to 'ceremonial' mode with confetti UI command"""
        # Start assessment first
        start_response = requests.post(f"{BASE_URL}/api/assessment/start", json={
            "language": "en",
            "persona": "al_hakim",
            "user_email": "test_complete@flux-dna.com",
            "osint_risk": 0.0
        })
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Wait for AI response
        time.sleep(2)
        
        # Complete assessment
        complete_response = requests.post(f"{BASE_URL}/api/assessment/complete", json={
            "session_id": session_id,
            "user_id": f"user-{session_id}",
            "all_responses_encrypted": {}
        })
        assert complete_response.status_code == 200
        data = complete_response.json()
        
        # Verify neural_directive
        assert "neural_directive" in data
        neural = data["neural_directive"]
        
        # Complete should trigger ceremonial mode
        assert neural["detected_state"] == "celebration", f"Expected 'celebration' state, got '{neural['detected_state']}'"
        assert neural["should_pivot"] == True, "Complete should trigger pivot"
        assert neural["pivot_to_mode"] == "ceremonial", f"Expected 'ceremonial', got '{neural['pivot_to_mode']}'"
        
        # Verify UI commands for ceremonial
        ui_commands = neural["ui_commands"]
        assert ui_commands.get("show_confetti") == True, "Confetti should be shown"
        assert ui_commands.get("enable_ceremonial_mode") == True, "Ceremonial mode should be enabled"
        assert ui_commands.get("pulse_color") == "gold", f"Expected 'gold' pulse, got '{ui_commands.get('pulse_color')}'"
        
        # Verify sovereign title
        assert "sovereign_title" in data, "Sovereign title should be present"
        assert data["sar_value"] == 5500, f"Expected SAR 5500, got {data['sar_value']}"
        
        print(f"✅ Complete triggers ceremonial: state={neural['detected_state']}, mode={neural['pivot_to_mode']}, confetti={ui_commands.get('show_confetti')}, title={data.get('sovereign_title')}")


class TestVaultSubmitAIAnalysis:
    """Test Vault Submit API returns ai_analysis with risk_level"""
    
    def test_vault_submit_returns_ai_analysis(self):
        """Vault Submit API should return ai_analysis with risk_level"""
        response = requests.post(
            f"{BASE_URL}/api/vault/submit",
            data={
                "user_id": "test_vault_user",
                "evidence_type": "text",
                "description": "He threatened to hurt me if I leave. I am scared and feel trapped.",
                "encrypted_content": "encrypted_evidence_content"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify ai_analysis
        assert "ai_analysis" in data, "ai_analysis missing from response"
        assert "risk_level" in data, "risk_level missing from response"
        
        # High risk keywords should result in HIGH or CRITICAL risk
        assert data["risk_level"] in ["HIGH", "CRITICAL"], f"Expected HIGH/CRITICAL risk, got '{data['risk_level']}'"
        
        # Verify recommended_actions
        assert "recommended_actions" in data, "recommended_actions missing"
        assert len(data["recommended_actions"]) > 0, "Should have recommended actions"
        
        print(f"✅ Vault Submit returns AI analysis: risk_level={data['risk_level']}, actions={len(data['recommended_actions'])}")
    
    def test_vault_submit_low_risk(self):
        """Vault Submit with neutral content should return LOW risk"""
        response = requests.post(
            f"{BASE_URL}/api/vault/submit",
            data={
                "user_id": "test_vault_user_low",
                "evidence_type": "text",
                "description": "Just documenting a normal conversation for my records.",
                "encrypted_content": "encrypted_content"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_level"] == "LOW", f"Expected LOW risk, got '{data['risk_level']}'"
        print(f"✅ Vault Submit low risk: risk_level={data['risk_level']}")


class TestOSINTCheck:
    """Test OSINT Check API returns risk_score"""
    
    def test_osint_check_returns_risk_score(self):
        """OSINT Check API should return risk_score"""
        response = requests.post(f"{BASE_URL}/api/osint/check", json={
            "user_id": "test_osint_user",
            "check_deep": False
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify risk_score
        assert "risk_score" in data, "risk_score missing from response"
        assert isinstance(data["risk_score"], (int, float)), "risk_score should be numeric"
        assert 0 <= data["risk_score"] <= 1, f"risk_score should be 0-1, got {data['risk_score']}"
        
        # Verify risk_level
        assert "risk_level" in data, "risk_level missing from response"
        assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"], f"Invalid risk_level: {data['risk_level']}"
        
        # Verify safety_message
        assert "safety_message" in data, "safety_message missing"
        
        print(f"✅ OSINT Check returns risk_score: {data['risk_score']}, level={data['risk_level']}")
    
    def test_osint_status(self):
        """OSINT status endpoint should return ACTIVE"""
        response = requests.get(f"{BASE_URL}/api/osint/status")
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "ACTIVE"
        assert "capabilities" in data
        print(f"✅ OSINT Status: {data['status']}, capabilities={len(data['capabilities'])}")


class TestAssessmentScales:
    """Test Assessment Scales endpoint"""
    
    def test_get_scales(self):
        """Get all 8 psychometric scales"""
        response = requests.get(f"{BASE_URL}/api/assessment/scales")
        assert response.status_code == 200
        data = response.json()
        
        assert "scales" in data
        assert len(data["scales"]) == 8, f"Expected 8 scales, got {len(data['scales'])}"
        
        # Verify scale IDs
        scale_ids = [s["id"] for s in data["scales"]]
        expected_ids = ["hexaco", "dass", "teique", "ravens", "schwartz", "hits", "pcptsd", "web"]
        for expected in expected_ids:
            assert expected in scale_ids, f"Missing scale: {expected}"
        
        print(f"✅ Assessment Scales: {len(data['scales'])} scales returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
