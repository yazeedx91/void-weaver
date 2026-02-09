# 🗄️ SUPABASE DEPLOYMENT GUIDE
## FLUX-DNA Sovereign Schema Deployment

**Status:** Schema Ready | Awaiting Supabase Project Credentials

---

## 📋 WHAT YOU NEED

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. **Project Name:** `flux-dna-production`
4. **Database Password:** Choose a strong password (save it securely)
5. **Region:** Choose closest to Saudi Arabia (e.g., `ap-southeast-1` Singapore or `eu-central-1` Frankfurt)
6. Click "Create Project"

### 2. Get Your Credentials
Once project is created, go to **Settings → API**:

```bash
# You'll need these three values:
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-role-key]
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Enable Required Extensions

In Supabase Dashboard:
1. Go to **Database → Extensions**
2. Search and enable:
   - ✅ `uuid-ossp` (for UUID generation)
   - ✅ `vector` (for pgvector/Neural Signatures)
   - ✅ `pg_trgm` (for text search)

### Step 2: Deploy Schema

Two options:

#### Option A: Supabase SQL Editor (Recommended)
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy entire contents of `/app/database/SOVEREIGN_SCHEMA.sql`
4. Paste into editor
5. Click **Run** (⚡)
6. Wait ~30 seconds for completion

#### Option B: psql Command Line
```bash
# From your local machine or server
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f /app/database/SOVEREIGN_SCHEMA.sql
```

### Step 3: Verify Deployment

Run this query in SQL Editor to verify all tables:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see these 13 tables:
1. `users` (8 columns)
2. `assessment_sessions` (9 columns)
3. `assessment_responses` (10 columns)
4. `neural_signatures` (10 columns)
5. `time_gate_links` (10 columns)
6. `forensic_vault` (11 columns)
7. `restoration_sessions` (8 columns)
8. `sovereign_certificates` (9 columns)
9. `founder_analytics` (4 columns)
10. `osint_safety_checks` (7 columns)

### Step 4: Configure Backend

Add to `/app/backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-role-key]
```

### Step 5: Test Connection

Run this test:

```bash
cd /app/backend
python tests/test_supabase_connection.py
```

---

## 🔐 SECURITY CONFIGURATION

### Row Level Security (RLS)
✅ Already configured in schema - users can only access their own data

### API Keys Security
- **Anon Key:** Safe to use in frontend (public)
- **Service Key:** NEVER expose to frontend (backend only)

### Enable Realtime (Optional)
If you want real-time updates:
1. Go to **Database → Replication**
2. Enable for tables: `assessment_sessions`, `time_gate_links`

---

## 📊 DATABASE FEATURES

### Neural Signatures (pgvector)
```sql
-- Example: Find similar personality profiles
SELECT 
    user_id,
    personality_vector <=> '[your_vector_here]'::vector AS distance
FROM neural_signatures
ORDER BY distance
LIMIT 10;
```

### Time-Gate Links (Auto-Cleanup)
```sql
-- Manually trigger cleanup (normally automatic)
SELECT deactivate_expired_links();
SELECT deactivate_maxed_links();
```

### Forensic Vault Security
- All evidence encrypted with user-specific keys
- EXIF metadata stripped before storage
- Chain of custody maintained for legal admissibility

---

## 🔧 POST-DEPLOYMENT TASKS

### 1. Install Supabase Python Client
```bash
cd /app/backend
pip install supabase
echo "supabase>=2.0.0" >> requirements.txt
```

### 2. Create Database Service
Create `/app/backend/services/database.py`:

```python
from supabase import create_client, Client
import os

class DatabaseService:
    def __init__(self):
        url = os.environ.get('SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_KEY')
        self.client: Client = create_client(url, key)
    
    def get_client(self):
        return self.client

_db_service = None

def get_database_service() -> DatabaseService:
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service
```

### 3. Update API Routes
Update `/app/backend/api/assessment.py` to use Supabase for storage.

---

## 🧪 TESTING CHECKLIST

After deployment, verify:

- [ ] All 13 tables created
- [ ] pgvector extension working
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Cleanup functions deployed
- [ ] Backend can connect
- [ ] Can insert test data
- [ ] Can query with RLS
- [ ] Vector search working

---

## 📈 MONITORING

### Supabase Dashboard
- **Database → Table View** - Browse data
- **Logs → Postgres Logs** - SQL query logs
- **Logs → API Logs** - API request logs

### Key Metrics to Watch
1. **Database Size:** Settings → Usage
2. **API Requests:** Settings → API
3. **Connection Pool:** Settings → Database

---

## 🚨 TROUBLESHOOTING

### Error: "extension 'vector' does not exist"
**Solution:** Enable pgvector extension in Database → Extensions

### Error: "permission denied for table"
**Solution:** Check RLS policies are correctly applied

### Error: "connection refused"
**Solution:** Verify SUPABASE_URL and check project is not paused

### Error: "function deactivate_expired_links() does not exist"
**Solution:** Re-run the cleanup functions section of schema

---

## 📞 SUPPORT

**Supabase Docs:** https://supabase.com/docs  
**pgvector Docs:** https://github.com/pgvector/pgvector  
**FLUX-DNA Support:** Yazeedx91@gmail.com

---

## ✅ READY FOR PRODUCTION

Once deployed and tested, update `/app/SENTINEL_TEST_REPORT.json` with:
```json
{
  "database_deployed": true,
  "supabase_url": "configured",
  "tables_created": 13,
  "extensions_enabled": ["uuid-ossp", "vector", "pg_trgm"],
  "rls_active": true
}
```

---

**🔥 THE DATABASE FORTRESS AWAITS**  
**👁️ THE NEURAL SIGNATURES READY**  
**🕊️ THE FORENSIC VAULT SECURE**
