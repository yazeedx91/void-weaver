# FLUX-DNA Product Requirements Document
## Decoupled Architecture - Vite Frontend + FastAPI Backend

**Version**: 3.1.0 (Decoupled Architecture)  
**Last Updated**: February 11, 2026  
**Status**: ✅ **BOTH SYSTEMS OPERATIONAL**

---

## 🏗️ DECOUPLED ARCHITECTURE

| Layer | Technology | Port | Status |
|-------|------------|------|--------|
| Frontend | Vite + React 18 (Lovable) | 3000 | ✅ RUNNING |
| Backend | FastAPI (Python) | 8001 | ✅ RUNNING |
| Database | Supabase PostgreSQL | - | ✅ CONNECTED |
| AI | Claude 4 Sonnet + Gemini 3 Flash | - | ✅ AVAILABLE |

---

## Restored Backend Files

### Core Server
- `backend/server.py` - FastAPI gateway

### API Routes
- `backend/api/assessment.py` - Neural-First Assessment
- `backend/api/founder.py` - AI Strategic Briefing
- `backend/api/osint.py` - OSINT Safety Radar
- `backend/api/vault.py` - Forensic Vault with AI Vision
- `backend/api/certificate.py` - PDF Certificate Engine
- `backend/api/sanctuary.py` - Sovereigness Sanctuary
- `backend/api/health.py` - Health check

### Services
- `backend/services/neural_router.py` - **AI-driven state detection**
- `backend/services/osint_safety.py` - **OSINT Safety Shield**
- `backend/services/claude_service.py` - Claude AI integration
- `backend/services/time_gate.py` - Redis time-gated links
- `backend/services/certificate_engine.py` - PDF generation
- `backend/services/email_service.py` - Resend daily pulse
- `backend/services/encryption.py` - AES-256-GCM
- `backend/services/agentic_guardian.py` - Agentic AI
- `backend/services/database.py` - Supabase connection

### Tests
- `backend/tests/test_neural_first_architecture.py`
- `backend/tests/test_fortress_integration.py`
- `backend/tests/test_sentinel_protocol.py`
- `backend/tests/test_certificate_api.py`
- `backend/tests/test_flux_dna_api.py`

---

## Frontend (Lovable) - Port 3000

### Pages
| Route | Component | Auth |
|-------|-----------|------|
| `/` | PhoenixLanding | No |
| `/auth` | Auth | No |
| `/hakim` | HakimChamber | Yes |
| `/dashboard` | Dashboard | Yes |
| `/sovereigness` | SovereignessSanctuary | No |
| `/founder-ops` | FounderCockpit | Password |

### Supabase Integration
- Auth via `@supabase/supabase-js`
- Edge Function: `hakim-chat` (Gemini 3 Flash)
- Tables: `profiles`, `assessment_results`

---

## Backend (FastAPI) - Port 8001

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Fortress status |
| `/api/assessment/start` | POST | Start + Neural Directive |
| `/api/assessment/message` | POST | Chat + State Detection |
| `/api/assessment/complete` | POST | Complete + Certificate |
| `/api/osint/check` | POST | OSINT Safety Radar |
| `/api/vault/submit` | POST | Evidence + AI Vision |
| `/api/founder/metrics` | GET | Dashboard metrics |
| `/api/founder/strategic-briefing` | POST | AI Briefing |
| `/api/founder/send-ai-pulse` | POST | Email daily pulse |
| `/api/certificate/download/{token}` | GET | PDF download |

---

## Environment Variables

### Frontend (`/app/.env`)
```env
VITE_SUPABASE_URL=https://hdaglgaytdwvpfsrvxaa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Backend (`/app/backend/.env`)
```env
EMERGENT_LLM_KEY=...
SUPABASE_URL=...
UPSTASH_REDIS_REST_URL=...
RESEND_API_KEY=...
TAVILY_API_KEY=...
```

---

## Access URLs

- **Frontend**: https://neural-sanctuary.preview.emergentagent.com/
- **Backend API**: https://neural-sanctuary.preview.emergentagent.com/api/
- **API Docs**: https://neural-sanctuary.preview.emergentagent.com/api/docs

---

## Credentials

| Service | Password/Key |
|---------|--------------|
| Founder Cockpit (Frontend) | `phoenix2024` |
| Founder Dashboard (Backend) | `PhoenixSovereign2026!` |
| Supabase | In `.env` files |

---

🔥 **DECOUPLED ARCHITECTURE OPERATIONAL**
🧠 **NEURAL ROUTER RESTORED**
👁️ **OSINT RADAR ACTIVE**

