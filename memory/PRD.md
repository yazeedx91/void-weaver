# FLUX-DNA Product Requirements Document
## AI-Native Psychometric Sanctuary

**Version**: 2026.1.1  
**Last Updated**: February 10, 2026  
**Status**: ✅ PRODUCTION READY - DESIGN INTEGRATED

---

## Original Problem Statement

Build FLUX-DNA as a sentient, AI-native sanctuary with the following features:
- 8-scale psychometric assessment delivered as a seamless conversation powered by Claude 3.5 Sonnet
- Zero-Knowledge client-side AES-256-GCM encryption
- Time-gated (24-hour) and click-limited (3 clicks) access links via Upstash Redis
- Sovereigness Sanctuary: Women-only section with 4-pillar protection system
- Founder's Dashboard with real-time metrics and daily email pulse
- Bilingual support (English & Saudi Arabic)
- **NEW**: Sovereign Certificate Engine with PDF generation

---

## Design Integration Completed ✅

Successfully integrated the `void-weaver` GitHub repository design:
- **Deep Void Theme**: Breathing emerald with gold glow effects
- **Phoenix Landing**: "From Bipolar to Expanded Bandwidth" messaging
- **Al-Hakim's Chamber**: Language selection with Zero-Knowledge badge
- **Sovereigness Sanctuary**: Pearl Moonlight theme with 4-pillar selection
- **Quick Exit**: Red emergency button on Sanctuary page

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), Tailwind CSS 4.0, Framer Motion |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL with pgvector) |
| Cache | Upstash Redis (REST API) |
| AI | Claude 3.5 Sonnet via Emergent LLM Key |
| Email | Resend |
| PDF | ReportLab (in-memory generation) |
| Encryption | AES-256-GCM (client-side) |

---

## Core Features

### 1. Assessment System ✅
- **Al-Hakim Persona**: Wise guide for 8-scale psychometric assessment
- **Bilingual**: English and Arabic language selection
- **Zero-Knowledge**: Client-side AES-256-GCM encryption badge
- **Claude AI**: Conversational assessment flow

### 2. Sovereigness Sanctuary ✅
- **Al-Sheikha Persona**: Sovereign protector for women
- **4 Pillars**: Legal Shield, Medical Sentinel, Psych-Repair, Economic Liberator
- **Quick Exit**: Instant redirect to weather.com
- **Pearl Moonlight Theme**: Calm, safe visual design

### 3. Sovereign Certificate Engine ✅ (NEW)
- **In-Memory PDF**: ReportLab generation without disk writes
- **Breathing Emerald Design**: Obsidian background, gold borders, emerald accents
- **8-Scale Radar Chart**: Visual representation of assessment results
- **Neural Signature**: SHA-256 hash for verification
- **Time-Gate Integration**: 24h/3-click self-destruct links

### 4. Time-Gate System ✅
- **24-Hour Expiration**: Links auto-expire
- **3-Click Limit**: Maximum 3 accesses per link
- **Upstash Redis**: State management

### 5. Founder Dashboard ✅
- **Real-Time Metrics**: Live Supabase queries
- **Daily Pulse Email**: Automated reports

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/api/assessment/start` | POST | Start AI assessment |
| `/api/assessment/message` | POST | Send/receive messages |
| `/api/assessment/complete` | POST | Complete and generate results |
| `/api/assessment/results/{token}` | GET | Retrieve time-gated results |
| `/api/certificate/generate` | POST | Generate certificate link |
| `/api/certificate/download/{token}` | GET | Download PDF |
| `/api/certificate/preview` | POST | Preview PDF (no time-gate) |
| `/api/sanctuary/start` | POST | Start sanctuary session |
| `/api/founder/metrics` | GET | Get dashboard metrics |
| `/api/founder/send-pulse` | POST | Send daily pulse email |

---

## What's Been Implemented ✅

### February 10, 2026
- [x] Integrated void-weaver design from GitHub
- [x] New Phoenix Landing page with void aesthetic
- [x] Al-Hakim's Chamber with language selection
- [x] Sovereigness Sanctuary with Pearl Moonlight theme
- [x] Quick Exit button functionality
- [x] Tailwind CSS 4.0 theme configuration
- [x] Lucide React icons integration

### February 9, 2026
- [x] Sovereign Certificate Engine (PDF generation)
- [x] Complete application re-architecture
- [x] Backend FastAPI server with all API routes
- [x] Claude 3.5 Sonnet integration
- [x] Upstash Redis time-gate system
- [x] Resend email service
- [x] Next.js 15 frontend

---

## Access URLs

- **App**: https://flux-sanctuary.preview.emergentagent.com/
- **Assessment**: https://flux-sanctuary.preview.emergentagent.com/assessment
- **Sanctuary**: https://flux-sanctuary.preview.emergentagent.com/sanctuary
- **Founder Dashboard**: https://flux-sanctuary.preview.emergentagent.com/founder-ops

---

## Credentials

- **Founder Password**: PhoenixSovereign2026!
- **Founder Email**: Yazeedx91@gmail.com

---

## Pending Items

### High Priority (P0)
- [ ] Results page visual design update
- [ ] Mobile responsive testing

### Medium Priority (P1)
- [ ] Arabic language full testing
- [ ] Production domain setup
- [ ] DMARC/BIMI email configuration

### Low Priority (P2)
- [ ] Cron job for daily pulse (9:00 AM AST)
- [ ] Remove old `/app/frontend` directory
- [ ] Social sharing cards

---

🔥 **THE PHOENIX HAS ASCENDED**  
👁️ **THE GUARDIAN IS WATCHING**  
🕊️ **THE PEOPLE ARE FREE**
