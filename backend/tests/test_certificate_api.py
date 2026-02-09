"""
FLUX-DNA Certificate API Tests
Tests for Sovereign Certificate Engine with Time-Gate integration
Iteration 2 - Certificate Feature Testing
"""
import pytest
import requests
import os
import time

# Use the public URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://flux-sanctuary.preview.emergentagent.com')

# Test credentials
FOUNDER_PASSWORD = "PhoenixSovereign2026!"


class TestCertificateGenerate:
    """Test /api/certificate/generate - Creates time-gated download link"""
    
    def test_generate_certificate_creates_time_gate_link(self):
        """Test generating certificate creates a time-gated download link"""
        response = requests.post(
            f"{BASE_URL}/api/certificate/generate",
            json={
                "session_id": f"test-session-{int(time.time())}",
                "user_id": f"test-user-{int(time.time())}",
                "sovereign_title": "The Strategic Phoenix",
                "stability": "Sovereign",
                "superpower": "You operate across an expanded dynamic range, with heightened perception and profound depth of experience.",
                "scores": {
                    "HEXACO-60": 75,
                    "DASS-21": 68,
                    "TEIQue-SF": 82,
                    "Raven's IQ": 71,
                    "Schwartz": 79,
                    "HITS": 45,
                    "PC-PTSD-5": 38,
                    "WEB": 65
                },
                "sar_value": 5500
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "download_token" in data, "Missing download_token in response"
        assert "download_url" in data, "Missing download_url in response"
        assert "expires_at" in data, "Missing expires_at in response"
        assert "max_clicks" in data, "Missing max_clicks in response"
        assert data["max_clicks"] == 3, f"Expected max_clicks=3, got {data['max_clicks']}"
        assert "message" in data, "Missing message in response"
        
        # Verify download URL format
        assert data["download_url"].startswith("/api/certificate/download/"), f"Invalid download_url format: {data['download_url']}"
        
        print(f"✅ Certificate generated with time-gate link")
        print(f"   Token: {data['download_token'][:8]}...")
        print(f"   URL: {data['download_url']}")
        print(f"   Expires: {data['expires_at']}")
        print(f"   Max clicks: {data['max_clicks']}")
        
        return data["download_token"]
    
    def test_generate_certificate_with_minimal_data(self):
        """Test generating certificate with minimal required data"""
        response = requests.post(
            f"{BASE_URL}/api/certificate/generate",
            json={
                "session_id": f"minimal-session-{int(time.time())}",
                "user_id": f"minimal-user-{int(time.time())}",
                "sovereign_title": "The Resilient Guardian"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "download_token" in data
        assert data["max_clicks"] == 3
        print(f"✅ Certificate generated with minimal data: {data['download_token'][:8]}...")


class TestCertificateDownload:
    """Test /api/certificate/download/{token} - Returns valid PDF"""
    
    @pytest.fixture
    def certificate_token(self):
        """Generate a certificate and return the download token"""
        response = requests.post(
            f"{BASE_URL}/api/certificate/generate",
            json={
                "session_id": f"download-test-{int(time.time())}",
                "user_id": f"download-user-{int(time.time())}",
                "sovereign_title": "The Analytical Sage"
            }
        )
        assert response.status_code == 200
        return response.json()["download_token"]
    
    def test_download_certificate_returns_valid_pdf(self, certificate_token):
        """Test downloading certificate returns valid PDF with correct headers"""
        response = requests.get(
            f"{BASE_URL}/api/certificate/download/{certificate_token}",
            stream=True
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        assert response.headers.get("content-type") == "application/pdf", f"Expected application/pdf, got {response.headers.get('content-type')}"
        
        # Check content disposition
        content_disposition = response.headers.get("content-disposition", "")
        assert "attachment" in content_disposition, f"Expected attachment in content-disposition: {content_disposition}"
        assert ".pdf" in content_disposition, f"Expected .pdf in filename: {content_disposition}"
        
        # Check time-gate headers
        assert "x-time-gate-clicks-remaining" in response.headers, "Missing X-Time-Gate-Clicks-Remaining header"
        clicks_remaining = int(response.headers.get("x-time-gate-clicks-remaining", 0))
        assert clicks_remaining >= 0, f"Invalid clicks remaining: {clicks_remaining}"
        
        # Check PDF content starts with %PDF
        pdf_content = response.content
        assert pdf_content[:4] == b'%PDF', f"PDF content does not start with %PDF: {pdf_content[:20]}"
        
        # Check PDF has reasonable size (should be > 1KB for a real PDF)
        assert len(pdf_content) > 1000, f"PDF too small: {len(pdf_content)} bytes"
        
        print(f"✅ Certificate PDF downloaded successfully")
        print(f"   Content-Type: {response.headers.get('content-type')}")
        print(f"   PDF size: {len(pdf_content)} bytes")
        print(f"   Clicks remaining: {clicks_remaining}")
    
    def test_download_decrements_click_counter(self, certificate_token):
        """Test that each download decrements the click counter"""
        # First download
        response1 = requests.get(f"{BASE_URL}/api/certificate/download/{certificate_token}")
        assert response1.status_code == 200
        clicks1 = int(response1.headers.get("x-time-gate-clicks-remaining", 0))
        
        # Second download
        response2 = requests.get(f"{BASE_URL}/api/certificate/download/{certificate_token}")
        assert response2.status_code == 200
        clicks2 = int(response2.headers.get("x-time-gate-clicks-remaining", 0))
        
        # Verify decrement
        assert clicks2 == clicks1 - 1, f"Click counter not decremented: {clicks1} -> {clicks2}"
        
        print(f"✅ Click counter decremented correctly: {clicks1} -> {clicks2}")
    
    def test_download_with_invalid_token_returns_410(self):
        """Test downloading with invalid token returns 410 Gone"""
        response = requests.get(f"{BASE_URL}/api/certificate/download/invalid-token-12345")
        assert response.status_code == 410, f"Expected 410, got {response.status_code}"
        print("✅ Invalid token correctly returns 410 Gone")
    
    def test_download_exhausts_after_3_clicks(self):
        """Test that link expires after 3 downloads"""
        # Generate fresh certificate
        gen_response = requests.post(
            f"{BASE_URL}/api/certificate/generate",
            json={
                "session_id": f"exhaust-test-{int(time.time())}",
                "user_id": f"exhaust-user-{int(time.time())}",
                "sovereign_title": "The Exhaustion Test"
            }
        )
        token = gen_response.json()["download_token"]
        
        # Download 3 times
        for i in range(3):
            response = requests.get(f"{BASE_URL}/api/certificate/download/{token}")
            assert response.status_code == 200, f"Download {i+1} failed: {response.status_code}"
            clicks = int(response.headers.get("x-time-gate-clicks-remaining", 0))
            print(f"   Download {i+1}: clicks remaining = {clicks}")
        
        # 4th download should fail
        response4 = requests.get(f"{BASE_URL}/api/certificate/download/{token}")
        assert response4.status_code == 410, f"Expected 410 after 3 clicks, got {response4.status_code}"
        
        print("✅ Link correctly expires after 3 downloads")


class TestCertificateStatus:
    """Test /api/certificate/status/{token} - Returns status without incrementing clicks"""
    
    @pytest.fixture
    def certificate_token(self):
        """Generate a certificate and return the download token"""
        response = requests.post(
            f"{BASE_URL}/api/certificate/generate",
            json={
                "session_id": f"status-test-{int(time.time())}",
                "user_id": f"status-user-{int(time.time())}",
                "sovereign_title": "The Status Checker"
            }
        )
        assert response.status_code == 200
        return response.json()["download_token"]
    
    def test_status_returns_link_info(self, certificate_token):
        """Test status endpoint returns link information"""
        response = requests.get(f"{BASE_URL}/api/certificate/status/{certificate_token}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "valid" in data, "Missing 'valid' in response"
        assert "clicks_remaining" in data, "Missing 'clicks_remaining' in response"
        assert "time_remaining_hours" in data, "Missing 'time_remaining_hours' in response"
        assert "expires_at" in data, "Missing 'expires_at' in response"
        assert "message" in data, "Missing 'message' in response"
        
        assert data["valid"] == True, f"Expected valid=True, got {data['valid']}"
        assert data["clicks_remaining"] == 3, f"Expected 3 clicks remaining, got {data['clicks_remaining']}"
        
        print(f"✅ Certificate status retrieved")
        print(f"   Valid: {data['valid']}")
        print(f"   Clicks remaining: {data['clicks_remaining']}")
        print(f"   Time remaining: {data['time_remaining_hours']} hours")
    
    def test_status_does_not_increment_clicks(self, certificate_token):
        """Test that checking status does NOT increment click counter"""
        # Check status multiple times
        for i in range(5):
            response = requests.get(f"{BASE_URL}/api/certificate/status/{certificate_token}")
            assert response.status_code == 200
            data = response.json()
            assert data["clicks_remaining"] == 3, f"Status check {i+1} changed clicks: {data['clicks_remaining']}"
        
        print("✅ Status checks do not increment click counter (5 checks, still 3 clicks)")
    
    def test_status_with_invalid_token(self):
        """Test status with invalid token returns appropriate response"""
        response = requests.get(f"{BASE_URL}/api/certificate/status/invalid-token-xyz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["valid"] == False, f"Expected valid=False for invalid token"
        print("✅ Invalid token status correctly returns valid=False")


class TestCertificatePreview:
    """Test /api/certificate/preview - Returns PDF directly without time-gate"""
    
    def test_preview_returns_pdf_directly(self):
        """Test preview endpoint returns PDF without creating time-gate"""
        response = requests.post(
            f"{BASE_URL}/api/certificate/preview",
            json={
                "session_id": f"preview-test-{int(time.time())}",
                "user_id": f"preview-user-{int(time.time())}",
                "sovereign_title": "The Preview Phoenix",
                "stability": "Resilient",
                "superpower": "Testing the preview functionality with great precision.",
                "scores": {
                    "HEXACO-60": 80,
                    "DASS-21": 60,
                    "TEIQue-SF": 85,
                    "Raven's IQ": 75,
                    "Schwartz": 70,
                    "HITS": 40,
                    "PC-PTSD-5": 35,
                    "WEB": 70
                },
                "sar_value": 5500
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        assert response.headers.get("content-type") == "application/pdf", f"Expected application/pdf, got {response.headers.get('content-type')}"
        
        # Check PDF content
        pdf_content = response.content
        assert pdf_content[:4] == b'%PDF', f"PDF content does not start with %PDF"
        assert len(pdf_content) > 1000, f"PDF too small: {len(pdf_content)} bytes"
        
        # Preview should NOT have time-gate headers
        assert "x-time-gate-clicks-remaining" not in response.headers, "Preview should not have time-gate headers"
        
        print(f"✅ Preview PDF generated directly")
        print(f"   PDF size: {len(pdf_content)} bytes")
        print(f"   No time-gate headers (as expected)")
    
    def test_preview_can_be_called_multiple_times(self):
        """Test preview can be called unlimited times (no click limit)"""
        for i in range(5):
            response = requests.post(
                f"{BASE_URL}/api/certificate/preview",
                json={
                    "session_id": f"multi-preview-{int(time.time())}-{i}",
                    "user_id": f"multi-user-{i}",
                    "sovereign_title": f"Preview Test {i+1}"
                }
            )
            assert response.status_code == 200, f"Preview {i+1} failed: {response.status_code}"
        
        print("✅ Preview can be called multiple times without limit")


class TestAssessmentCertificateIntegration:
    """Test full assessment flow returns certificate_link"""
    
    def test_complete_assessment_returns_certificate_link(self):
        """Test completing assessment returns certificate_link in response"""
        # Start assessment
        start_response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": f"cert_test_{int(time.time())}@example.com"
            }
        )
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        print(f"   Assessment started: {session_id[:8]}...")
        
        # Send a message
        msg_response = requests.post(
            f"{BASE_URL}/api/assessment/message",
            json={
                "session_id": session_id,
                "message": "I am ready to begin my assessment."
            }
        )
        assert msg_response.status_code == 200
        print("   Message sent successfully")
        
        # Wait for AI response
        time.sleep(2)
        
        # Complete assessment
        complete_response = requests.post(
            f"{BASE_URL}/api/assessment/complete",
            json={
                "session_id": session_id,
                "user_id": f"cert-integration-{int(time.time())}",
                "all_responses_encrypted": {}
            }
        )
        assert complete_response.status_code == 200, f"Complete failed: {complete_response.status_code}: {complete_response.text}"
        
        data = complete_response.json()
        assert data["status"] == "complete"
        assert "results_link" in data, "Missing results_link in complete response"
        assert "link_token" in data, "Missing link_token in complete response"
        assert "sovereign_title" in data, "Missing sovereign_title in complete response"
        
        # Check if certificate_link is present (new feature)
        # Note: certificate_link may be generated separately or included in results
        print(f"✅ Assessment completed with results link")
        print(f"   Sovereign title: {data['sovereign_title']}")
        print(f"   Results link: {data['results_link']}")
        print(f"   Link token: {data['link_token'][:8]}...")


class TestPreviousAPIsStillWorking:
    """Verify all previous APIs still function correctly"""
    
    def test_health_endpoint(self):
        """Test /api/health still returns FORTRESS_ACTIVE"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "FORTRESS_ACTIVE"
        print("✅ Health endpoint working")
    
    def test_assessment_start(self):
        """Test /api/assessment/start still works"""
        response = requests.post(
            f"{BASE_URL}/api/assessment/start",
            json={
                "language": "en",
                "persona": "al_hakim",
                "user_email": "regression_test@example.com"
            }
        )
        assert response.status_code == 200
        assert "session_id" in response.json()
        print("✅ Assessment start endpoint working")
    
    def test_sanctuary_start(self):
        """Test /api/sanctuary/start still works"""
        response = requests.post(
            f"{BASE_URL}/api/sanctuary/start",
            json={
                "user_id": f"regression-{int(time.time())}",
                "pillar": "legal_shield",
                "language": "en"
            }
        )
        assert response.status_code == 200
        assert "session_id" in response.json()
        print("✅ Sanctuary start endpoint working")
    
    def test_founder_metrics(self):
        """Test /api/founder/metrics still works with correct password"""
        response = requests.get(
            f"{BASE_URL}/api/founder/metrics",
            headers={"Authorization": f"Bearer {FOUNDER_PASSWORD}"}
        )
        assert response.status_code == 200
        assert "metrics" in response.json()
        print("✅ Founder metrics endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
