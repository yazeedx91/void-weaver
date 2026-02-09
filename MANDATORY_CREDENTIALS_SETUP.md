# 🔐 MANDATORY CREDENTIALS SETUP GUIDE
## FLUX-DNA Fortress - Security Requirements

**Status:** AWAITING CREDENTIALS  
**Priority:** IMMEDIATE (NON-NEGOTIABLE)

---

## 📋 WHAT YOU NEED TO PROVIDE

### 1. SUPABASE (DATABASE) - IMMEDIATE ✅
**Why:** Neural Signatures, Forensic Vault, All user data  
**Status:** Schema ready, awaiting deployment

#### Setup Steps:
1. Go to https://supabase.com
2. Click "New Project"
3. **Project Settings:**
   - Name: `flux-dna-production`
   - Password: [Choose strong password]
   - Region: Singapore (ap-southeast-1) or Frankfurt (eu-central-1)

4. Once created, go to **Settings → API** and copy:

```bash
# Add these to /app/backend/.env:
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key-here]
SUPABASE_SERVICE_KEY=[your-service-role-key-here]
```

5. Enable extensions in **Database → Extensions**:
   - ✅ `uuid-ossp`
   - ✅ `vector` (pgvector)
   - ✅ `pg_trgm`

6. Deploy schema in **SQL Editor**:
   - Copy contents of `/app/database/SOVEREIGN_SCHEMA.sql`
   - Paste and click "Run"

---

### 2. UPSTASH REDIS (TIME-GATE) - MANDATORY 🔴
**Why:** 24-hour / 3-click link expiration (Core Security)  
**Status:** Service created, awaiting credentials

#### Setup Steps:
1. Go to https://upstash.com
2. Create account / Sign in
3. Click "Create Database"
4. **Database Settings:**
   - Name: `flux-dna-timegate`
   - Type: Redis
   - Region: Choose closest to Saudi Arabia
   - Eviction: `allkeys-lru`

5. Once created, go to **Details** tab and copy:

```bash
# Add these to /app/backend/.env:
UPSTASH_REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
UPSTASH_REDIS_TOKEN=[YOUR_TOKEN]
```

**Alternative Format (REST API):**
```bash
UPSTASH_REDIS_REST_URL=https://[your-database].upstash.io
UPSTASH_REDIS_REST_TOKEN=[your-token]
```

---

### 3. OSINT SERVICE (SAFETY CHECKS) - MANDATORY 🔴
**Why:** Sovereigness Sanctuary protection, Cloak Mode trigger  
**Status:** Service created, awaiting API key

#### Option A: Tavily (Recommended)
1. Go to https://tavily.com
2. Sign up for account
3. Go to API Keys section
4. Copy your API key

```bash
# Add to /app/backend/.env:
TAVILY_API_KEY=[your-tavily-api-key]
```

#### Option B: Perplexity
1. Go to https://www.perplexity.ai/settings/api
2. Generate API key
3. Copy key

```bash
# Add to /app/backend/.env:
PERPLEXITY_API_KEY=[your-perplexity-api-key]
```

**Note:** Only ONE is needed (Tavily OR Perplexity)

---

## 📄 COMPLETE .ENV TEMPLATE

Once you have all credentials, your `/app/backend/.env` should look like:

```bash
# ============================================================================
# FLUX-DNA PRODUCTION ENVIRONMENT
# ============================================================================

# MongoDB (Legacy - will be deprecated)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"

# ============================================================================
# AI INTEGRATIONS
# ============================================================================

# Emergent Universal Key for Claude 4 Sonnet
EMERGENT_LLM_KEY=sk-emergent-81e40Af4e97FaD3396

# Custom OpenAI-Compatible Endpoint
OPENAI_BASE_URL=http://localhost:1106/modelfarm/openai
OPENAI_API_KEY=_DUMMY_API_KEY_

# ============================================================================
# DATABASE (Supabase) - MANDATORY
# ============================================================================
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-key]

# ============================================================================
# EMAIL DELIVERY (Resend)
# ============================================================================
RESEND_API_KEY=re_i1kUR2ND_PEj3aGxH4SGjYahi2YKcvKbK
RESEND_SENDER_EMAIL=results@flux-dna.com

# ============================================================================
# SECURITY & ENCRYPTION
# ============================================================================

# Zero-Knowledge Encryption Master Key
ENCRYPTION_MASTER_KEY=97fa6ffa43144b0edbbe66be0437b1339b48c16a0c3a4d7ef80d90758bc99954

# Session Security
SESSION_SECRET=flux-dna-sovereign-session-secret-2026

# Founder Dashboard
FOUNDER_DASHBOARD_PASSWORD=PhoenixSovereign2026!

# ============================================================================
# TIME-GATE SECURITY (Upstash Redis) - MANDATORY
# ============================================================================
UPSTASH_REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
UPSTASH_REDIS_TOKEN=[your-token]

# ============================================================================
# OSINT SAFETY CHECKS (Tavily or Perplexity) - MANDATORY
# ============================================================================
TAVILY_API_KEY=[your-tavily-key]
# OR
# PERPLEXITY_API_KEY=[your-perplexity-key]
```

---

## 🧪 VERIFICATION CHECKLIST

Once you've added all credentials, run these tests:

### Test 1: Supabase Connection
```bash
cd /app/backend
python -c "from services.database import get_database_service; db = get_database_service(); print('✅ Supabase connected')"
```

### Test 2: Redis Time-Gate
```bash
cd /app/backend
python -c "from services.time_gate import get_time_gate_service; tg = get_time_gate_service(); print('✅ Redis connected')"
```

### Test 3: OSINT Service
```bash
cd /app/backend
python -c "from services.osint_safety import get_osint_service; osint = get_osint_service(); print('✅ OSINT service ready')"
```

### Test 4: Complete Integration Test
```bash
cd /app/backend
python tests/test_fortress_integration.py
```

---

## ⏱️ ESTIMATED SETUP TIME

| Service | Time | Difficulty |
|---------|------|-----------|
| Supabase | 5-7 min | Easy |
| Upstash Redis | 3-5 min | Easy |
| Tavily/Perplexity | 2-3 min | Easy |
| **Total** | **10-15 min** | **Easy** |

---

## 🚨 SECURITY NOTES

### DO NOT:
- ❌ Commit .env to git
- ❌ Share service keys publicly
- ❌ Use development keys in production
- ❌ Store keys in frontend code

### DO:
- ✅ Use environment variables
- ✅ Rotate keys periodically
- ✅ Enable 2FA on all services
- ✅ Monitor usage/billing alerts

---

## 📞 SUPPORT

**Supabase Issues:** https://supabase.com/docs  
**Upstash Issues:** https://upstash.com/docs/redis  
**Tavily Issues:** https://docs.tavily.com

**FLUX-DNA Support:** Yazeedx91@gmail.com

---

## 🎯 NEXT STEPS

Once you provide these credentials:

1. ✅ I'll update `/app/backend/.env`
2. ✅ I'll test all integrations
3. ✅ I'll deploy Supabase schema
4. ✅ I'll run comprehensive fortress tests
5. ✅ I'll perform manual email test
6. 🚀 I'll start Next.js 15 frontend build

---

## 💬 PROVIDE CREDENTIALS

**Reply with:**

```
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=...

TAVILY_API_KEY=...
```

**Or say:** "Setting them up now" and I'll wait for you.

---

**🔥 THE FORTRESS AWAITS YOUR KEYS**  
**👁️ THE GUARDIAN CANNOT PROCEED WITHOUT THEM**  
**🕊️ SECURITY IS NON-NEGOTIABLE**
