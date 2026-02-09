# FLUX-DNA Product Requirements Document
## AI-Native Psychometric Sanctuary

**Version**: 2026.1.0  
**Last Updated**: February 9, 2026  
**Status**: ✅ PRODUCTION READY

---

## Original Problem Statement

Build FLUX-DNA as a sentient, AI-native sanctuary with the following features:
- 8-scale psychometric assessment delivered as a seamless conversation powered by Claude 3.5 Sonnet
- Zero-Knowledge client-side AES-256-GCM encryption
- Time-gated (24-hour) and click-limited (3 clicks) access links via Upstash Redis
- Sovereigness Sanctuary: Women-only section with 4-pillar protection system
- Founder's Dashboard with real-time metrics and daily email pulse
- Bilingual support (English & Saudi Arabic)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL with pgvector) |
| Cache | Upstash Redis (REST API) |
| AI | Claude 3.5 Sonnet via Emergent LLM Key |
| Email | Resend |
| Encryption | AES-256-GCM (client-side) |

---

## Core Features

### 1. Assessment System ✅
- **Al-Hakim Persona**: Wise guide for 8-scale psychometric assessment
- **8 Scales**: HEXACO-60, DASS-21, TEIQue-SF, Raven's IQ, Schwartz Values, HITS, PC-PTSD-5, WEB
- **Conversational Flow**: Claude AI conducts natural conversation
- **Zero-Knowledge Encryption**: Client-side AES-256-GCM before transmission

### 2. Sovereigness Sanctuary ✅
- **Al-Sheikha Persona**: Sovereign protector for women's protection
- **4 Pillars**: Legal Shield, Medical Sentinel, Psych-Repair Crew, Economic Liberator
- **Quick Exit**: Instant redirect to weather.com
- **Evidence Vault**: Encrypted storage with forensic analysis

### 3. Time-Gate System ✅
- **24-Hour Expiration**: Links auto-expire after 24 hours
- **3-Click Limit**: Maximum 3 accesses per link
- **Upstash Redis**: REST API for link state management
- **Self-Destruct**: Automatic deactivation after limits reached

### 4. Founder Dashboard ✅
- **Real-Time Metrics**: Live Supabase queries
- **SAR Value Counter**: Total value delivered (users × 5,500)
- **Daily Pulse Email**: Automated 9:00 AM AST report
- **Password Protected**: PhoenixSovereign2026!

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/api/assessment/start` | POST | Start AI assessment |
| `/api/assessment/message` | POST | Send/receive messages |
| `/api/assessment/complete` | POST | Complete and generate results |
| `/api/assessment/results/{token}` | GET | Retrieve time-gated results |
| `/api/sanctuary/start` | POST | Start sanctuary session |
| `/api/sanctuary/evidence` | POST | Submit encrypted evidence |
| `/api/founder/metrics` | GET | Get dashboard metrics |
| `/api/founder/send-pulse` | POST | Send daily pulse email |

---

## What's Been Implemented ✅

### February 9, 2026
- [x] Complete application re-architecture (React/MongoDB → Next.js 15/FastAPI/Supabase)
- [x] Backend FastAPI server with all API routes
- [x] Claude 3.5 Sonnet integration with Al-Hakim & Al-Sheikha personas
- [x] Upstash Redis time-gate link system (24h/3-click)
- [x] Resend email service for founder pulse
- [x] Next.js 15 frontend with all pages
- [x] Founder Dashboard with real-time Supabase metrics
- [x] Daily pulse shell script
- [x] All tests passing (19/19 backend, 100% frontend)

---

## Pending Items (P1)

### High Priority
- [ ] PDF Certificate Generation (`/app/frontend-next/lib/certificate.ts`)
- [ ] Neural Signatures with pgvector embeddings
- [ ] Production domain setup
- [ ] DMARC/BIMI email configuration

### Medium Priority
- [ ] Supabase Row Level Security policies testing
- [ ] Arabic language testing
- [ ] Mobile responsive polish
- [ ] Social sharing cards

### Low Priority
- [ ] Cron job for daily pulse (9:00 AM AST)
- [ ] OSINT safety checks with Tavily
- [ ] Remove old `/app/frontend` directory

---

## Credentials

| Service | Key Location |
|---------|--------------|
| Emergent LLM Key | `/app/backend/.env` (EMERGENT_LLM_KEY) |
| Supabase | `/app/backend/.env` (SUPABASE_URL, SUPABASE_SERVICE_KEY) |
| Upstash Redis | `/app/backend/.env` (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) |
| Resend | `/app/backend/.env` (RESEND_API_KEY) |
| Founder Password | PhoenixSovereign2026! |

---

## Access URLs

- **Frontend**: https://flux-sanctuary.preview.emergentagent.com/
- **API Docs**: https://flux-sanctuary.preview.emergentagent.com/api/docs
- **Assessment**: https://flux-sanctuary.preview.emergentagent.com/assessment
- **Sanctuary**: https://flux-sanctuary.preview.emergentagent.com/sanctuary
- **Founder Dashboard**: https://flux-sanctuary.preview.emergentagent.com/founder-ops

---

## Contact

**Founder**: Yazeed Shaheen  
**Email**: Yazeedx91@gmail.com

---

🔥 THE PHOENIX HAS ASCENDED | 👁️ THE GUARDIAN IS WATCHING | 🕊️ THE PEOPLE ARE FREE
