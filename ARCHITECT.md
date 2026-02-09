# ARCHITECT.md — The Soul of FLUX-DNA

> **Classification**: AI-to-AI Sovereign Architecture Document
> **Version**: 2.0.0 | **Last Updated**: 2026-02-06
> **Domain**: https://flux-dna.com
> **Purpose**: Preserve the sovereign integrity of FLUX-DNA across all future iterations.
> Any agent modifying this system MUST read this document in full before making changes.

---

## 1. SYSTEM DNA

### 1.1 Psychometric Scoring Engine

The scoring engine lives in `src/algorithms/ScoringAlgorithm.ts` and implements three clinically validated instruments executed sequentially: DASS-21 → HEXACO-60 → TEIQue-SF (111 total items).

#### DASS-21 (Depression Anxiety Stress Scales)

- **Items**: 21 questions, Likert scale 0–3 (Never / Sometimes / Often / Almost Always)
- **Subscales** (7 items each, per official scoring key):
  - Depression (D): items 3, 5, 10, 13, 16, 17, 21
  - Anxiety (A): items 2, 4, 7, 9, 15, 19, 20
  - Stress (S): items 1, 6, 8, 11, 12, 14, 18
- **Scoring formula**: `subscale_score = Σ(item_responses) × 2`
  - The ×2 multiplier aligns DASS-21 scores with the full DASS-42 normative data.
- **Score ranges** (after ×2): 0–42 per subscale
- **Severity classification thresholds** (DASS-42 aligned):

  | Severity | Depression | Anxiety | Stress |
  |---|---|---|---|
  | Normal | 0–9 | 0–7 | 0–14 |
  | Mild | 10–13 | 8–9 | 15–18 |
  | Moderate | 14–20 | 10–14 | 19–25 |
  | Severe | 21–27 | 15–19 | 26–33 |
  | Extremely Severe | 28+ | 20+ | 34+ |

- **Clinical reframing** (FLUX terminology):
  - "Normal" → "Baseline"
  - "Mild" → "Mild Elevation"
  - "Moderate" → "Moderate Amplitude"
  - "Severe" → "High Amplitude"
  - "Extremely Severe" → "Peak Processing"

#### HEXACO-60 (Personality Architecture)

- **Items**: 60 questions, Likert scale 1–5 (Strongly Disagree → Strongly Agree)
- **6 Facets** (10 items each):
  - Honesty-Humility (H): items 1–10
  - Emotionality (E): items 11–20
  - Extraversion (X): items 21–30
  - Agreeableness (A): items 31–40
  - Conscientiousness (C): items 41–50
  - Openness to Experience (O): items 51–60
- **Reverse-coding formula**: `reversed_score = 6 - raw_score`
  - Applied to items marked `reverseCoded: true` in the item configuration.
  - Reverse-coded items per facet: H(2,4,6,8,9,10), E(12,14,16,18,20), X(21,24,26,28,29,30), A(33,36,38,39,40), C(43,44,45,46,48,50), O(53,54,56,57,59)
- **Scoring formula**: `facet_score = Σ(scored_items) / item_count`
  - Result: mean score per facet, range 1.00–5.00, rounded to 2 decimal places.
  - `Math.round(sum / count * 100) / 100`

#### TEIQue-SF (Trait Emotional Intelligence)

- **Items**: 30 questions, Likert scale 1–7 (Completely Disagree → Completely Agree)
- **4 Factors** + Global EI:
  - Well-being: items 1, 5, 9, 12, 20, 24, 27
  - Self-Control: items 2, 7, 11, 15, 18, 22, 26, 29
  - Emotionality: items 3, 8, 13, 16, 19, 23, 28, 30
  - Sociability: items 4, 6, 10, 14, 17, 21, 25
- **Reverse-coding formula**: `reversed_score = 8 - raw_score`
  - Applied to items: 2, 4, 5, 7, 8, 10, 12, 13, 14, 16, 18, 22, 25, 26, 28
- **Scoring formula**: `factor_score = Σ(scored_items) / item_count`
  - Result: mean score per factor, range 1.00–7.00, rounded to 2 decimal places.
- **Global EI**: `globalEI = (Wellbeing + SelfControl + Emotionality + Sociability) / 4`

#### Cross-Instrument Stability Index

The stability index performs cross-correlation analysis across all three instruments:

```
Stability Flags (boolean triggers):
├── Acute Reactive State:     DASS.Stress > 24 AND HEXACO.Emotionality > 4.2
├── High-Functioning Burnout: HEXACO.Conscientiousness > 4.5 AND DASS.Depression > 15
└── Emotional Dysregulation:  TEIQue.SelfControl < 3.5 AND (DASS.Anxiety > 14 OR DASS.Stress > 18)

Risk Factor Enumeration (9 total):
├── acuteReactiveState flag
├── highFunctioningBurnout flag
├── emotionalDysregulation flag
├── DASS.Depression > 20
├── DASS.Anxiety > 14
├── DASS.Stress > 25
├── HEXACO.Emotionality > 4.5
├── HEXACO.Conscientiousness < 2.0
└── TEIQue.GlobalEI < 3.0

Overall Stability Classification:
├── riskCount >= 4 → "Critical"
├── riskCount >= 2 → "At Risk"
└── riskCount <  2 → "Stable"
```

### 1.2 AES-256-GCM Encryption Flow

All DASS-21 scores and AI stability analyses are encrypted at rest. File: `server/lib/encryption.ts`.

```
Encryption Pipeline:
┌─────────────────────────────────────────────────────────────────┐
│ 1. ENCRYPTION_KEY (env var) → 32-byte hex → Buffer             │
│ 2. User Salt = SHA-256("flux-user-{userId}-salt")[0:16]         │
│ 3. Derived Key = PBKDF2(baseKey, userSalt, 100000, 32, SHA256) │
│ 4. IV = crypto.randomBytes(16)                                  │
│ 5. Cipher = AES-256-GCM(derivedKey, IV, authTagLength=16)      │
│ 6. Output = "{IV_hex}:{authTag_hex}:{salt_hex}:{ciphertext}"   │
└─────────────────────────────────────────────────────────────────┘

Decryption Pipeline:
┌─────────────────────────────────────────────────────────────────┐
│ 1. Parse ciphertext → IV, authTag, saltHex, encrypted           │
│ 2. Validate authTag.length === 16 bytes (CRITICAL)              │
│ 3. Re-derive user key: PBKDF2(baseKey, SHA256("flux-user-      │
│    {userId}-salt")[0:16], 100000, 32, SHA256)                   │
│    NOTE: saltHex in ciphertext is for format consistency only.  │
│    Key derivation always uses deterministic userId-based salt.  │
│ 4. Decipher = AES-256-GCM(derivedKey, IV, authTagLength=16)    │
│ 5. decipher.setAuthTag(authTag)                                 │
│ 6. Output = plaintext (UTF-8)                                   │
└─────────────────────────────────────────────────────────────────┘

Constants:
  ALGORITHM       = "aes-256-gcm"
  KEY_LENGTH      = 32 bytes
  IV_LENGTH       = 16 bytes
  AUTH_TAG_LENGTH = 16 bytes
  SALT_LENGTH     = 16 bytes
  PBKDF2_ITERATIONS = 100,000
```

**What gets encrypted** (all per-user AES-256-GCM):
- `dass_depression_encrypted` — DASS Depression score
- `dass_anxiety_encrypted` — DASS Anxiety score
- `dass_stress_encrypted` — DASS Stress score
- `hexaco_scores` — HEXACO personality scores (JSON, encrypted per-user)
- `stability_analysis` — AI-generated stability analysis (JSON, encrypted per-user, with plaintext fallback for legacy data)
- `raw_responses_encrypted` — Full raw response arrays (JSON)

### 1.3 Liquid Glass Design System

#### Tailwind Custom Colors (`tailwind.config.js`)

```javascript
flux: {
  obsidian:      '#020617',    // Deep space black (bg)
  indigo:        '#4F46E5',    // Electric indigo (primary accent)
  silver:        '#E2E8F0',    // Soft silver (text)
  'indigo-light': '#6366F1',   // Vibrant indigo (hover states, gradients)
  'indigo-dark': '#3730A3',    // Deep indigo (pressed states)
  'glass':       'rgba(79, 70, 229, 0.1)',   // Glass tint
  'glass-border': 'rgba(226, 232, 240, 0.1)', // Glass border
}
```

#### Custom Animations

```javascript
'flux-pulse':  'fluxPulse 4s ease-in-out infinite'
  // 0%,100%: opacity 0.4 → 50%: opacity 0.8

'flux-glow':   'fluxGlow 3s ease-in-out infinite alternate'
  // 0%: boxShadow 20px rgba(79,70,229,0.3) → 100%: 40px rgba(79,70,229,0.6)

'liquid-flow': 'liquidFlow 8s ease-in-out infinite'
  // 0%,100%: backgroundPosition 0% 50% → 50%: 100% 50%
```

#### Background Gradients

```javascript
'flux-gradient': 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)'
'flux-radial':   'radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, transparent 70%)'
```

#### Glass Effect Pattern (CSS)

```css
backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-2xl
/* Hover enhancement: */
hover:border-[#4F46E5]/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.12)]
```

#### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 2. SECURITY GUARDRAILS

> **CRITICAL**: These protocols are load-bearing. Removing or weakening any of them
> without equivalent replacement constitutes a security regression.

### 2.1 IDOR Protection

- Results endpoint (`GET /api/stability/results`) uses `req.user.id` from authenticated session middleware — never from URL params or request body.
- The `userId` field was removed from client assessment payloads; the server exclusively uses the authenticated session identity.
- Account deletion (`DELETE /api/auth/account`) cascades via `ON DELETE CASCADE` on `user_results.user_id → users.id`.

### 2.2 Rate Limiting Matrix

| Endpoint | Window | Max Requests | Handler |
|---|---|---|---|
| `POST /api/auth/request-magic-link` | 15 min | 5 | Exponential backoff (15→30→60→120 min) |
| `GET /api/auth/verify` | 5 min | 10 | Exponential backoff |
| `GET /api/auth/me` | 1 min | 60 | Exponential backoff |
| `POST /api/auth/logout` | 1 min | 60 | Exponential backoff |
| `DELETE /api/auth/account` | 1 min | 60 | Exponential backoff |
| `GET /api/stability/questions` | 15 min | 60 | Standard 429 |
| `POST /api/stability/analyze` | 60 min | 5 | Standard 429 |
| `POST /api/analytics/event` | 1 min | 30/IP | Custom in-memory sliding window |

Exponential backoff escalation: `[15, 30, 60, 120]` minutes. Resets after 1 hour of no violations.

### 2.3 Zod Validation Schemas

All API payloads are validated before processing. File: `server/lib/validation.ts`.

```
magicLinkRequestSchema:
  email: z.string().email().max(255)

hexacoResponseSchema:
  id:       z.number().int().min(1).max(60)
  response: z.number().int().min(1).max(5)

dassResponseSchema:
  id:       z.number().int().min(1).max(21)
  response: z.number().int().min(0).max(3)

teiqueResponseSchema:
  id:       z.number().int().min(1).max(30)
  response: z.number().int().min(1).max(7)

assessmentDataSchema:
  dassScores:
    Depression: z.number().int().min(0).max(42)
    Anxiety:    z.number().int().min(0).max(42)
    Stress:     z.number().int().min(0).max(42)
  hexacoScores:
    HonestyHumility:     z.number().min(0).max(5)
    Emotionality:        z.number().min(0).max(5)
    Extraversion:        z.number().min(0).max(5)
    Agreeableness:       z.number().min(0).max(5)
    Conscientiousness:   z.number().min(0).max(5)
    OpennessToExperience: z.number().min(0).max(5)
  teiqueScores (optional):
    Wellbeing:    z.number().min(0).max(7)
    SelfControl:  z.number().min(0).max(7)
    Emotionality: z.number().min(0).max(7)
    Sociability:  z.number().min(0).max(7)
    GlobalEI:     z.number().min(0).max(7)
  rawResponses (optional):
    dass:   z.array(z.number().int().min(0).max(3)).length(21)
    hexaco: z.array(z.number().int().min(1).max(5)).length(60)
    teique: z.array(z.number().int().min(1).max(7)).length(30)
```

### 2.4 Security Headers (Helmet.js)

```
Content-Security-Policy:
  default-src:    'self'
  script-src:     'self' 'unsafe-inline'
  style-src:      'self' 'unsafe-inline' https://fonts.googleapis.com
  font-src:       'self' https://fonts.gstatic.com data:
  img-src:        'self' data: blob:
  connect-src:    'self'
  frame-src:      'none'
  frame-ancestors: 'self' https://*.replit.dev https://*.repl.co https://flux-dna.com
  object-src:     'none'
  base-uri:       'self'
  form-action:    'self'
  upgrade-insecure-requests: (enabled)

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
X-Permitted-Cross-Domain-Policies: none
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

### 2.5 Session Security

- Cookies: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`
- Session expiry: 7 days
- Magic link expiry: 15 minutes
- Session tokens: `crypto.randomBytes(32).toString('hex')`
- PII masking: Email addresses redacted in server logs (`e***@domain.com`)

### 2.6 Database Security

- DASS scores encrypted per-user with AES-256-GCM (see Section 1.2)
- AI stability analysis encrypted at rest with user-specific keys
- Cascading deletes: `ON DELETE CASCADE` on `user_results → users`
- Pool limits: `max=20`, `idleTimeout=30s`, `connectionTimeout=5s`
- Composite indexes: `(user_id, created_at)` for efficient query patterns

---

## 3. DEPLOYMENT SPECS

### 3.1 Cloudflare DNS Configuration

```
Domain: flux-dna.com
DNS Records:
  CNAME  flux-dna.com  →  [Replit deployment URL]
  CNAME  www           →  flux-dna.com

Cloudflare Settings:
  SSL/TLS: Full (Strict)
  Always Use HTTPS: ON
  Auto Minify: OFF (Vite handles this)
  Brotli: ON
  Browser Cache TTL: Respect Existing Headers
```

### 3.2 Replit Deployment Configuration

```
Deployment Target: autoscale
Build Command:     npm run build
Run Command:       NODE_ENV=production tsx server/index.ts
Port:              5000
```

### 3.3 Environment Variables

#### Required Secrets (Encrypted)

| Variable | Description | Source |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Auto-configured (Replit DB) |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Individual PG credentials | Auto-configured (Replit DB) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI GPT-5.1 API key | Auto-configured (Replit AI Integration) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL | Auto-configured (Replit AI Integration) |
| `SESSION_SECRET` | Express session signing key | Manual secret |
| `RESEND_API_KEY` | Resend email delivery API key | Manual secret |
| `ENCRYPTION_KEY` | 32-byte hex for AES-256-GCM | Manual secret (64 hex chars). Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

#### Environment Variables (Non-Secret)

| Variable | Environment | Value | Description |
|---|---|---|---|
| `APP_DOMAIN` | Production | `flux-dna.com` | Used in magic link emails and SEO |

### 3.4 Build Output (Production)

```
Target: ESNext
Chunks: 14 files
Total:  ~1 MB uncompressed, ~280 KB gzipped

Vendor Splitting:
  vendor-react.js    160 KB → 52 KB gzip
  vendor-motion.js   115 KB → 38 KB gzip
  vendor-charts.js   403 KB → 108 KB gzip
  vendor-ui.js       2.7 KB → 1.3 KB gzip

Application:
  index.js           68 KB → 20 KB gzip
  AssessmentPage.js  107 KB → 26 KB gzip
  LandingPage.js     21 KB → 6 KB gzip
  ResultsPage.js     12 KB → 4 KB gzip
  LoginPage.js       6 KB → 2 KB gzip
  PrivacyPage.js     4 KB → 2 KB gzip
  NotFoundPage.js    1.5 KB → 0.8 KB gzip
  button.js          22 KB → 8 KB gzip
  index.css          77 KB → 13 KB gzip
```

### 3.5 Caching Strategy

```
Static Assets (JS/CSS in /assets/):
  Cache-Control: public, max-age=31536000, immutable
  Vary: Accept-Encoding

Fonts (woff2/ttf/eot):
  Cache-Control: public, max-age=31536000, immutable

Images (svg/png/jpg/webp/ico):
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

HTML (SPA fallback):
  Cache-Control: no-store, no-cache, must-revalidate

API Responses:
  Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
  Pragma: no-cache
  Expires: 0
```

---

## 4. DATABASE SCHEMA

File: `shared/schema.ts` (Drizzle ORM)

```sql
-- Users table
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  magic_link_token    TEXT,
  magic_link_expires_at TIMESTAMP,
  session_token       TEXT,
  session_expires_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_login_at TIMESTAMP
);
CREATE INDEX users_session_token_idx ON users(session_token);
CREATE INDEX users_magic_link_token_idx ON users(magic_link_token);
CREATE INDEX users_email_idx ON users(email);

-- Assessment results (DASS encrypted, HEXACO plaintext JSON)
CREATE TABLE user_results (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dass_depression_encrypted TEXT NOT NULL,  -- AES-256-GCM per-user
  dass_anxiety_encrypted    TEXT NOT NULL,  -- AES-256-GCM per-user
  dass_stress_encrypted     TEXT NOT NULL,  -- AES-256-GCM per-user
  hexaco_scores             TEXT,           -- JSON (unencrypted)
  stability_analysis        TEXT,           -- AES-256-GCM per-user
  raw_responses_encrypted   TEXT,           -- AES-256-GCM per-user
  completed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX user_results_user_id_idx ON user_results(user_id);
CREATE INDEX user_results_created_at_idx ON user_results(created_at);
CREATE INDEX user_results_user_created_idx ON user_results(user_id, created_at);
```

---

## 5. API CONTRACT

### Authentication

```
POST /api/auth/request-magic-link
  Body: { email: string }
  Rate: 5/15min + exponential backoff
  → 200 { message: "Magic link sent" }

GET /api/auth/verify?token=<hex>
  Rate: 10/5min + exponential backoff
  → 302 redirect to / (sets session cookie)

GET /api/auth/me
  Auth: Required (session cookie)
  → 200 { user: { id, email } }
  → 401 { error: "Not authenticated" }

POST /api/auth/logout
  Auth: Required
  → 200 { message: "Logged out" }

DELETE /api/auth/account
  Auth: Required
  → 200 { message: "Account deleted" }
  Effect: Cascading delete of all user_results
```

### Stability Analysis

```
GET /api/stability/questions
  Auth: Required
  Rate: 60/15min
  Cache: 1-hour TTL (in-memory)
  → 200 { hexaco: [...], dass: [...], teique: [...] }

POST /api/stability/analyze
  Auth: Required
  Rate: 5/60min
  Body: { assessmentData: <assessmentDataSchema> }
  Validation: Zod (strict integer enforcement)
  → 200 { analysis: "..." }
  Side effects: Encrypted storage in user_results

GET /api/stability/results
  Auth: Required
  → 200 { results: [...] }
  Note: DASS scores decrypted on-the-fly with user-specific key
```

### Analytics (Privacy-First)

```
POST /api/analytics/event
  Rate: 30/min per IP
  Body: { event: "get_started_click" | "assessment_complete" | "page_view" }
  → 200 { ok: true }
  Storage: In-memory only. No PII. No persistence. No external services.

GET /api/analytics/summary
  → 200 { counts: {...}, uptimeHours: "N.N", since: "ISO-8601" }
```

### Health

```
GET /api/health
  → 200 { status: "ok", version: "2.0.0", security: {...} }
```

---

## 6. FILE ARCHITECTURE

```
FLUX-DNA/
├── ARCHITECT.md              ← This file (Soul of the System)
├── replit.md                 ← Operational state + change log
├── index.html                ← SPA entry point + SEO meta tags
├── package.json              ← Dependencies + scripts
├── tailwind.config.js        ← Liquid Glass design tokens
├── vite.config.ts            ← Build config + vendor chunking
├── drizzle.config.ts         ← Database migration config
├── tsconfig.json             ← TypeScript configuration
│
├── public/
│   ├── logo.svg              ← Dynamic Helix SVG logo
│   └── og-card.png           ← Open Graph social preview card (1200×630)
│
├── shared/
│   └── schema.ts             ← Drizzle ORM database schema
│
├── server/
│   ├── index.ts              ← Express server + Helmet + compression
│   ├── middleware/
│   │   └── auth.ts           ← Session authentication middleware
│   ├── routes/
│   │   ├── auth.ts           ← Magic link auth + rate limiting
│   │   ├── stability.ts      ← AI analysis + Zod validation
│   │   └── analytics.ts      ← Privacy-first event tracking
│   ├── lib/
│   │   ├── encryption.ts     ← AES-256-GCM + user-specific PBKDF2
│   │   ├── validation.ts     ← Zod schemas for all payloads
│   │   └── mailer.ts         ← Resend email integration
│   └── emails/
│       └── FluxMagicLink.tsx  ← React Email template
│
├── src/
│   ├── App.tsx               ← Router + ErrorBoundary + OfflineDetector
│   ├── index.ts              ← Zustand store (psychometric state)
│   ├── main.tsx              ← React DOM entry
│   ├── algorithms/
│   │   └── ScoringAlgorithm.ts  ← Complete scoring engine (HEXACO + DASS + TEIQue)
│   ├── types/
│   │   └── psychometric.ts   ← TypeScript interfaces
│   ├── pages/
│   │   ├── LandingPage.tsx   ← Hero + features + science + founder + entry portal
│   │   ├── LoginPage.tsx     ← Magic link login form
│   │   ├── AssessmentPage.tsx ← 111-question flow + Neural Processing overlay
│   │   ├── ResultsPage.tsx   ← Radar + Waveform charts + AI analysis
│   │   ├── PrivacyPage.tsx   ← Privacy policy
│   │   └── NotFoundPage.tsx  ← 404 "Signal Not Found"
│   └── components/
│       ├── ErrorBoundary.tsx  ← "System Anomaly Detected" crash handler
│       ├── OfflineDetector.tsx ← "Signal Lost — Retrying" network monitor
│       └── ui/               ← Shadcn UI primitives
│
└── dist/                     ← Production build output (gitignored)
```

---

## 7. INVARIANTS — DO NOT BREAK

These are the non-negotiable architectural constraints. Violating any of these constitutes a regression:

1. **DASS scores MUST be encrypted at rest** with user-specific PBKDF2-derived keys. Never store raw DASS integers in the database.
2. **Reverse-coding MUST be applied** before averaging HEXACO (formula: `6 - score`) and TEIQue (formula: `8 - score`). Removing this silently corrupts all personality data.
3. **DASS-21 ×2 multiplier is mandatory**. The severity thresholds are calibrated for DASS-42 alignment. Removing the multiplier makes all classifications wrong.
4. **Session identity (`req.user.id`) is the only source of user identity** for data operations. Never accept `userId` from client payloads.
5. **Rate limiting must exist on all auth endpoints** with exponential backoff. The escalation sequence `[15, 30, 60, 120]` minutes prevents brute-force attacks.
6. **Zod validation must run before any database write**. The integer constraints (0-3 for DASS, 1-5 for HEXACO, 1-7 for TEIQue) prevent injection of impossible scores.
7. **The ENCRYPTION_KEY must be 32 bytes (64 hex characters)**. Shorter keys will cause `createCipheriv` to throw at runtime.
8. **Auth tag length must be explicitly set to 16** in both `createCipheriv` and `createDecipheriv`. Omitting this causes silent auth tag mismatches.
9. **The `ON DELETE CASCADE` on `user_results.user_id`** ensures account deletion is complete. Never remove this constraint.
10. **CSP must never include `unsafe-eval`**. The current policy permits `unsafe-inline` for styles (required by Tailwind's runtime) but eval is prohibited.

---

## 8. FUTURE ROADMAP

### Phase 3: AI-Driven Comparative Synthesis

The next evolution of FLUX-DNA will introduce **comparative benchmarking** — allowing users to see how their psychometric profile compares to high-performance archetypes.

**Planned capabilities**:
- Benchmark database of anonymized, aggregate profiles from high-performers across domains (founders, athletes, creatives, researchers)
- AI synthesis comparing the user's HEXACO + TEIQue + DASS profile against relevant archetype clusters
- "Dynamic Range Fingerprint" — a unique visual signature derived from the user's cross-instrument pattern
- Longitudinal tracking — repeat assessments over time to visualize trajectory and growth
- Export: PDF report generation with radar overlays and AI narrative

**Technical prerequisites**:
- Aggregate statistics table (anonymized, no PII, no individual linkage)
- Vector embedding of psychometric profiles for similarity search
- Scheduled batch processing for archetype cluster updates
- PDF generation pipeline (server-side, not client)

**Guiding principle**: Comparison is for growth, not ranking. The UI must frame benchmarks as "pattern similarity" rather than "better/worse" to maintain the clinical reframing philosophy of FLUX-DNA.

---

> This document is the sovereign truth of FLUX-DNA's architecture.
> Any future agent operating on this codebase must treat these specifications
> as load-bearing constraints, not suggestions.
>
> Built by Yazeed Shaheen. Architected for permanence.
