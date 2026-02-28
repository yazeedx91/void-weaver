-- Zero-Day Attack Protection Database Schema
-- Comprehensive security event tracking and threat intelligence

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'unknown_payload', 'anomalous_behavior', 'suspicious_pattern', 
        'resource_exhaustion', 'authentication_bypass', 'data_exfiltration',
        'command_injection', 'zero_day_exploit'
    )),
    threat_level TEXT NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY')),
    source_ip INET NOT NULL,
    user_agent TEXT,
    request_path TEXT NOT NULL,
    request_method TEXT NOT NULL CHECK (request_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')),
    payload TEXT,
    anomaly_score DECIMAL(5,4) NOT NULL CHECK (anomaly_score >= 0 AND anomaly_score <= 1),
    blocked BOOLEAN DEFAULT FALSE,
    details JSONB,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IP reputation table
CREATE TABLE IF NOT EXISTS ip_reputation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL UNIQUE,
    reputation_score DECIMAL(4,3) NOT NULL CHECK (reputation_score >= -1 AND reputation_score <= 1),
    threat_count INTEGER DEFAULT 0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP WITH TIME ZONE,
    block_reason TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat signatures table
CREATE TABLE IF NOT EXISTS threat_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern TEXT NOT NULL,
    threat_type TEXT NOT NULL CHECK (threat_type IN (
        'unknown_payload', 'anomalous_behavior', 'suspicious_pattern', 
        'resource_exhaustion', 'authentication_bypass', 'data_exfiltration',
        'command_injection', 'zero_day_exploit'
    )),
    threat_level TEXT NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY')),
    description TEXT NOT NULL,
    match_count INTEGER DEFAULT 0,
    last_match TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked IPs table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL UNIQUE,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    block_reason TEXT NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY')),
    event_id UUID REFERENCES security_events(id) ON DELETE SET NULL,
    permanent BOOLEAN DEFAULT FALSE,
    unblocked_at TIMESTAMP WITH TIME ZONE,
    unblocked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attack patterns table (for zero-day detection)
CREATE TABLE IF NOT EXISTS attack_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern TEXT NOT NULL UNIQUE,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'sql_injection', 'command_injection', 'xss', 'path_traversal',
        'nosql_injection', 'template_injection', 'deserialization',
        'xxe', 'ssrf', 'ldap_injection', 'xpath_injection',
        'buffer_overflow', 'race_condition', 'memory_corruption',
        'crypto_attack', 'privilege_escalation', 'data_exfiltration'
    )),
    threat_level TEXT NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY')),
    description TEXT NOT NULL,
    detection_count INTEGER DEFAULT 0,
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed BOOLEAN DEFAULT FALSE,
    false_positive_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY')),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    affected_ips INET[],
    affected_sessions TEXT[],
    mitigation_actions JSONB,
    root_cause JSONB,
    lessons_learned TEXT,
    created_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator TEXT NOT NULL,
    indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip', 'domain', 'url', 'hash', 'pattern', 'signature')),
    threat_type TEXT NOT NULL,
    confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
    source TEXT NOT NULL,
    description TEXT,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    false_positive BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security metrics table
CREATE TABLE IF NOT EXISTS security_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    total_requests INTEGER DEFAULT 0,
    blocked_requests INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    blocked_ips INTEGER DEFAULT 0,
    high_threat_events INTEGER DEFAULT 0,
    critical_threat_events INTEGER DEFAULT 0,
    emergency_threat_events INTEGER DEFAULT 0,
    avg_anomaly_score DECIMAL(5,4),
    top_threat_types JSONB,
    top_source_ips JSONB,
    environment TEXT DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('THREAT_DETECTED', 'ANOMALY_DETECTED', 'RATE_LIMIT_EXCEEDED', 'IP_BLOCKED', 'INCIDENT_CREATED')),
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    source_ip INET,
    session_id TEXT,
    event_id UUID REFERENCES security_events(id) ON DELETE SET NULL,
    incident_id UUID REFERENCES security_incidents(id) ON DELETE SET NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_source_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_level ON security_events(threat_level);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_blocked ON security_events(blocked);
CREATE INDEX IF NOT EXISTS idx_security_events_anomaly_score ON security_events(anomaly_score DESC);

CREATE INDEX IF NOT EXISTS idx_ip_reputation_ip ON ip_reputation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_score ON ip_reputation(reputation_score);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_blocked ON ip_reputation(blocked);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_last_seen ON ip_reputation(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_blocked_until ON blocked_ips(blocked_until);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_permanent ON blocked_ips(permanent);

CREATE INDEX IF NOT EXISTS idx_threat_signatures_pattern ON threat_signatures(pattern);
CREATE INDEX IF NOT EXISTS idx_threat_signatures_active ON threat_signatures(active);
CREATE INDEX IF NOT EXISTS idx_threat_signatures_match_count ON threat_signatures(match_count DESC);

CREATE INDEX IF NOT EXISTS idx_attack_patterns_pattern ON attack_patterns(pattern);
CREATE INDEX IF NOT EXISTS idx_attack_patterns_active ON attack_patterns(active);
CREATE INDEX IF NOT EXISTS idx_attack_patterns_detection_count ON attack_patterns(detection_count DESC);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at ON security_incidents(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_indicator ON threat_intelligence(indicator);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_type ON threat_intelligence(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_active ON threat_intelligence(active);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_last_seen ON threat_intelligence(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_security_metrics_timestamp ON security_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_metrics_environment ON security_metrics(environment);

CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON security_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);

-- Row Level Security policies
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Security events - admins can read all, users can read their own
CREATE POLICY "Admins can read all security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can read security events" ON security_events
    FOR SELECT USING (true);

-- IP reputation - admins only
CREATE POLICY "Admins can manage IP reputation" ON ip_reputation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Threat signatures - admins only
CREATE POLICY "Admins can manage threat signatures" ON threat_signatures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Blocked IPs - admins can read all, users can read if not blocked
CREATE POLICY "Admins can read all blocked IPs" ON blocked_ips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Attack patterns - admins only
CREATE POLICY "Admins can manage attack patterns" ON attack_patterns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Security incidents - admins can read all, users can read their own
CREATE POLICY "Admins can read all security incidents" ON security_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can read security incidents" ON security_incidents
    FOR SELECT USING (true);

-- Threat intelligence - admins only
CREATE POLICY "Admins can manage threat intelligence" ON threat_intelligence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Security metrics - public read for monitoring
CREATE POLICY "Security metrics are publicly readable" ON security_metrics
    FOR SELECT USING (true);

-- Security alerts - admins can read all, users can read their own
CREATE POLICY "Admins can read all security alerts" ON security_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can read security alerts" ON security_alerts
    FOR SELECT USING (true);

-- Create function to clean old security data
CREATE OR REPLACE FUNCTION cleanup_old_security_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete security events older than 90 days
    DELETE FROM security_events 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete IP reputation records for IPs not seen in 30 days
    DELETE FROM ip_reputation 
    WHERE last_seen < NOW() - INTERVAL '30 days'
    AND blocked = FALSE;
    
    -- Delete resolved security incidents older than 1 year
    DELETE FROM security_incidents 
    WHERE status = 'RESOLVED' 
    AND resolved_at < NOW() - INTERVAL '1 year';
    
    -- Delete inactive threat intelligence older than 6 months
    DELETE FROM threat_intelligence 
    WHERE active = FALSE 
    AND last_seen < NOW() - INTERVAL '6 months';
    
    -- Delete resolved security alerts older than 30 days
    DELETE FROM security_alerts 
    WHERE resolved = TRUE 
    AND resolved_at < NOW() - INTERVAL '30 days';
    
    -- Delete security metrics older than 7 days
    DELETE FROM security_metrics 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_ip_reputation_updated_at
    BEFORE UPDATE ON ip_reputation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_signatures_updated_at
    BEFORE UPDATE ON threat_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_ips_updated_at
    BEFORE UPDATE ON blocked_ips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attack_patterns_updated_at
    BEFORE UPDATE ON attack_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_intelligence_updated_at
    BEFORE UPDATE ON threat_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at
    BEFORE UPDATE ON security_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial threat signatures
INSERT INTO threat_signatures (pattern, threat_type, threat_level, description) VALUES
('(?i)(union\s+select|select\s+.*\s+from\s+information_schema)', 'command_injection', 'HIGH', 'SQL Union Injection Attempt'),
('(?i)(;\s*rm\s+-rf|;\s*cat\s+/etc/passwd)', 'command_injection', 'CRITICAL', 'Command Injection Attempt'),
('(?i)(\.\.\/|\.\.\\|%2e%2e%2f)', 'unknown_payload', 'HIGH', 'Path Traversal Attempt'),
('(?i)(<script|javascript:|onload\s*=)', 'unknown_payload', 'MEDIUM', 'XSS Attempt'),
('(?i)(\$ne|\$gt|\$lt|\$where|\$regex)', 'unknown_payload', 'MEDIUM', 'NoSQL Injection Attempt'),
('(?i)(\{\{.*\}\}|\{%.*%\}|\{#.*#\})', 'unknown_payload', 'MEDIUM', 'Template Injection Attempt'),
('(?i)(O:\d+:|a:\d+:|s:\d+:)', 'unknown_payload', 'HIGH', 'Deserialization Attempt'),
('(?i)(<!ENTITY.*SYSTEM|<!DOCTYPE.*\[)', 'unknown_payload', 'HIGH', 'XXE Attack Attempt'),
('(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)', 'unknown_payload', 'HIGH', 'SSRF Attack Attempt'),
('(?i)(A{50,})', 'unknown_payload', 'MEDIUM', 'Buffer Overflow Attempt')
ON CONFLICT (pattern) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
