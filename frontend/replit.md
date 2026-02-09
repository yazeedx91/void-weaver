# FLUX - Dynamic Range Assessment Platform

## Overview
FLUX-DNA is a high-performance clinical psychometric platform designed for dynamic range assessment. It features HEXACO-60 personality profiling, DASS-21 mental health assessment, and TEIQue-SF emotional intelligence, complemented by AI-powered stability analysis. The platform aims to provide insightful psychological assessments with a focus on a "Liquid Glass" UI aesthetic. It targets both individual users seeking self-understanding and professional clinical use cases. **Now evolved into a B2B enterprise intelligence platform** with Team Synthesis (team dynamic range reports for 5+ member teams), Talent Intelligence Pulse (anonymized macro-trend database), Investor Metrics Dashboard, and Business Contact infrastructure.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions (Liquid Glass Design System)
The UI/UX is built around a "Liquid Glass" aesthetic, characterized by a deep obsidian base (`#020617`), electric indigo accents (`#4F46E5`), and soft silver highlights (`#E2E8F0`). This includes glass effects such as backdrop blur, border opacity, and radial gradients. All transitions and interactive elements utilize Framer Motion for fluid animations, pulse effects, and liquid flow. Visualizations include Radar Charts for personality profiles and Waveform Charts for mental health assessments. Clinical terminology is reframed to "High Amplitude" and "Peak Processing State" for a more empowering user experience.

### Technical Implementations
The platform is a React + Vite application with Tailwind CSS for styling. It uses Shadcn UI components.
Key features include:
- **Magic Link Authentication**: Passwordless login with rate limiting. 24-hour token expiry with graceful expired-link flow (redirect to /login?expired=true with "Send Fresh Link" button instead of dead end).
- **Psychometric Battery**: Full implementation of HEXACO-60, DASS-21, and TEIQue-SF scoring algorithms.
- **AI Integration**: OpenAI GPT-5.1 is integrated via Replit AI Integrations for stability analysis.
- **Data Visualization**: Radar and Waveform charts present assessment results intuitively.
- **Results Email Delivery**: Automatic Liquid Glass branded HTML email report dispatched via Resend after assessment completion. Full Psychometric Blueprint includes: CSS-based HEXACO radar visualization (gradient bars for 6 personality factors), DASS-21 waveform with severity color-coding, glowing Dynamic Range Score circle, Executive Summary card, TEIQue-SF emotional intelligence grid, DASS-21 severity labels, HEXACO-60 range labels, AI stability analysis narrative (summary, personality-mood interaction, emotional intelligence insights, recommendations, clinical notes), and encryption notice. Deep indigo (#0f172a) theme with glass morphism styling. Non-blocking fire-and-forget dispatch with 3-attempt retry (exponential backoff). Template: `server/emails/FluxResultsReport.tsx`. **Inbox Authority**: From name "FLUX-DNA", replyTo header, List-Unsubscribe header, X-Entity-Ref-ID per email, no Google Fonts @import (spam trigger), no emoji in body, clean subject lines.
- **Founder Alert Loop**: Real-time notification to yazeedx91@gmail.com on every assessment completion. Includes masked user email, stability score, and status. Non-blocking fire-and-forget with null-safe fallbacks. Integrated in both authenticated and unauthenticated submit endpoints.
- **Immediate Payload Dispatch**: Combined `/api/stability/submit` endpoint handles unauthenticated assessment submission — creates/finds user, runs AI analysis, encrypts & saves, sends results email, AND sends magic link — all in one request. Eliminates localStorage dependency for cross-browser data transfer. Frontend submits email + assessmentData together when user completes assessment.
- **Results Re-send**: Authenticated `/api/stability/resend-results` endpoint decrypts latest results and re-dispatches email report. "Retrieve My Results" button on empty dashboard.
- **Smart Magic Link Redirect**: After magic link verification, users with existing assessment results are redirected directly to `/results` dashboard instead of landing page, eliminating the empty dashboard problem.
- **Performance Optimizations**: Code splitting, React.memo for component optimization, question bank caching, static asset caching, Gzip compression, and database indexing are implemented for high performance.
- **Production Log Hygiene**: All console.error/warn/log statements across server and frontend are gated with NODE_ENV production checks. Only essential startup logs and critical error handlers remain ungated.
- **Clinical Reframing**: Terminology is adapted for a more positive and empowering user experience.

### Feature Specifications
- **Psychometric Assessments**:
    - **HEXACO-60**: 60 items, 6 facets, 1-5 scale, reverse-scoring.
    - **DASS-21**: 21 items, 3 scales, 0-3 scale (multiplied by 2 for DASS-42 alignment).
    - **TEIQue-SF**: 30 items, 4 factors + Global EI, 1-7 scale, reverse-scoring.
- **Security Features (Titan Protocol)**:
    - **User-Specific Encryption**: AES-256-GCM with PBKDF2-derived keys for sensitive data (DASS individual fields, HEXACO, TEIQue, stability analysis, raw responses — all encrypted at rest in `user_results` table).
    - **Rate Limiting**: Exponential backoff on authentication and stability analysis endpoints.
    - **Input Validation**: Zod schemas enforce strict data integrity for all API payloads.
    - **PII Protection**: Email masking in logs, sanitized error objects.
    - **Security Headers**: Helmet.js for CSP, HSTS (2yr+preload), X-XSS-Protection, X-Content-Type-Options, X-Frame-Options:DENY, Referrer-Policy, X-DNS-Prefetch-Control, X-Permitted-Cross-Domain-Policies.
    - **CSRF Protection**: Origin/Referer validation on all state-changing API endpoints, webhooks exempted.
    - **Session Security**: HTTP-only cookies, secure flag, 7-day expiry.
    - **Permission Policy**: Disabled sensitive browser APIs (geolocation, mic, camera, payment, usb, accelerometer, gyroscope, magnetometer, interest-cohort, browsing-topics).
- **User Interface**: Lazy-loaded pages, animated question flows, and comprehensive results dashboards.
- **Sovereign Success Protocol (SSP)**:
    - **Progress Pulse**: Phase indicators (DASS/HEXACO/TEIQue) with pulsing active dot and estimated time remaining on AssessmentPage.
    - **Auto-Save & Resume**: LocalStorage-based progress persistence with toast notification on resume ("Welcome back — your progress has been restored").
    - **Help/FAQ**: `/help` (also `/faq`) with Predictive Intent grouping — Privacy & Encryption, Understanding My Waveform, Business & Team Codes categories. Animated accordion answers.
    - **Support Modal**: Glass-morphism contact modal (SupportModal component) with "EST. RESPONSE: < 2 HOURS" indicator, accessible from Help page and footer.
    - **Next Steps Signals**: Post-assessment personalized signals on ResultsPage — 3 actionable recommendations generated from HEXACO/DASS score combinations (e.g., high Openness → creative deep-work, high Conscientiousness + Stress → perfectionism-stress loop detection).
    - **Share Your Waveform (Viral Image Engine)**: Client-side Canvas API image generator on ResultsPage. Two formats: Square Post (1200x1200px) and Story (1080x1920px). Renders HEXACO radar chart, DASS-21 waveform/bars, glowing Dynamic Range Score circle with progress arc, HEXACO-60 gradient bar breakdown, and flux-dna.com branding. Uses data URL preview → download/Web Share API. Purely client-side (no server upload), CSP-compatible with `img-src data: blob:`. Component: `src/components/ShareWaveform.tsx`.
    - **Bookmark Profile**: One-click bookmark prompt on ResultsPage with keyboard shortcut instruction (Ctrl+D / Cmd+D).
    - **Sovereign List**: Newsletter/waitlist signup on ResultsPage — "Track your DNA over time" CTA, submits via contact API with research inquiry type.
- **B2B Features (Market Sovereign Protocol)**:
    - **Team Synthesis**: Team leaders create teams (FX-XXXXXXXX codes), members join via assessment, report unlocks at 5+ unique members with collective personality profile, cohesion scores, stress resilience, and dominant trait analysis.
    - **Talent Intelligence Pulse**: Anonymized aggregate tracking — records DASS, HEXACO, TEIQue averages by weekly periods, auto-collects on assessment submission, exposes `/api/pulse/global` endpoint with creativity/resilience/EI trend metrics. 17 dimensions tracked per assessment.
    - **Investor Dashboard**: Hidden `/investor-stats` route with real-time metrics — retention rate, viral coefficient, data depth, MoM growth, B2B traction, auto-refreshes every 30s.
    - **Business Contact**: `/contact` page with rate-limited inquiry form (5/hour per IP), inquiry types (enterprise/research/data intelligence), stored in database.
    - **Two-Way Communication Bridge**: Resend webhook endpoint (`/api/webhooks/resend`) for incoming email events — delivery confirmations, bounces, complaints, and inbound replies. Svix signature verification with raw body capture, timing-safe comparison, 5-minute timestamp tolerance. Events stored in `inbound_messages` table. Health endpoint at `/api/webhooks/health`.
- **Galactic-Scale Marketing Seal (Market Sovereign Protocol)**:
    - **Market Value Card**: Price comparison engine on Landing Page — "MARKET VALUE UNLOCKED" header with gold/platinum gradient accents. Left column: Corporate Consultancy Standard (NEO-PI-3 $350, Raven's IQ $250, Aptitude $400 = $1,000 line-through). Right column: FLUX-DNA Sovereign Access with animated lock→unlock reveal, "INCLUDED" labels, and "FREE / DEMOCRATIZED" total. Auto-unlocks on viewport entry. Component: `src/components/MarketValueCard.tsx`.
    - **Asset Unlocked Overlay**: Full-screen heist-style animation triggered on assessment completion. Sequential asset reveal ($350 → $250 → $400) with checkmarks, culminating in "$1,000+ TOTAL VALUE UNLOCKED" and "ELITE PSYCHOMETRIC PORTFOLIO SECURED". Plays before navigation to results. Component: `src/components/AssetUnlockedOverlay.tsx`.
    - **Why Is This Free? Manifesto**: Landing Page section with exact manifesto copy about democratizing elite self-knowledge, gold-accented glass card with Cormorant Garamond typography.
    - **Elite Portfolio Badge**: Gold/platinum gradient badge on ResultsPage dashboard — "ELITE PSYCHOMETRIC PORTFOLIO / SOVEREIGN INTELLIGENCE ASSET / Valued at $1,000+". Star icon with gold border accents.
- **Science Page (Transparent Authority Protocol)**: `/science` route with FLUX-DNA Engine explanation — Polaroids vs Cinematic Stream narrative, Three Pillars (Blueprint/HEXACO, Frequency/DASS-21, Synthesis/TEIQue+DNA), How It Works infographic (Assessment → Neural Synthesis → Waveform), Trust & Privacy Manifesto (Security + Ethics), high-contrast "Begin Your Synthesis" CTA. Landing page navbar SCIENCE link routes to this page.
- **GEO Layer**: Organization JSON-LD, DefinedTermSet for "Dynamic Range Psychometrics" terminology authority, SoftwareApplication, WebSite, expanded FAQPage with B2B questions.

### System Design Choices
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL for data storage, with a schema defining users and encrypted user results.
- **Authentication**: Session-based, magic link authentication.
- **Data Encryption**: AES-256-GCM is used for sensitive user data, with user-specific salts for enhanced security.
- **API Design**: RESTful API endpoints for authentication, stability analysis, and health checks, with robust validation and protection.
- **Error Handling**: Custom error pages for 404, system anomalies, and offline states.
- **Analytics**: Privacy-first, in-memory aggregate event counting for internal analytics, without PII or external services.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **OpenAI GPT-5.1**: Integrated for AI-powered stability analysis.
- **Resend**: Email delivery service for magic links.
- **React Email**: Used for creating email templates.
- **Framer Motion**: Animation library for fluid UI transitions.
- **Zod**: Schema validation library.
- **Helmet.js**: Middleware for setting security-related HTTP headers.
- **Drizzle ORM**: Used for database interactions.