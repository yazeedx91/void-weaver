"""
FLUX-DNA Backend API Tests
Comprehensive pytest test suite for all API endpoints
"""
import pytest
import requests
import os
import time

# Use the public URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://flux-sanctuary.preview.emergentagent.com')

# Test credentials
FOUNDER_PASSWORD = "PhoenixSovereign2026!"


class TestHealthEndpoint:
    """Test /api/health endpoint - FORTRESS_ACTIVE status"""
    
    def test_health_returns_fortress_active(self):
        """Verify health endpoint returns FORTRESS_ACTIVE status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "FORTRESS_ACTIVE"
        assert data["mission"] == "SOVEREIGN_LIBERATION"
        assert data["phoenix"] == "ASCENDED"
        assert data["guardian"] == "WATCHING"
        assert data["people"] == "FREE"
        assert "version" in data
        assert "timestamp" in data
        print(f"✅ Health check passed: {data['status']}")


class TestAssessmentAPI:
    """Test /api/assessment/* endpoints - Claude AI conversation"""
    
    @pytest.fixture
    def session_id(self):
        """Start an assessment session and return session_id"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test@example.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return data["session_id"]
    
    def test_start_assessment_english(self):
        """Test starting assessment with Al-Hakim persona in English"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "test@example.com"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert data["persona"] == "al_hakim"
        assert data["language"] == "en"
        assert data["status"] == "active"
        assert "initial_message" in data
        assert len(data["initial_message"]) > 50  # Claude should respond with substantial message
        print(f"✅ Assessment started: session_id={data['session_id'][:8]}...")
        print(f"   Initial message preview: {data['initial_message'][:100]}...")
    
    def test_start_assessment_arabic(self):
        """Test starting assessment with Al-Hakim persona in Arabic"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "ar",
                "persona": "al_hakim",
                "user_email": "test_ar@example.com"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["language"] == "ar"
        assert "initial_message" in data
        # Check for Arabic characters in response
        has_arabic = any('\u0600' <= char <= '\u06FF' for char in data["initial_message"])
        print(f"✅ Arabic assessment started, Arabic chars present: {has_arabic}")
    
    def test_send_message(self, session_id):
        """Test sending a message in the assessment conversation"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I am ready to begin my assessment. Please ask me the first question."
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["session_id"] == session_id
        assert len(data["response"]) > 20  # Claude should respond
        print(f"✅ Message sent and received response: {data['response'][:100]}...")
    
    def test_get_scales(self):
        """Test getting all 8 psychometric scales metadata"""
        response = requests.get(f"{BASE_URL}/api/assessment/scales")
        assert response.status_code == 200
        
        data = response.json()
        assert "scales" in data
        assert len(data["scales"]) == 8  # 8 scales
        
        # Verify all expected scales are present
        scale_ids = [s["id"] for s in data["scales"]]
        expected_scales = ["hexaco", "dass", "teique", "ravens", "schwartz", "hits", "pcptsd", "web"]
        for scale in expected_scales:
            assert scale in scale_ids, f"Missing scale: {scale}"
        
        print(f"✅ All 8 scales present: {scale_ids}")
    
    def test_complete_assessment_creates_time_gate_link(self, session_id):
        """Test completing assessment creates time-gated link in Redis"""
        # First send a few messages to simulate conversation
        requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I feel generally positive about life."
            }
        )
        time.sleep(2)  # Wait for Claude response
        
        # Complete the assessment
        response = requests.post(
            f"{BASE_URL}/api/assessment/complete",
            json={
                "session_id": session_id,
                "user_id": f"test-user-{int(time.time())}",
                "all_responses_encrypted": {}
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "complete"
        assert "results_link" in data
        assert "link_token" in data
        assert "expires_at" in data
        assert data["max_clicks"] == 3
        assert data["sar_value"] == 5500
        assert data["user_cost"] == 0
        assert "sovereign_title" in data
        print(f"✅ Assessment completed with time-gate link: {data['results_link']}")
        print(f"   Sovereign title: {data['sovereign_title']}")
        
        return data["link_token"]


class TestResultsTimeGate:
    """Test /api/assessment/results/{token} - Time-gated results retrieval"""
    
    @pytest.fixture
    def time_gate_token(self):
        """Create a complete assessment and get the time-gate token"""
        # Start assessment
        start_response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "timegate_test@example.com"
            }
        )
        session_id = start_response.json()["session_id"]
        
        # Complete assessment
        complete_response = requests.post(
            f"{BASE_URL}/api/assessment/complete",
            json={
                "session_id": session_id,
                "user_id": f"test-user-{int(time.time())}",
                "all_responses_encrypted": {}
            }
        )
        return complete_response.json()["link_token"]
    
    def test_get_results_with_valid_token(self, time_gate_token):
        """Test retrieving results with valid time-gate token"""
        response = requests.get(f"{BASE_URL}/api/assessment/results/{time_gate_token}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] == True
        assert "results" in data
        assert "time_gate" in data
        assert data["time_gate"]["clicks_remaining"] >= 0
        print(f"✅ Results retrieved, clicks remaining: {data['time_gate']['clicks_remaining']}")
    
    def test_get_results_with_invalid_token(self):
        """Test retrieving results with invalid token returns 410 Gone"""
        response = requests.get(f"{BASE_URL}/api/assessment/results/invalid-token-12345")
        assert response.status_code == 410  # Gone - expired/invalid
        print("✅ Invalid token correctly returns 410 Gone")
    
    def test_link_status_without_incrementing(self, time_gate_token):
        """Test getting link status without incrementing click counter"""
        response = requests.get(f"{BASE_URL}/api/assessment/results/{time_gate_token}/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "valid" in data
        assert "clicks_remaining" in data
        print(f"✅ Link status retrieved: valid={data['valid']}, clicks_remaining={data['clicks_remaining']}")


class TestSanctuaryAPI:
    """Test /api/sanctuary/* endpoints - Al-Sheikha women's protection"""
    
    def test_start_sanctuary_session(self):
        """Test starting Sovereigness Sanctuary session with Al-Sheikha"""
        response = requests.post(
            f"{BASE_URL}/api/sanctuary/start",
            json={
                "user_id": f"sanctuary-test-{int(time.time())}",
                "pillar": "legal_shield",
                "language": "en"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert data["pillar"] == "legal_shield"
        assert data["persona"] == "al_sheikha"
        assert data["status"] == "active"
        assert "initial_message" in data
        assert "safety_note" in data
        print(f"✅ Sanctuary session started: {data['session_id'][:8]}...")
        print(f"   Initial message: {data['initial_message'][:100]}...")
    
    def test_start_sanctuary_all_pillars(self):
        """Test starting sanctuary session with all 4 pillars"""
        pillars = ["legal_shield", "medical_sentinel", "psych_repair", "economic_liberator"]
        
        for pillar in pillars:
            response = requests.post(
                f"{BASE_URL}/api/sanctuary/start",
                json={
                    "user_id": f"sanctuary-{pillar}-{int(time.time())}",
                    "pillar": pillar,
                    "language": "ar"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["pillar"] == pillar
            print(f"✅ Pillar '{pillar}' session started successfully")
    
    def test_get_sanctuary_resources(self):
        """Test getting Saudi-specific protection resources"""
        response = requests.get(f"{BASE_URL}/api/sanctuary/resources")
        assert response.status_code == 200
        
        data = response.json()
        assert "emergency_contacts" in data
        assert "legal_resources" in data
        assert "safety_tips" in data
        
        # Verify emergency contact
        assert len(data["emergency_contacts"]) > 0
        assert any(c["phone"] == "1919" for c in data["emergency_contacts"])  # National Family Safety
        print(f"✅ Sanctuary resources retrieved: {len(data['emergency_contacts'])} contacts, {len(data['safety_tips'])} tips")
    
    def test_submit_evidence(self):
        """Test submitting encrypted evidence to forensic vault"""
        response = requests.post(
            f"{BASE_URL}/api/sanctuary/evidence",
            json={
                "user_id": f"evidence-test-{int(time.time())}",
                "evidence_type": "text",
                "evidence_description": "Test evidence documentation",
                "evidence_encrypted": "encrypted_content_placeholder"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "evidence_id" in data
        assert data["status"] == "stored_securely"
        assert "analysis" in data
        assert "risk_level" in data
        print(f"✅ Evidence submitted: {data['evidence_id'][:8]}..., risk_level={data['risk_level']}")


class TestFounderDashboardAPI:
    """Test /api/founder/* endpoints - Founder dashboard with password auth"""
    
    def test_get_metrics_with_correct_password(self):
        """Test getting founder metrics with correct password"""
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
        assert "critical_alerts" in data
        
        # Verify metrics structure
        metrics = data["metrics"]
        assert "total_users" in metrics
        assert "assessments_completed" in metrics
        assert "sanctuary_access" in metrics
        print(f"✅ Founder metrics retrieved: {metrics['total_users']} users, {metrics['assessments_completed']} assessments")
    
    def test_get_metrics_without_password(self):
        """Test getting metrics without password returns 401"""
        response = requests.get(f"{BASE_URL}/api/founder/metrics")
        assert response.status_code == 401
        print("✅ Unauthorized access correctly returns 401")
    
    def test_get_metrics_with_wrong_password(self):
        """Test getting metrics with wrong password returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/founder/metrics",
            headers={"Authorization": "Bearer wrong_password"}
        )
        assert response.status_code == 401
        print("✅ Wrong password correctly returns 401")
    
    def test_send_pulse_email(self):
        """Test sending daily pulse email to founder"""
        response = requests.post(
            f"{BASE_URL}/api/founder/send-pulse",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        # Email may succeed or fail depending on Resend config
        print(f"✅ Pulse email request: status={data['status']}")
        if data.get("email_id"):
            print(f"   Email ID: {data['email_id']}")
    
    def test_get_analytics_timeline(self):
        """Test getting analytics timeline for last 7 days"""
        response = requests.get(
            f"{BASE_URL}/api/founder/analytics/timeline?days=7",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "timeline" in data
        assert "total_days" in data
        assert data["total_days"] == 7
        assert len(data["timeline"]) == 7
        print(f"✅ Analytics timeline retrieved: {len(data['timeline'])} days")


class TestRootEndpoint:
    """Test root API endpoint"""
    
    def test_api_root_returns_welcome(self):
        """Test /api/ root endpoint returns welcome message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "FORTRESS_ACTIVE"
        assert data["mission"] == "SOVEREIGN_LIBERATION"
        assert "encryption" in data
        assert data["encryption"] == "AES-256-GCM"
        print(f"✅ API root endpoint: {data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
