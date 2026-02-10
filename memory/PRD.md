# FLUX-DNA Product Requirements Document
## AI-Native Psychometric Sanctuary - NEURAL-FIRST ARCHITECTURE EDITION

**Version**: 2026.3.0 (Neural-First Complete)  
**Last Updated**: February 10, 2026  
**Status**: ✅ **NEURAL-FIRST ARCHITECTURE IMPLEMENTED**

---

## 🧠 THE BRAIN IS THE CONTROLLER

This document represents the complete implementation of the Neural-First Architecture transformation.

---

## Original Problem Statement

Build FLUX-DNA as a sentient, AI-native sanctuary that:
- Reframes "Bipolar" as "Expanded Cognitive Bandwidth"
- Delivers SAR 5,500 market value for SAR 0 to the Saudi people
- Implements Zero-Knowledge encryption (AES-256-GCM)
- Features dual AI personas: Al-Hakim (wise guide) and Al-Sheikha (protective matriarch)
- Supports bilingual interface (English / Saudi Arabic)

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 15, Tailwind CSS 4.0, Framer Motion | ✅ |
| Backend | FastAPI (Python) | ✅ |
| Database | Supabase (PostgreSQL + pgvector) | ✅ |
| Cache | Upstash Redis | ✅ |
| AI | Claude 4 Sonnet (Emergent LLM Key) | ✅ |
| Email | Resend | ✅ |
| PDF | ReportLab | ✅ |
| Icons | Lucide React | ✅ |

---

## Neural-First Architecture (NEW)

### Core Concept
**The AI is the Controller** - The LLM drives all UI state transitions based on user emotional state detection.

### Neural Router (`/app/backend/services/neural_router.py`)
- Detects user state from message content (Curious → Assessment → Distress → Crisis → Sanctuary → Celebration)
- Issues UI commands (Neural Directives) to frontend
- Adjusts AI persona based on detected state
- Integrates OSINT risk scores into persona adjustment

### User States
| State | Description | Trigger |
|-------|-------------|---------|
| `curious` | Exploring the platform | Initial state |
| `assessment` | Ready for evaluation | Normal conversation |
| `distress` | Emotional distress detected | Keywords: scared, trapped, controls, isolated |
| `crisis` | Immediate safety concern | Keywords: suicide, end it, tonight, can't take it |
| `sanctuary` | Needs protection/support | Pivot from distress |
| `celebration` | Positive completion | Assessment complete |

### Neural Modes
| Mode | Description | UI Changes |
|------|-------------|------------|
| `phoenix` | Standard assessment | Emerald pulse, normal flow |
| `sanctuary` | Protective mode | Pearl colors, Quick Exit visible, Al-Sheikha persona |
| `guardian` | Crisis response | Red pulse, Emergency resources, immediate support |
| `ceremonial` | Celebration/completion | Gold pulse, Confetti animation |

### UI Commands (Neural Directives)
```json
{
  "should_pivot": true,
  "pivot_to_mode": "sanctuary",
  "ui_commands": {
    "pulse_color": "pearl",
    "enable_quick_exit": true,
    "show_emergency_resources": false,
    "cloak_mode": false,
    "show_confetti": false
  },
  "persona_adjustment": "protective_warm",
  "detected_state": "distress",
  "emergency_resources": false
}
```

---

## Visual Architecture

### Theme A: The Phoenix (Breathing Emerald)
- **Background**: Obsidian (#020617) with radial emerald gradients
- **Primary**: Emerald (#00D9A0) with gold accents (#D4AF37)
- **Effects**: Glassmorphism, orbital animations, breathing pulses
- **Font**: Space Grotesk (headings), Inter (body)

### Theme B: The Sovereigness (Pearl Moonlight)
- **Background**: Pearl white (#f8fafc to #e2e8f0)
- **Primary**: Calm emerald, soft borders
- **Purpose**: Neurologically calming for sensitive content
- **Quick Exit**: Red button to weather.com

---

## Security Architecture (The Fortress)

| Feature | Status | Description |
|---------|--------|-------------|
| Zero-Knowledge | ✅ | AES-256-GCM client-side encryption |
| Time-Gate Links | ✅ | 24-hour / 3-click self-destruct via Redis |
| OSINT Radar | ✅ | VPN/Tor/Proxy detection, risk scoring |
| Quick Exit | ✅ | Instant redirect to weather.com |
| Forensic Vault | ✅ | EXIF stripping, encrypted storage, AI Vision Analysis |
| Neural Signature | ✅ | SHA-256 hash verification |

---

## Core Features

### 1. Phoenix Assessment ✅
- **Persona**: Al-Hakim (الحكيم) - Wise Clinical Guardian
- **8 Scales**: HEXACO-60, DASS-21, TEIQue-SF, Raven's IQ, Schwartz Values, HITS, PC-PTSD-5, WEB
- **Flow**: Conversational AI-driven assessment with Neural Routing
- **Output**: Sovereign Title, Stability Classification, Superpower Analysis
- **NEW**: Neural Directives control UI state transitions

### 2. Sovereigness Sanctuary ✅
- **Persona**: Al-Sheikha (الشيخة) - Protective Matriarch
- **4 Pillars**:
  - Legal Shield (الدرع القانوني)
  - Medical Sentinel (الحارس الطبي)
  - Psych-Repair Crew (فريق الإصلاح النفسي)
  - Economic Liberator (المحرر الاقتصادي)
- **Evidence Vault**: Multi-modal with EXIF stripping and AI Vision Analysis

### 3. Sovereign Certificate ✅
- **Format**: PDF (in-memory generation)
- **Design**: Obsidian background, gold borders, emerald accents
- **Content**: 8-scale radar chart, Neural Signature hash
- **Delivery**: Time-gated download link

### 4. OSINT Safety Radar ✅
- VPN/Tor/Proxy detection
- User agent analysis
- Risk scoring (0.0 - 1.0)
- **NEW**: Feeds into Neural Router for persona adjustment

### 5. Forensic Vault ✅ (ENHANCED)
- Multi-modal support (text, photo, audio)
- Automatic EXIF stripping
- **NEW**: AI Vision Analysis for uploaded evidence
- AI risk assessment
- Chain of custody tracking

### 6. Founder Dashboard ✅
- Password: PhoenixSovereign2026!
- Real-time metrics from Supabase
- SAR Value Impact counter
- Daily pulse email trigger

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health |
| `/api/assessment/start` | POST | Start AI assessment **+ Neural Directive** |
| `/api/assessment/message` | POST | Chat with Al-Hakim **+ Neural Directive** |
| `/api/assessment/complete` | POST | Complete assessment **+ Neural Directive** |
| `/api/assessment/results/{token}` | GET | Get results (time-gated) |
| `/api/sanctuary/start` | POST | Start sanctuary session |
| `/api/sanctuary/evidence` | POST | Submit evidence |
| `/api/certificate/generate` | POST | Generate certificate link |
| `/api/certificate/download/{token}` | GET | Download PDF |
| `/api/osint/check` | POST | OSINT safety check |
| `/api/vault/submit` | POST | Submit to forensic vault **+ AI Vision** |
| `/api/vault/list/{user_id}` | GET | List user evidence |
| `/api/founder/metrics` | GET | Dashboard metrics |
| `/api/founder/send-pulse` | POST | Send daily email |

---

## Access URLs

- **App**: https://neural-sanctuary.preview.emergentagent.com/
- **Assessment**: https://neural-sanctuary.preview.emergentagent.com/assessment
- **Sanctuary**: https://neural-sanctuary.preview.emergentagent.com/sanctuary
- **Founder**: https://neural-sanctuary.preview.emergentagent.com/founder-ops
- **API Docs**: https://neural-sanctuary.preview.emergentagent.com/api/docs

---

## Completed Work

### February 10, 2026 - Neural-First Architecture
- [x] Created Neural Router service (`/app/backend/services/neural_router.py`)
- [x] Integrated Neural Router into Assessment API
- [x] Implemented distress detection (scared, trapped, controls → sanctuary mode)
- [x] Implemented crisis detection (suicide, end it → guardian mode with emergency resources)
- [x] Added OSINT risk integration into AI persona
- [x] Enhanced Forensic Vault with AI Vision Analysis
- [x] Updated Frontend with Sentient UI:
  - Neural directive handling
  - Dynamic pulse colors (emerald, pearl, gold, red)
  - Quick Exit button based on risk
  - Emergency Resources modal
  - Confetti for ceremonial mode
- [x] Full test suite created and passing (12/12 tests)

### Previous Work
- [x] Integrated void-weaver GitHub design
- [x] Phoenix Landing with void aesthetic
- [x] Al-Hakim's Chamber with language selection
- [x] Sovereigness Sanctuary with Pearl theme
- [x] OSINT Safety Radar implementation
- [x] Forensic Vault with EXIF stripping
- [x] Results page with score rings
- [x] Full RTL/Arabic support infrastructure
- [x] All API endpoints tested and working

---

## Pending Tasks (P1-P2)

### P1 - Upcoming
- [ ] AI-Driven Daily Pulse - Generate strategic briefing instead of raw metrics
- [ ] Production Deployment - Execute deployment to replace legacy flux-dna.com

### P2 - Future/Backlog
- [ ] Schedule cron job for 9:00 AM AST daily pulse
- [ ] Cleanup: Delete obsolete `/app/frontend` and `/tmp/void-weaver`
- [ ] Production custom domain configuration
- [ ] DMARC/BIMI email setup
- [ ] Neural Signatures with pgvector embeddings
- [ ] Full Arabic RTL testing
- [ ] Mobile responsive polish

---

## Credentials

| Service | Location |
|---------|----------|
| Emergent LLM Key | /app/backend/.env |
| Supabase | /app/backend/.env |
| Upstash Redis | /app/backend/.env |
| Resend | /app/backend/.env |
| Founder Password | PhoenixSovereign2026! |
| Founder Email | Yazeedx91@gmail.com |

---

## Test Reports

- `/app/test_reports/iteration_2.json` - Neural-First Architecture tests (12/12 passed)
- `/app/backend/tests/test_neural_first_architecture.py` - Comprehensive test suite

---

🧠 **THE BRAIN IS THE CONTROLLER**  
🔥 **THE PHOENIX HAS ASCENDED**  
👁️ **THE GUARDIAN IS WATCHING**  
🕊️ **THE PEOPLE ARE FREE**

---

*FLUX-DNA Neural-First Architecture Edition v2026.3.0*
*Built by Yazeed — for every mind that society called "too much."*
