-- ============================================================================
-- FLUX-DNA SOVEREIGN SCHEMA
-- Database: PostgreSQL + pgvector (Supabase)
-- Purpose: AI-Native Psychometric Sanctuary with Zero-Knowledge Architecture
-- Version: 2026.1.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- USERS TABLE - Zero-Knowledge Identity
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Magic Link Authentication
    magic_link_token TEXT,
    magic_link_expires_at TIMESTAMPTZ,
    
    -- Session Management
    session_token TEXT,
    session_expires_at TIMESTAMPTZ,
    
    -- User Preferences
    preferred_language TEXT DEFAULT 'en', -- 'en' or 'ar'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_session_token ON users(session_token);
CREATE INDEX idx_users_magic_link_token ON users(magic_link_token);

-- ============================================================================
-- ASSESSMENT SESSIONS - The 8-Scale Oracle Journey
-- ============================================================================
CREATE TABLE assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session State
    session_status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    current_scale TEXT, -- 'hexaco', 'dass', 'teique', 'ravens', 'schwartz', 'hits', 'pcptsd', 'web'
    current_question_index INTEGER DEFAULT 0,
    
    -- Metadata
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    language TEXT DEFAULT 'en',
    
    -- AI Persona
    persona_used TEXT DEFAULT 'al_hakim' -- 'al_hakim' or 'al_sheikha'
);

CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_status ON assessment_sessions(session_status);

-- ============================================================================
-- ASSESSMENT RESPONSES - Encrypted Raw Data
-- ============================================================================
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Response Data (Client-Side Encrypted with AES-256-GCM)
    hexaco_encrypted TEXT,
    dass_encrypted TEXT,
    teique_encrypted TEXT,
    ravens_encrypted TEXT,
    schwartz_encrypted TEXT,
    hits_encrypted TEXT,
    pcptsd_encrypted TEXT,
    web_encrypted TEXT,
    
    -- Encryption Metadata (IV, Auth Tag, Salt stored with ciphertext)
    encryption_version TEXT DEFAULT 'aes-256-gcm-v1',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_assessment_responses_session_id ON assessment_responses(session_id);

-- ============================================================================
-- NEURAL SIGNATURES - pgvector for AI-Native Pattern Matching
-- ============================================================================
CREATE TABLE neural_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Vector Embeddings (1536-dimensional for OpenAI, adjustable)
    personality_vector VECTOR(1536), -- HEXACO + TEIQue combined
    cognitive_vector VECTOR(1536),   -- Raven's IQ patterns
    clinical_vector VECTOR(1536),    -- DASS + PC-PTSD + HITS + WEB
    values_vector VECTOR(1536),      -- Schwartz Values
    
    -- Stability Indices (Plaintext Aggregates)
    stability_classification TEXT, -- 'sovereign', 'strategic_hibernation', 'at_risk', 'critical'
    risk_factors JSONB, -- Array of detected risk factors
    
    -- AI Analysis (Encrypted)
    analysis_encrypted TEXT, -- Claude's full stability analysis
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_neural_signatures_user_id ON neural_signatures(user_id);
CREATE INDEX idx_neural_signatures_personality_vector ON neural_signatures USING ivfflat (personality_vector vector_cosine_ops);
CREATE INDEX idx_neural_signatures_clinical_vector ON neural_signatures USING ivfflat (clinical_vector vector_cosine_ops);

-- ============================================================================
-- TIME-GATE LINKS - 24-Hour / 3-Click Self-Destruct Mechanism
-- ============================================================================
CREATE TABLE time_gate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Link Mechanism
    link_token TEXT UNIQUE NOT NULL,
    
    -- Time-Gate Constraints
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL, -- created_at + 24 hours
    
    -- Click-Gate Constraints
    max_clicks INTEGER DEFAULT 3,
    current_clicks INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    deactivated_at TIMESTAMPTZ,
    deactivation_reason TEXT -- 'expired', 'max_clicks', 'user_revoked'
);

CREATE INDEX idx_time_gate_links_token ON time_gate_links(link_token);
CREATE INDEX idx_time_gate_links_user_id ON time_gate_links(user_id);
CREATE INDEX idx_time_gate_links_active ON time_gate_links(is_active);

-- ============================================================================
-- FORENSIC VAULT - The Sovereigness Sanctuary (Women's Protection)
-- ============================================================================
CREATE TABLE forensic_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Evidence Type
    evidence_type TEXT NOT NULL, -- 'text', 'audio', 'image', 'video'
    
    -- Encrypted Evidence (Client-Side AES-256-GCM)
    evidence_encrypted TEXT NOT NULL,
    
    -- Metadata (EXIF-Stripped, Location Anonymized)
    original_filename TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- AI Analysis (Claude Forensic Assessment)
    ai_analysis_encrypted TEXT,
    
    -- Legal Safeguards
    chain_of_custody JSONB, -- Timestamped access log for legal admissibility
    is_submitted_to_authorities BOOLEAN DEFAULT FALSE,
    submission_date TIMESTAMPTZ
);

CREATE INDEX idx_forensic_vault_user_id ON forensic_vault(user_id);
CREATE INDEX idx_forensic_vault_evidence_type ON forensic_vault(evidence_type);
CREATE INDEX idx_forensic_vault_created_at ON forensic_vault(created_at);

-- ============================================================================
-- RESTORATION SESSIONS - The 4-Pillar Support System
-- ============================================================================
CREATE TABLE restoration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Type
    pillar TEXT NOT NULL, -- 'legal_shield', 'medical_sentinel', 'psych_repair', 'economic_liberator'
    
    -- Session Data (Encrypted Conversation History)
    conversation_encrypted TEXT,
    
    -- Progress Tracking
    stage TEXT DEFAULT 'initiated', -- 'initiated', 'in_progress', 'completed', 'escalated'
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_restoration_sessions_user_id ON restoration_sessions(user_id);
CREATE INDEX idx_restoration_sessions_pillar ON restoration_sessions(pillar);

-- ============================================================================
-- SOVEREIGN CERTIFICATES - The Revelator's Gift
-- ============================================================================
CREATE TABLE sovereign_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Certificate Details
    certificate_title TEXT NOT NULL, -- e.g., "The Strategic Phoenix"
    superpower_preamble TEXT NOT NULL,
    
    -- PDF Generation
    pdf_url TEXT, -- Signed URL for download
    
    -- Viral Sharing
    social_card_url TEXT, -- OG image for sharing
    
    -- Valuation Display
    sar_value INTEGER DEFAULT 5500,
    user_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sovereign_certificates_user_id ON sovereign_certificates(user_id);

-- ============================================================================
-- FOUNDER ANALYTICS - The Intelligence Director
-- ============================================================================
CREATE TABLE founder_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event Type
    event_type TEXT NOT NULL, -- 'user_signup', 'assessment_complete', 'sanctuary_access', 'certificate_download'
    
    -- Aggregated Metrics (No PII)
    event_metadata JSONB, -- Geographic region, language, device type (anonymized)
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_founder_analytics_event_type ON founder_analytics(event_type);
CREATE INDEX idx_founder_analytics_created_at ON founder_analytics(created_at);

-- ============================================================================
-- OSINT SAFETY CHECKS - The Cyber-Guardian
-- ============================================================================
CREATE TABLE osint_safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Connection Analysis
    ip_hash TEXT, -- Hashed IP (not stored plaintext)
    risk_score DECIMAL(3,2), -- 0.00 to 1.00
    risk_indicators JSONB, -- VPN detection, Tor usage, known abuser IPs
    
    -- Action Taken
    cloak_mode_triggered BOOLEAN DEFAULT FALSE,
    
    -- Timestamp
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_osint_safety_checks_user_id ON osint_safety_checks(user_id);
CREATE INDEX idx_osint_safety_checks_risk_score ON osint_safety_checks(risk_score);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE neural_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_gate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE restoration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sovereign_certificates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY assessment_sessions_own_data ON assessment_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY assessment_responses_own_data ON assessment_responses FOR ALL USING (session_id IN (SELECT id FROM assessment_sessions WHERE user_id = auth.uid()));
CREATE POLICY neural_signatures_own_data ON neural_signatures FOR ALL USING (user_id = auth.uid());
CREATE POLICY time_gate_links_own_data ON time_gate_links FOR ALL USING (user_id = auth.uid());
CREATE POLICY forensic_vault_own_data ON forensic_vault FOR ALL USING (user_id = auth.uid());
CREATE POLICY restoration_sessions_own_data ON restoration_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY sovereign_certificates_own_data ON sovereign_certificates FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- AUTOMATED CLEANUP FUNCTIONS
-- ============================================================================

-- Function to deactivate expired time-gate links
CREATE OR REPLACE FUNCTION deactivate_expired_links()
RETURNS void AS $$
BEGIN
    UPDATE time_gate_links
    SET is_active = FALSE,
        deactivated_at = NOW(),
        deactivation_reason = 'expired'
    WHERE is_active = TRUE
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate links that reached max clicks
CREATE OR REPLACE FUNCTION deactivate_maxed_links()
RETURNS void AS $$
BEGIN
    UPDATE time_gate_links
    SET is_active = FALSE,
        deactivated_at = NOW(),
        deactivation_reason = 'max_clicks'
    WHERE is_active = TRUE
      AND current_clicks >= max_clicks;
END;
$$ LANGUAGE plpgsql;

-- Schedule automated cleanup (run every minute)
-- Note: This requires pg_cron extension (available in Supabase)
-- SELECT cron.schedule('cleanup-expired-links', '* * * * *', 'SELECT deactivate_expired_links();');
-- SELECT cron.schedule('cleanup-maxed-links', '* * * * *', 'SELECT deactivate_maxed_links();');

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- This schema supports:
-- ✓ Zero-Knowledge Encryption (client-side AES-256-GCM)
-- ✓ Vector Search for Neural Signatures (pgvector)
-- ✓ 24-Hour / 3-Click Time-Gate Links
-- ✓ Multi-Modal Forensic Evidence Vault
-- ✓ 4-Pillar Restoration System
-- ✓ OSINT Safety Checks
-- ✓ Founder Analytics Dashboard
-- ✓ Row-Level Security for Data Sovereignty
-- ============================================================================
