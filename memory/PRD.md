# FLUX-DNA Product Requirements Document
## Lovable Rewrite - Vite + React + Supabase Edition

**Version**: 3.0.0 (Lovable Rewrite)  
**Last Updated**: February 11, 2026  
**Status**: ✅ **SYNCED WITH GITHUB - LIVE**

---

## Architecture Change Summary

The project has been completely rewritten in Lovable with the following stack changes:

| Component | Previous | Current |
|-----------|----------|---------|
| Frontend | Next.js 15 | **Vite + React 18 + TypeScript** |
| Backend | FastAPI (Python) | **Supabase Edge Functions (Deno)** |
| Database | Supabase (manual schema) | **Supabase with auto-generated types** |
| Auth | Custom JWT | **Supabase Auth (email/password)** |
| AI | Claude via FastAPI | **Gemini 3 Flash via Lovable Gateway** |
| State | React Context | **React Context + TanStack Query** |

---

## New Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 5.4, React 18, TypeScript 5.8 |
| Styling | Tailwind CSS 3.4, Framer Motion 11 |
| Components | Shadcn/UI (Radix primitives) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI Chat | Supabase Edge Function → Lovable AI Gateway |
| Routing | React Router DOM 6 |
| State | TanStack Query, React Context |

---

## Supabase Schema

### Tables

**profiles**
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- display_name: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**assessment_results**
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- personality_answers: JSONB
- mental_health_answers: JSONB
- communication_answers: JSONB
- personality_score: INTEGER
- wellness_score: INTEGER
- eq_score: INTEGER
- created_at: TIMESTAMP
```

### Edge Functions

**hakim-chat** (`/supabase/functions/hakim-chat/index.ts`)
- Streams AI responses from Lovable AI Gateway
- Uses Gemini 3 Flash model
- Al-Hakim persona with Arabic/English support
- Marks assessment completion with `[ASSESSMENT_COMPLETE]`

---

## Pages & Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | PhoenixLanding | No |
| `/auth` | Auth (Sign In/Up) | No |
| `/hakim` | HakimChamber (AI Chat) | **Yes** |
| `/onboarding` | Onboarding | Yes |
| `/personality` | PersonalityAssessment | Yes |
| `/mental-health` | MentalHealthAssessment | Yes |
| `/communication` | CommunicationAssessment | Yes |
| `/generating` | Generating (Loading) | Yes |
| `/dashboard` | Dashboard (Results) | Yes |
| `/sovereigness` | SovereignessSanctuary | No |
| `/founder-ops` | FounderCockpit | Password Gate |

---

## Authentication Flow

1. User clicks "Sign In" → `/auth`
2. Email + Password signup/login via Supabase Auth
3. Profile auto-created via database trigger
4. Protected routes redirect to `/auth` if not logged in
5. Session persisted in localStorage

---

## Key Components

### New Components
- `TopBar.tsx` - Navigation with auth state
- `ProtectedRoute.tsx` - Auth guard
- `AssessmentVessel.tsx` - Glass card for assessments
- `VoidBackground.tsx` - Dark theme background
- `LifeLine.tsx` - Animated line decoration
- `ShaderLoader.tsx` - Loading animations

### Contexts
- `AssessmentContext.tsx` - Assessment state management
- `LanguageContext.tsx` - i18n (EN/AR)
- `SanctuaryContext.tsx` - Sanctuary state

### Hooks
- `useAuth.tsx` - Supabase auth state
- `use-toast.ts` - Toast notifications
- `use-mobile.tsx` - Mobile detection

---

## Environment Variables

```env
VITE_SUPABASE_PROJECT_ID="hdaglgaytdwvpfsrvxaa"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_URL="https://hdaglgaytdwvpfsrvxaa.supabase.co"
```

---

## What's Been Removed

The following from the previous FastAPI backend have been removed:
- `/backend/` - Entire FastAPI codebase
- Neural Router service
- Time-Gate links (Redis)
- Certificate Engine (ReportLab)
- OSINT Safety Radar
- Email Service (Resend)
- All Python tests

---

## What's Changed

### Founder Cockpit
- **Previous**: Real metrics from FastAPI, AI-driven strategic briefing
- **Current**: Animated mock data, simulated live feed
- **Password**: Changed from `PhoenixSovereign2026!` to `phoenix2024`

### Al-Hakim Chat
- **Previous**: Claude 4 Sonnet via FastAPI
- **Current**: Gemini 3 Flash via Supabase Edge Function
- **Streaming**: Yes (SSE)

### Dashboard
- **Previous**: AI-generated analysis
- **Current**: Score calculations from stored answers

---

## Access URLs

- **Preview**: https://neural-sanctuary.preview.emergentagent.com/
- **Supabase**: https://hdaglgaytdwvpfsrvxaa.supabase.co

---

## Tasks to Integrate

### If you want to restore FastAPI features:

1. **Recreate Backend Directory**
   - Restore `/backend/` with FastAPI server
   - Re-add Neural Router, Time-Gate, Certificate Engine
   - Connect Supabase from backend

2. **Add API Routes to Frontend**
   - Update `src/lib/api.ts` (create if needed)
   - Add Strategic Briefing to FounderCockpit

3. **Restore Daily Pulse**
   - Re-add Resend email integration
   - Create cron job for 9 AM AST

---

## Git Status

✅ **Workspace is now identical to GitHub repository** (`yazeedx91/void-weaver` main branch)

Commit: `84451a6 - Load Dashboard from DB`

---

*FLUX-DNA Lovable Edition v3.0.0*
*Synced February 11, 2026*
