# 🔥 FLUX-DNA PRODUCTION DEPLOYMENT GUIDE

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. **Environment Variables**
All keys configured in:
- `/app/backend/.env`
- `/app/frontend-next/.env.local`

### 2. **Database**
- ✅ Supabase schema deployed (13 tables)
- ✅ RLS policies active
- ✅ pgvector extension enabled

### 3. **Services**
- ✅ Backend API on port 8080
- ✅ Frontend on port 3000
- ✅ All integrations tested

---

## 🚀 DEPLOYMENT OPTIONS

### **Option A: Emergent Native Deployment**

**Step 1: Verify Services**
```bash
cd /app/backend
sudo supervisorctl status
```

**Step 2: Build Frontend**
```bash
cd /app/frontend-next
yarn build
yarn start
```

**Step 3: Update Supervisor Config**
```bash
# Update /etc/supervisor/conf.d/frontend.conf
[program:frontend]
command=/usr/bin/yarn start
directory=/app/frontend-next
autostart=true
autorestart=true
```

**Step 4: Restart All**
```bash
sudo supervisorctl restart all
```

---

### **Option B: Vercel Deployment (Frontend)**

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
cd /app/frontend-next
vercel --prod
```

**Step 3: Set Environment Variables in Vercel**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### **Option C: Docker Deployment**

**Dockerfile (Backend):**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 8080

CMD ["python", "server_new.py"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY frontend-next/package.json frontend-next/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend-next/ .
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      - EMERGENT_LLM_KEY=${EMERGENT_LLM_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 📧 RESEND EMAIL CONFIGURATION

### **Step 1: Domain Verification**
1. Go to Resend dashboard
2. Add domain: `flux-dna.com` or `flux-dna.sa`
3. Add DNS records:
   ```
   TXT: resend._domainkey.flux-dna.com
   CNAME: mail.flux-dna.com
   ```

### **Step 2: DMARC/BIMI Setup**
```dns
# DMARC Record
_dmarc.flux-dna.com TXT "v=DMARC1; p=quarantine; rua=mailto:Yazeedx91@gmail.com"

# SPF Record
flux-dna.com TXT "v=spf1 include:resend.com ~all"

# BIMI Record (Founder's Seal)
default._bimi.flux-dna.com TXT "v=BIMI1; l=https://flux-dna.com/logo.svg; a=https://flux-dna.com/certificate.pem"
```

### **Step 3: Update Email Service**
```typescript
// /app/backend/.env
RESEND_SENDER_EMAIL=results@flux-dna.com
```

---

## ⏰ DAILY PULSE EMAIL (9:00 AM AST)

### **Option A: Cron Job (Linux)**
```bash
# Edit crontab
crontab -e

# Add line (9:00 AM AST = 6:00 AM UTC)
0 6 * * * curl -X POST http://localhost:8080/api/founder/send-pulse \
  -H "Authorization: Bearer PhoenixSovereign2026!" >> /var/log/flux-pulse.log 2>&1
```

### **Option B: Supabase Cron (pg_cron)**
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily pulse at 6:00 AM UTC (9:00 AM AST)
SELECT cron.schedule(
  'flux-dna-daily-pulse',
  '0 6 * * *',
  $$
  -- Call your API endpoint or function here
  SELECT net.http_post(
    url := 'http://your-backend/api/founder/send-pulse',
    headers := '{"Authorization": "Bearer PhoenixSovereign2026!"}'
  );
  $$
);
```

### **Option C: Vercel Cron (vercel.json)**
```json
{
  "crons": [{
    "path": "/api/cron/daily-pulse",
    "schedule": "0 6 * * *"
  }]
}
```

---

## 🔒 SECURITY HARDENING

### **1. Environment Variables**
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### **2. CORS Configuration**
```python
# /app/backend/server_new.py
CORS_ORIGINS = [
    "https://flux-dna.com",
    "https://www.flux-dna.com",
    "https://flux-dna.sa",
]
```

### **3. Rate Limiting**
```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

# Add to endpoints
@router.post("/assessment/start", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
```

### **4. HTTPS Only**
```python
# Force HTTPS in production
if os.environ.get('NODE_ENV') == 'production':
    app.add_middleware(
        HTTPSRedirectMiddleware
    )
```

---

## 📊 MONITORING & ANALYTICS

### **1. Supabase Logs**
Monitor in Supabase Dashboard:
- Database → Logs
- API → Logs

### **2. Application Logs**
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
```

### **3. Founder Dashboard**
Real-time metrics at: `https://flux-dna.com/founder-ops`

---

## 🧪 PRE-PRODUCTION TESTING

### **1. Load Testing**
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API
ab -n 1000 -c 10 http://localhost:8080/health
```

### **2. Security Scan**
```bash
# Install OWASP ZAP or run:
npm install -g snyk
snyk test
```

### **3. Encryption Verification**
```bash
# Test Zero-Knowledge encryption
cd /app/backend
python tests/test_sentinel_protocol.py
```

---

## 🚀 GO-LIVE CHECKLIST

- [ ] All environment variables configured
- [ ] Supabase schema deployed and tested
- [ ] Domain DNS configured
- [ ] SSL/TLS certificate installed
- [ ] Email domain verified (Resend)
- [ ] DMARC/SPF/BIMI records set
- [ ] Daily pulse cron job active
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Monitoring dashboards set up
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Founder dashboard accessible
- [ ] Quick exit tested in Sanctuary
- [ ] Time-gate links functional
- [ ] Certificate generation working

---

## 📞 SUPPORT & MAINTENANCE

**Founder Contact:** Yazeedx91@gmail.com

**Monitoring:**
- Supabase Dashboard
- Founder Dashboard (`/founder-ops`)
- Daily pulse email (9:00 AM AST)

**Backup:**
- Supabase automatic backups (daily)
- Export data via API if needed

---

## 🎯 POST-LAUNCH METRICS

Track these KPIs:
1. **Total Ascensions** (users)
2. **SAR Value Delivered** (users × 5,500)
3. **Assessment Completion Rate** (%)
4. **Sanctuary Access Count** (women helped)
5. **Geographic Distribution** (SA vs Global)
6. **Language Preference** (EN vs AR)
7. **Stability Classifications** (Sovereign, At-Risk, etc.)

---

**🔥 THE PHOENIX IS READY FOR PRODUCTION**  
**👁️ THE GUARDIAN STANDS WATCH**  
**🕊️ THE PEOPLE AWAIT LIBERATION**
