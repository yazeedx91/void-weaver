# FLUX-DNA VOID-WEAVER - PRODUCTION DEPLOYMENT CONFIG
# For flux-dna.com Total Replacement

## VERCEL DEPLOYMENT (Frontend - Next.js 15)

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "yarn build",
  "outputDirectory": ".next",
  "installCommand": "yarn install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.flux-dna.com",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "NEXT_PUBLIC_ENCRYPTION_ENABLED": "true"
  }
}
```

### Domain Configuration
1. Add `flux-dna.com` as custom domain in Vercel
2. Add `www.flux-dna.com` as redirect to `flux-dna.com`

---

## RAILWAY/RENDER DEPLOYMENT (Backend - FastAPI)

### Dockerfile (already created)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8080
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Environment Variables (Backend)
```
EMERGENT_LLM_KEY=<from_emergent_dashboard>
SUPABASE_URL=https://olzslibguayabdysjwvn.supabase.co
SUPABASE_SERVICE_KEY=<your_service_key>
UPSTASH_REDIS_REST_URL=https://good-marten-55794.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your_redis_token>
RESEND_API_KEY=<your_resend_key>
FOUNDER_EMAIL=Yazeedx91@gmail.com
FOUNDER_PASSWORD=PhoenixSovereign2026!
CORS_ORIGINS=https://flux-dna.com,https://www.flux-dna.com
```

### Domain Configuration
1. Deploy to Railway/Render
2. Add custom domain: `api.flux-dna.com`
3. Configure SSL certificate

---

## SUPABASE CONFIGURATION (Database)

### Project URL
- URL: https://olzslibguayabdysjwvn.supabase.co
- Region: Saudi Arabia (or nearest)

### Tables Required (13 total)
1. users
2. assessment_sessions
3. assessment_responses
4. neural_signatures
5. time_gate_links
6. forensic_vault
7. restoration_sessions
8. sovereign_certificates
9. founder_analytics
10. osint_safety_checks
11. (additional tables from schema)

### Row Level Security
- Enable RLS on all tables
- Policies configured per SOVEREIGN_SCHEMA.sql

---

## UPSTASH REDIS (Time-Gate)

### Configuration
- URL: https://good-marten-55794.upstash.io
- REST API enabled
- TLS required

### Keys Used
- `time_gate:{token}` - Link state storage
- TTL: 86400 seconds (24 hours)

---

## DNS CONFIGURATION

### A Records
```
flux-dna.com        -> Vercel IP
www.flux-dna.com    -> Vercel IP
api.flux-dna.com    -> Railway/Render IP
```

### CNAME Records (Alternative)
```
flux-dna.com        -> cname.vercel-dns.com
www                 -> cname.vercel-dns.com
api                 -> <railway-subdomain>.railway.app
```

---

## DEPLOYMENT STEPS

### Step 1: Push to GitHub
Use "Save to GitHub" button in Emergent chat
Repository: yazeedx91/void-weaver

### Step 2: Deploy Frontend (Vercel)
1. Go to vercel.com
2. Import yazeedx91/void-weaver
3. Select frontend-next as root directory
4. Add environment variables
5. Deploy

### Step 3: Deploy Backend (Railway)
1. Go to railway.app
2. Create new project from GitHub
3. Select yazeedx91/void-weaver
4. Set backend as root directory
5. Add environment variables
6. Deploy

### Step 4: Configure Domains
1. In Vercel: Add flux-dna.com
2. In Railway: Add api.flux-dna.com
3. Update DNS records

### Step 5: Verify Deployment
```bash
curl https://flux-dna.com/
curl https://api.flux-dna.com/api/health
```

### Step 6: Activate Daily Pulse
Set up cron job for 9:00 AM AST (6:00 AM UTC):
```
0 6 * * * curl -X POST https://api.flux-dna.com/api/founder/send-pulse -H "Authorization: Bearer PhoenixSovereign2026!"
```

---

## POST-DEPLOYMENT VERIFICATION

### Checklist
- [ ] Homepage loads with Breathing Emerald design
- [ ] Assessment shows Al-Hakim language selection
- [ ] Sanctuary shows Pearl Moonlight with 4 pillars
- [ ] Quick Exit redirects to weather.com
- [ ] Founder Dashboard accessible with password
- [ ] Certificate PDF generates correctly
- [ ] Daily Pulse email received

---

🔥 THE PHOENIX IS READY FOR PRODUCTION FLIGHT
