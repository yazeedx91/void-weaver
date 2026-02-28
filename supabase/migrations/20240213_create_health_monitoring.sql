-- Health Check Tables for FLUX-DNA System
-- Comprehensive monitoring and alerting system

-- Health check history table
CREATE TABLE IF NOT EXISTS health_check_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'CRITICAL')),
    checks JSONB NOT NULL,
    summary JSONB NOT NULL,
    environment TEXT DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health check alerts table
CREATE TABLE IF NOT EXISTS health_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('CRITICAL', 'DEGRADED', 'UNHEALTHY')),
    component TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'ACKNOWLEDGED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id)
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    cpu_usage DECIMAL(5,2) NOT NULL,
    memory_usage DECIMAL(5,2) NOT NULL,
    disk_usage DECIMAL(5,2) NOT NULL,
    network_io JSONB,
    process_info JSONB,
    environment TEXT DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component health status table
CREATE TABLE IF NOT EXISTS component_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_name TEXT NOT NULL,
    component_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'CRITICAL')),
    message TEXT,
    response_time DECIMAL(8,2),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    environment TEXT DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health check configuration table
CREATE TABLE IF NOT EXISTS health_check_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_name TEXT NOT NULL UNIQUE,
    component_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    check_interval_seconds INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,
    retry_count INTEGER DEFAULT 3,
    alert_thresholds JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health notifications table
CREATE TABLE IF NOT EXISTS health_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_id UUID REFERENCES health_alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('EMAIL', 'SMS', 'PUSH', 'WEBHOOK')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance trends table
CREATE TABLE IF NOT EXISTS performance_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_name TEXT NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('response_time', 'success_rate', 'error_rate')),
    value DECIMAL(10,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    environment TEXT DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_check_history_timestamp ON health_check_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_check_history_status ON health_check_history(overall_status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_component ON health_alerts(component);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_component_health_timestamp ON component_health(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_component_health_status ON component_health(status);
CREATE INDEX IF NOT EXISTS idx_performance_trends_timestamp ON performance_trends(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_trends_component ON performance_trends(component_name, metric_type);

-- Row Level Security policies
ALTER TABLE health_check_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Health check history - public read for monitoring
CREATE POLICY "Health check history is publicly readable" ON health_check_history
    FOR SELECT USING (true);

-- Health alerts - admins can read all, users can read their own
CREATE POLICY "Admins can read all health alerts" ON health_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can read health alerts" ON health_alerts
    FOR SELECT USING (true);

-- System metrics - public read for monitoring
CREATE POLICY "System metrics are publicly readable" ON system_metrics
    FOR SELECT USING (true);

-- Component health - public read for monitoring
CREATE POLICY "Component health is publicly readable" ON component_health
    FOR SELECT USING (true);

-- Health check config - admins only
CREATE POLICY "Admins can manage health check config" ON health_check_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Health notifications - users can read their own
CREATE POLICY "Users can read own health notifications" ON health_notifications
    FOR SELECT USING (user_id = auth.uid());

-- Performance trends - public read for monitoring
CREATE POLICY "Performance trends are publicly readable" ON performance_trends
    FOR SELECT USING (true);

-- Insert default health check configurations
INSERT INTO health_check_config (component_name, component_type, check_interval_seconds, timeout_seconds, alert_thresholds) VALUES
('Supabase', 'database', 60, 10, '{"response_time_warning": 1000, "response_time_critical": 3000}'),
('pgvector', 'database', 300, 15, '{"response_time_warning": 2000, "response_time_critical": 5000}'),
('OpenAI', 'ai_service', 120, 30, '{"response_time_warning": 2000, "response_time_critical": 5000}'),
('Groq', 'ai_service', 120, 30, '{"response_time_warning": 1500, "response_time_critical": 3000}'),
('Tavily', 'external_api', 180, 20, '{"response_time_warning": 3000, "response_time_critical": 8000}'),
('CPU', 'system', 30, 5, '{"warning_threshold": 70, "critical_threshold": 90}'),
('Memory', 'system', 30, 5, '{"warning_threshold": 70, "critical_threshold": 90}'),
('Disk', 'system', 60, 10, '{"warning_threshold": 80, "critical_threshold": 95}'),
('Citadel Armor', 'security', 300, 15, '{}'),
('Neural Memory', 'memory', 120, 20, '{}')
ON CONFLICT (component_name) DO NOTHING;

-- Create function to test pgvector extension
CREATE OR REPLACE FUNCTION test_pgvector()
RETURNS BOOLEAN AS $$
BEGIN
    -- Test pgvector functionality
    PERFORM 1 FROM pg_extension WHERE extname = 'vector';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Test vector operations
    PERFORM '[1,2,3]'::vector;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old health data
CREATE OR REPLACE FUNCTION cleanup_old_health_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete health check history older than 30 days
    DELETE FROM health_check_history 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete system metrics older than 7 days
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Delete resolved alerts older than 7 days
    DELETE FROM health_alerts 
    WHERE status = 'RESOLVED' 
    AND resolved_at < NOW() - INTERVAL '7 days';
    
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

-- Apply trigger to health_check_config table
CREATE TRIGGER update_health_check_config_updated_at
    BEFORE UPDATE ON health_check_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
