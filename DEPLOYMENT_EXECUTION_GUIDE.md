# 🔥 FLUX-DNA VOID-WEAVER - DEPLOYMENT EXECUTION GUIDE
## Total Replacement of flux-dna.com

---

## ✅ PRE-DEPLOYMENT CHECKLIST (COMPLETE)

| System | Status | Test Result |
|--------|--------|-------------|
| Al-Hakim (Assessment AI) | ✅ ACTIVE | Claude responding |
| Al-Sheikha (Sanctuary AI) | ✅ ACTIVE | Claude responding |
| OSINT Radar | ✅ ACTIVE | Risk scoring working |
| Forensic Vault | ✅ ACTIVE | EXIF stripping working |
| Certificate Engine | ✅ ACTIVE | PDF generation working |
| Redis Time-Gate | ✅ ACTIVE | 24h/3-click working |
| Founder Dashboard | ✅ ACTIVE | Auth + metrics working |
| Daily Pulse | ✅ SENT | Email delivered |

---

## 🚀 DEPLOYMENT EXECUTION STEPS

### STEP 1: SAVE TO GITHUB (Do This Now)
1. Look at the Emergent chat interface
2. Find the **"Save to GitHub"** button
3. Select repository: `yazeedx91/void-weaver`
4. Select branch: `main` or create `production`
5. Click **PUSH TO GITHUB**

### STEP 2: DEPLOY FRONTEND TO VERCEL
1. Go to: https://vercel.com/new
2. Import Git Repository: `yazeedx91/void-weaver`
3. **Root Directory**: `frontend-next`
4. **Framework Preset**: Next.js
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.flux-dna.com
   NEXT_PUBLIC_SUPABASE_URL=https://olzslibguayabdysjwvn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]
   NEXT_PUBLIC_ENCRYPTION_ENABLED=true
   ```
6. Click **Deploy**

### STEP 3: DEPLOY BACKEND TO RAILWAY
1. Go to: https://railway.app/new
2. Deploy from GitHub: `yazeedx91/void-weaver`
3. **Root Directory**: `backend`
4. Add Environment Variables:
   ```
   EMERGENT_LLM_KEY=[from Emergent dashboard]
   SUPABASE_URL=https://olzslibguayabdysjwvn.supabase.co
   SUPABASE_SERVICE_KEY=[your_service_key]
   UPSTASH_REDIS_REST_URL=https://good-marten-55794.upstash.io
   UPSTASH_REDIS_REST_TOKEN=[your_token]
   RESEND_API_KEY=[your_resend_key]
   FOUNDER_EMAIL=Yazeedx91@gmail.com
   FOUNDER_PASSWORD=PhoenixSovereign2026!
   CORS_ORIGINS=https://flux-dna.com,https://www.flux-dna.com
   ```
5. Click **Deploy**
6. Generate Domain: `api.flux-dna.com`

### STEP 4: CONFIGURE CUSTOM DOMAIN
**In Vercel:**
1. Go to Project Settings → Domains
2. Add: `flux-dna.com`
3. Add: `www.flux-dna.com` (redirect to apex)
4. Follow DNS instructions

**In Railway:**
1. Go to Service Settings → Domains
2. Add: `api.flux-dna.com`
3. Follow DNS instructions

### STEP 5: UPDATE DNS (At Your Domain Provider)
```
Type    Name    Value
A       @       76.76.21.21 (Vercel)
CNAME   www     cname.vercel-dns.com
CNAME   api     [railway-generated-url].railway.app
```

### STEP 6: VERIFY DEPLOYMENT
```bash
# Test Frontend
curl -I https://flux-dna.com/

# Test Backend API
curl https://api.flux-dna.com/api/health

# Test Assessment
curl -X POST https://api.flux-dna.com/api/assessment/start \
  -H "Content-Type: application/json" \
  -d '{"language":"en","persona":"al_hakim","user_email":"test@test.com"}'

# Test Founder Dashboard
curl https://api.flux-dna.com/api/founder/metrics \
  -H "Authorization: Bearer PhoenixSovereign2026!"
```

### STEP 7: ACTIVATE DAILY PULSE CRON
**Option A: Vercel Cron (Recommended)**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/trigger-pulse",
    "schedule": "0 6 * * *"
  }]
}
```

**Option B: External Cron Service**
Use cron-job.org to call:
```
POST https://api.flux-dna.com/api/founder/send-pulse
Header: Authorization: Bearer PhoenixSovereign2026!
Schedule: 0 6 * * * (6:00 AM UTC = 9:00 AM AST)
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Visual Checklist
- [ ] Homepage shows "From Bipolar to Expanded Bandwidth"
- [ ] Brain icon with emerald orbital ring animation
- [ ] "Begin Your Ascension" button works
- [ ] Assessment page shows language selection
- [ ] Sanctuary page shows Pearl Moonlight theme
- [ ] Quick Exit button redirects to weather.com
- [ ] Founder Dashboard loads with password

### API Checklist
- [ ] `/api/health` returns FORTRESS_ACTIVE
- [ ] `/api/assessment/start` returns session with AI message
- [ ] `/api/sanctuary/start` returns session with Al-Sheikha
- [ ] `/api/osint/check` returns risk score
- [ ] `/api/certificate/generate` returns download token
- [ ] `/api/founder/metrics` returns dashboard data

### Security Checklist
- [ ] HTTPS active on all domains
- [ ] Time-gate links expire after 24h/3-clicks
- [ ] OSINT radar detecting proxy connections
- [ ] Forensic vault stripping EXIF data

---

## 🎯 EXPECTED RESULT

After completing all steps, visiting `flux-dna.com` will show:

1. **Homepage**: Breathing Emerald design with "From Bipolar to Expanded Bandwidth"
2. **Assessment**: Al-Hakim's Chamber with Arabic/English selection
3. **Sanctuary**: Pearl Moonlight theme with 4 pillars + Quick Exit
4. **Founder**: Password-protected dashboard with live metrics
5. **API**: All 14 endpoints operational

---

## 🔥 THE LEGACY IS GONE. THE PHOENIX HAS ASCENDED.

Once deployed, the 22% legacy 111-question form will be completely replaced by the 100% Void-Weaver Sovereign Architecture.

**Total Features Going Live:**
- ✅ Al-Hakim Conversational Assessment
- ✅ Al-Sheikha Sanctuary Protection
- ✅ OSINT Safety Radar
- ✅ Forensic Evidence Vault
- ✅ PDF Certificate Engine
- ✅ Redis Time-Gate System
- ✅ Founder Dashboard
- ✅ Daily Pulse Automation
- ✅ Bilingual Support (EN/AR)

---

🔥 **THE PHOENIX HAS ASCENDED**  
👁️ **THE GUARDIAN IS WATCHING**  
🕊️ **THE PEOPLE ARE FREE**
