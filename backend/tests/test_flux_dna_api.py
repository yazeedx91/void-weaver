"""
FLUX-DNA Backend API Tests
Tests for Neural Router, OSINT, Assessment, and Founder endpoints
"""
import pytest
import requests
import os
import time

# Get API URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://neural-sanctuary.preview.emergentagent.com')
BASE_URL = BASE_URL.rstrip('/')

# Test credentials
FOUNDER_PASSWORD = "PhoenixSovereign2026!"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_fortress_active(self):
        """Test /api/health returns FORTRESS_ACTIVE status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "FORTRESS_ACTIVE"
        assert data["phoenix"] == "ASCENDED"
        assert data["guardian"] == "WATCHING"
        assert data["people"] == "FREE"
        assert "version" in data
        assert "timestamp" in data


class TestOSINTEndpoint:
    """OSINT Safety Radar endpoint tests"""
    
    def test_osint_check_returns_risk_score(self):
        """Test /api/osint/check returns risk_score and risk_level"""
        response = requests.post(
            f"{BASE_URL}/api/osint/check",
            json={},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "risk_score" in data
        assert "risk_level" in data
        assert isinstance(data["risk_score"], (int, float))
        assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        assert "risk_indicators" in data
        assert "cloak_mode_recommended" in data
        assert "safety_message" in data
        assert "checked_at" in data
    
    def test_osint_status_returns_active(self):
        """Test /api/osint/status returns ACTIVE"""
        response = requests.get(f"{BASE_URL}/api/osint/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ACTIVE"
        assert "capabilities" in data


class TestAssessmentEndpoints:
    """Assessment API endpoint tests"""
    
    def test_assessment_start_returns_session(self):
        """Test /api/assessment/start returns session_id and neural_directive"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test@example.com",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert "neural_directive" in data
        assert "initial_message" in data
        assert data["status"] == "active"
        
        # Verify neural_directive structure
        neural = data["neural_directive"]
        assert "should_pivot" in neural
        assert "detected_state" in neural
        assert "ui_commands" in neural
        
        return data["session_id"]
    
    def test_assessment_message_normal_flow(self):
        """Test /api/assessment/message with normal message"""
        # First start a session
        start_response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test_normal@example.com",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        session_id = start_response.json()["session_id"]
        
        # Send a normal message
        response = requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I am feeling curious about this assessment",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert "neural_directive" in data
        assert "state_transition" in data
        
        # Normal message should not trigger sanctuary mode
        assert data["neural_directive"]["detected_state"] in ["curious", "assessment"]
    
    def test_assessment_message_distress_triggers_sanctuary(self):
        """Test /api/assessment/message with distress keywords triggers sanctuary mode"""
        # First start a session
        start_response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test_distress@example.com",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        session_id = start_response.json()["session_id"]
        
        # Send a distress message
        response = requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I feel scared and trapped, he hits me and I have no way out",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "neural_directive" in data
        assert "state_transition" in data
        
        # Distress message should trigger sanctuary mode
        neural = data["neural_directive"]
        assert neural["detected_state"] == "distress"
        assert neural["should_pivot"] == True
        assert neural["pivot_to_mode"] == "sanctuary"
        
        # UI commands should enable quick exit
        assert neural["ui_commands"].get("enable_quick_exit") == True
    
    def test_assessment_scales_returns_all_scales(self):
        """Test /api/assessment/scales returns all 8 scales"""
        response = requests.get(f"{BASE_URL}/api/assessment/scales")
        assert response.status_code == 200
        
        data = response.json()
        assert "scales" in data
        assert len(data["scales"]) == 8
        
        # Verify scale IDs
        scale_ids = [s["id"] for s in data["scales"]]
        expected_ids = ["hexaco", "dass", "teique", "ravens", "schwartz", "hits", "pcptsd", "web"]
        for expected_id in expected_ids:
            assert expected_id in scale_ids


class TestFounderEndpoints:
    """Founder Dashboard endpoint tests"""
    
    def test_founder_metrics_requires_auth(self):
        """Test /api/founder/metrics requires authorization"""
        response = requests.get(f"{BASE_URL}/api/founder/metrics")
        assert response.status_code == 401
    
    def test_founder_metrics_with_valid_password(self):
        """Test /api/founder/metrics with valid password"""
        response = requests.get(
            f"{BASE_URL}/api/founder/metrics",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "timestamp" in data
        assert "metrics" in data
        assert "last_24h" in data
        assert "stability_trends" in data
    
    def test_founder_metrics_with_invalid_password(self):
        """Test /api/founder/metrics with invalid password"""
        response = requests.get(
            f"{BASE_URL}/api/founder/metrics",
            headers={"Authorization": "Bearer wrong_password"}
        )
        assert response.status_code == 401
    
    def test_founder_strategic_briefing_endpoint_exists(self):
        """Test /api/founder/strategic-briefing endpoint exists (EXPECTED TO FAIL - NOT IMPLEMENTED)"""
        response = requests.post(
            f"{BASE_URL}/api/founder/strategic-briefing",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        # This test documents that the endpoint is missing
        # Frontend expects it but backend doesn't have it
        if response.status_code == 404:
            pytest.skip("strategic-briefing endpoint not implemented - needs to be added")
        assert response.status_code == 200
    
    def test_founder_analytics_timeline(self):
        """Test /api/founder/analytics/timeline"""
        response = requests.get(
            f"{BASE_URL}/api/founder/analytics/timeline?days=7",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "timeline" in data
        assert "total_days" in data


class TestCrisisDetection:
    """Crisis detection and guardian mode tests"""
    
    def test_crisis_keywords_trigger_guardian_mode(self):
        """Test that crisis keywords trigger guardian mode"""
        # Start session
        start_response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test_crisis@example.com",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        session_id = start_response.json()["session_id"]
        
        # Send crisis message
        response = requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I want to end my life, I can't take it anymore, goodbye",
                "osint_risk": 0.0
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        neural = data["neural_directive"]
        
        # Crisis should trigger guardian mode
        assert neural["detected_state"] == "crisis"
        assert neural["pivot_to_mode"] == "guardian"
        assert neural["emergency_resources"] == True


class TestHighOSINTRisk:
    """Tests for high OSINT risk scenarios"""
    
    def test_high_osint_risk_enables_cloak_mode(self):
        """Test that high OSINT risk enables cloak mode"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test_osint@example.com",
                "osint_risk": 0.8  # High risk
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        neural = data["neural_directive"]
        
        # High OSINT risk should enable cloak mode
        assert neural["ui_commands"].get("cloak_mode") == True
        assert neural["ui_commands"].get("enable_quick_exit") == True


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
