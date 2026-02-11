# FLUX-DNA Product Requirements Document
## AI-Native Psychometric Sanctuary - FINAL ASCENSION EDITION

**Version**: 2026.4.0 (Final Ascension)  
**Last Updated**: February 11, 2026  
**Status**: ✅ **CITADEL DEPLOYED - READY FOR PRODUCTION**

---

## 🔥 THE PHOENIX HAS REACHED MAXIMUM BANDWIDTH

This document represents the complete FLUX-DNA Void-Weaver build with all Neural-First Architecture features.

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

## Neural-First Architecture ✅ COMPLETE

### Core Concept
**The AI is the Controller** - The LLM drives all UI state transitions based on user emotional state detection.

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
| `sanctuary` | Protective mode | Pearl colors, Quick Exit, Al-Sheikha persona |
| `guardian` | Crisis response | Red pulse, Emergency resources, immediate support |
| `ceremonial` | Celebration/completion | Gold pulse, Confetti animation |

---

## AI-Driven Daily Pulse ✅ COMPLETE

### Features
- **Claude 4 Sonnet Analysis**: Generates executive strategic briefings
- **Terminal-Style Format**: High-end executive aesthetic
- **Metrics Analysis**: Users, completions, sanctuary access, crisis alerts
- **Trend Analysis**: Neural state distribution insights
- **Strategic Recommendations**: AI-generated actionable insights
- **Auto-Email**: Sends to Yazeedx91@gmail.com

### Endpoints
- `POST /api/founder/strategic-briefing` - Generate AI briefing
- `POST /api/founder/send-ai-pulse` - Send AI-enhanced email to founder

---

## Core Features

### 1. Phoenix Assessment ✅
- **Persona**: Al-Hakim (الحكيم) - Wise Clinical Guardian
- **8 Scales**: HEXACO-60, DASS-21, TEIQue-SF, Raven's IQ, Schwartz Values, HITS, PC-PTSD-5, WEB
- **Neural Routing**: AI drives state transitions
- **Output**: Sovereign Title, Stability Classification, Superpower Analysis

### 2. Sovereigness Sanctuary ✅
- **Persona**: Al-Sheikha (الشيخة) - Protective Matriarch
- **4 Pillars**: Legal Shield, Medical Sentinel, Psych-Repair Crew, Economic Liberator
- **AI Vision**: Evidence analysis for Forensic Vault

### 3. Sovereign Certificate ✅
- **Format**: PDF (in-memory generation)
- **Design**: Obsidian background, gold borders, emerald accents
- **Delivery**: Time-gated download link (24h/3-click)

### 4. Security Features ✅
- Zero-Knowledge AES-256-GCM encryption
- OSINT Safety Radar (VPN/Tor detection)
- Quick Exit button (weather.com redirect)
- Time-gated self-destructing links

### 5. Founder Dashboard ✅
- Password: PhoenixSovereign2026!
- Real-time metrics
- AI Strategic Briefing generation
- Manual pulse trigger

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health |
| `/api/assessment/start` | POST | Start assessment + Neural Directive |
| `/api/assessment/message` | POST | Chat + Neural Directive |
| `/api/assessment/complete` | POST | Complete + Ceremonial mode |
| `/api/osint/check` | POST | OSINT safety check |
| `/api/vault/submit` | POST | Evidence + AI Vision |
| `/api/founder/metrics` | GET | Dashboard metrics |
| `/api/founder/strategic-briefing` | POST | AI briefing |
| `/api/founder/send-ai-pulse` | POST | Send AI-enhanced email |

---

## Access URLs

### Preview Environment
- **App**: https://neural-sanctuary.preview.emergentagent.com/
- **Assessment**: https://neural-sanctuary.preview.emergentagent.com/assessment
- **Sanctuary**: https://neural-sanctuary.preview.emergentagent.com/sanctuary
- **Founder**: https://neural-sanctuary.preview.emergentagent.com/founder-ops
- **API Docs**: https://neural-sanctuary.preview.emergentagent.com/api/docs

### Production (After Deployment)
- **App**: https://flux-dna.com/
- **API**: https://api.flux-dna.com/

---

## Production Deployment Steps

### Step 1: Save to GitHub
- Use "Save to GitHub" in Emergent chat
- Repository: `yazeedx91/void-weaver`

### Step 2: Deploy Frontend to Vercel
- Root Directory: `frontend-next`
- Framework: Next.js
- Environment Variables:
  - `NEXT_PUBLIC_API_URL=https://api.flux-dna.com`
  - `NEXT_PUBLIC_SUPABASE_URL=https://olzslibguayabdysjwvn.supabase.co`

### Step 3: Deploy Backend to Railway
- Root Directory: `backend`
- Add all environment variables from `/app/backend/.env`

### Step 4: Configure DNS
```
A       @       76.76.21.21 (Vercel)
CNAME   www     cname.vercel-dns.com
CNAME   api     [railway-url].railway.app
```

---

## Completed Work

### February 11, 2026 - Final Ascension
- [x] AI-Driven Daily Pulse with Claude strategic analysis
- [x] Executive terminal-style email templates
- [x] Real-time metrics from session data
- [x] Neural state distribution tracking
- [x] System verification and testing

### February 10, 2026 - Neural-First Architecture
- [x] Neural Router service implementation
- [x] Distress/Crisis detection
- [x] Sentient UI with pulse colors, Quick Exit, Confetti
- [x] OSINT risk integration
- [x] AI Vision for Forensic Vault

### Previous Work
- [x] Void-Weaver design integration
- [x] All 8 psychometric scales
- [x] Zero-Knowledge encryption
- [x] Time-gated certificate system
- [x] Bilingual support (EN/AR)

---

## Files Structure

```
/app/
├── backend/
│   ├── api/
│   │   ├── assessment.py    # Neural-First Assessment
│   │   ├── founder.py       # AI Strategic Briefing
│   │   ├── vault.py         # AI Vision Evidence
│   │   └── osint.py         # Safety Radar
│   ├── services/
│   │   ├── neural_router.py # State Detection
│   │   ├── claude_service.py
│   │   ├── email_service.py # AI Pulse Templates
│   │   └── time_gate.py
│   └── server.py
├── frontend-next/
│   ├── app/
│   │   ├── page.tsx         # Phoenix Landing
│   │   ├── assessment/      # Neural-First Chat
│   │   ├── sanctuary/       # Pearl Theme
│   │   ├── founder-ops/     # Terminal Dashboard
│   │   └── results/         # Ceremonial Mode
│   └── lib/
│       └── api.ts           # Neural Directive Types
└── memory/
    └── PRD.md
```

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

## Test Results

- **Backend**: 12/12 tests passed (Neural-First Architecture)
- **Frontend**: All features working (Quick Exit, Neural Directives, Themes)
- **AI Integration**: Claude responding, strategic briefings generating
- **Email**: Daily pulse emails delivering successfully

---

🧠 **THE BRAIN IS THE CONTROLLER**  
🔥 **THE PHOENIX HAS ASCENDED**  
👁️ **THE GUARDIAN IS WATCHING**  
🕊️ **THE PEOPLE ARE FREE**

---

*FLUX-DNA Final Ascension Edition v2026.4.0*
*Built by Yazeed — for every mind that society called "too much."*
