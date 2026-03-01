-- 🚀 ShaheenPulse AI - Vitality Index™ Database Schema
-- Optimized for sub-10ms writes with industrial-grade performance

-- ! PATENT-PENDING: SHAHEEN_CORE_LOGIC
-- Vitality Index Formula: V_i = (Performance × Accuracy) / (Energy × Latency)

-- Enable necessary extensions for performance
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create optimized tablespace for high-performance writes
-- CREATE TABLESPACE vitality_fast LOCATION '/var/lib/postgresql/vitality';

-- Main Vitality Index Table - Optimized for sub-10ms writes
CREATE TABLE vitality_index (
    -- Primary identifiers
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Core performance metrics (for Vitality Index calculation)
    performance_score DECIMAL(10,4) NOT NULL CHECK (performance_score >= 0 AND performance_score <= 1),
    accuracy_score DECIMAL(10,4) NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
    energy_consumption DECIMAL(12,4) NOT NULL CHECK (energy_consumption >= 0),
    latency_ms DECIMAL(10,4) NOT NULL CHECK (latency_ms >= 0),
    
    -- Calculated Vitality Index
    vitality_index DECIMAL(12,8) GENERATED ALWAYS AS (
        -- ! PATENT-PENDING: SHAHEEN_CORE_LOGIC
        -- Vitality Index Formula: V_i = (Performance × Accuracy) / (Energy × Latency)
        CASE 
            WHEN (energy_consumption * latency_ms) > 0 
            THEN (performance_score * accuracy_score) / (energy_consumption * latency_ms) * 1000
            ELSE 0 
        END
    ) STORED,
    
    -- Industrial metrics
    industrial_health_score DECIMAL(8,4) CHECK (industrial_health_score >= 0 AND industrial_health_score <= 1),
    failure_probability DECIMAL(8,4) CHECK (failure_probability >= 0 AND failure_probability <= 1),
    operational_status VARCHAR(20) DEFAULT 'OPTIMAL' 
        CHECK (operational_status IN ('OPTIMAL', 'DEGRADED', 'CRITICAL', 'FAILURE')),
    
    -- Aeon™ Evolution Core metrics
    aeon_healing_active BOOLEAN DEFAULT FALSE,
    phalanx_twin_gating BOOLEAN DEFAULT FALSE,
    model_drift_percentage DECIMAL(5,2) CHECK (model_drift_percentage >= 0 AND model_drift_percentage <= 100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_system VARCHAR(50) DEFAULT 'AEON_CORE',
    data_quality_score DECIMAL(5,2) DEFAULT 100.0 CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    
    -- Partitioning key for time-series optimization
    partition_date DATE GENERATED ALWAYS AS (timestamp::date) STORED
);

-- Create optimized indexes for sub-10ms performance
-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_vitality_asset_time 
    ON vitality_index (asset_id, timestamp DESC) 
    WHERE timestamp >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY idx_vitality_asset_status 
    ON vitality_index (asset_id, operational_status) 
    WHERE operational_status IN ('CRITICAL', 'FAILURE');

CREATE INDEX CONCURRENTLY idx_vitality_healing 
    ON vitality_index (aeon_healing_active, phalanx_twin_gating) 
    WHERE aeon_healing_active = TRUE OR phalanx_twin_gating = TRUE;

CREATE INDEX CONCURRENTLY idx_vitality_composite 
    ON vitality_index (asset_id, partition_date, vitality_index DESC);

-- Hash index for fast equality lookups
CREATE INDEX CONCURRENTLY idx_vitality_asset_hash 
    ON vitality_index USING HASH (asset_id);

-- Partitioning for time-series optimization (monthly partitions)
CREATE TABLE vitality_index_y2026m01 PARTITION OF vitality_index
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE vitality_index_y2026m02 PARTITION OF vitality_index
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE vitality_index_y2026m03 PARTITION OF vitality_index
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Aeon™ Self-Healing Events Table
CREATE TABLE aeon_healing_events (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID DEFAULT gen_random_uuid() UNIQUE,
    asset_id VARCHAR(50) NOT NULL REFERENCES vitality_index(asset_id),
    
    -- Healing trigger information
    trigger_type VARCHAR(30) NOT NULL 
        CHECK (trigger_type IN ('MODEL_DRIFT', 'PERFORMANCE_DEGRADATION', 'FAILURE_PREDICTION', 'ANOMALY_DETECTION')),
    trigger_severity VARCHAR(20) DEFAULT 'MEDIUM'
        CHECK (trigger_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Healing process metrics
    healing_initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    healing_completed_at TIMESTAMP WITH TIME ZONE,
    healing_duration_ms INTEGER,
    healing_success BOOLEAN DEFAULT FALSE,
    
    -- Pre and post healing metrics
    pre_healing_vitality DECIMAL(12,8),
    post_healing_vitality DECIMAL(12,8),
    vitality_improvement DECIMAL(12,8),
    
    -- Industrial compliance
    industrial_compliance_met BOOLEAN DEFAULT TRUE,
    compliance_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    healing_algorithm_version VARCHAR(20) DEFAULT '1.0.0'
);

-- Phalanx™ Twin-Gating Events Table
CREATE TABLE phalanx_twin_gating_events (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID DEFAULT gen_random_uuid() UNIQUE,
    asset_id VARCHAR(50) NOT NULL REFERENCES vitality_index(asset_id),
    
    -- Gating trigger information
    gating_triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    gating_reason VARCHAR(100) NOT NULL,
    gating_level VARCHAR(20) DEFAULT 'WARNING'
        CHECK (gating_level IN ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY')),
    
    -- Twin-gating metrics
    anomaly_score DECIMAL(8,4) CHECK (anomaly_score >= 0 AND anomaly_score <= 1),
    confidence_level DECIMAL(5,2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
    
    -- System response
    system_isolated BOOLEAN DEFAULT FALSE,
    recovery_initiated BOOLEAN DEFAULT FALSE,
    
    -- Industrial safety
    safety_protocol_activated BOOLEAN DEFAULT FALSE,
    safety_protocol_type VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

-- Performance Metrics Table for detailed analysis
CREATE TABLE performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL REFERENCES vitality_index(asset_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- CPU and Memory metrics
    cpu_usage_percent DECIMAL(5,2) CHECK (cpu_usage_percent >= 0 AND cpu_usage_percent <= 100),
    memory_usage_percent DECIMAL(5,2) CHECK (memory_usage_percent >= 0 AND memory_usage_percent <= 100),
    memory_usage_mb INTEGER CHECK (memory_usage_mb >= 0),
    
    -- Network metrics
    network_io_mb_per_second DECIMAL(10,4) CHECK (network_io_mb_per_second >= 0),
    network_latency_ms DECIMAL(8,4) CHECK (network_latency_ms >= 0),
    
    -- Storage metrics
    disk_usage_percent DECIMAL(5,2) CHECK (disk_usage_percent >= 0 AND disk_usage_percent <= 100),
    disk_io_mb_per_second DECIMAL(10,4) CHECK (disk_io_mb_per_second >= 0),
    
    -- Application metrics
    request_count INTEGER CHECK (request_count >= 0),
    error_rate_percent DECIMAL(5,2) CHECK (error_rate_percent >= 0 AND error_rate_percent <= 100),
    response_time_avg_ms DECIMAL(8,4) CHECK (response_time_avg_ms >= 0),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance tables
CREATE INDEX CONCURRENTLY idx_performance_asset_time 
    ON performance_metrics (asset_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_healing_asset_time 
    ON aeon_healing_events (asset_id, healing_initiated_at DESC);

CREATE INDEX CONCURRENTLY idx_gating_asset_time 
    ON phalanx_twin_gating_events (asset_id, gating_triggered_at DESC);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vitality_index_updated_at 
    BEFORE UPDATE ON vitality_index 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stored Procedures for sub-10ms operations

-- ! PATENT-PENDING: SHAHEEN_CORE_LOGIC
-- Optimized Vitality Index calculation and insertion
CREATE OR REPLACE FUNCTION insert_vitality_index_optimized(
    p_asset_id VARCHAR(50),
    p_performance_score DECIMAL(10,4),
    p_accuracy_score DECIMAL(10,4),
    p_energy_consumption DECIMAL(12,4),
    p_latency_ms DECIMAL(10,4),
    p_industrial_health_score DECIMAL(8,4) DEFAULT 1.0,
    p_failure_probability DECIMAL(8,4) DEFAULT 0.0
) RETURNS BIGINT AS $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Optimized single-row insertion with calculated vitality index
    INSERT INTO vitality_index (
        asset_id, 
        performance_score, 
        accuracy_score, 
        energy_consumption, 
        latency_ms,
        industrial_health_score,
        failure_probability
    ) VALUES (
        p_asset_id,
        p_performance_score,
        p_accuracy_score,
        p_energy_consumption,
        p_latency_ms,
        p_industrial_health_score,
        p_failure_probability
    ) RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest vitality index for an asset (sub-10ms)
CREATE OR REPLACE FUNCTION get_latest_vitality_index(p_asset_id VARCHAR(50))
RETURNS TABLE (
    vitality_index DECIMAL(12,8),
    performance_score DECIMAL(10,4),
    accuracy_score DECIMAL(10,4),
    energy_consumption DECIMAL(12,4),
    latency_ms DECIMAL(10,4),
    operational_status VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vi.vitality_index,
        vi.performance_score,
        vi.accuracy_score,
        vi.energy_consumption,
        vi.latency_ms,
        vi.operational_status,
        vi.timestamp
    FROM vitality_index vi
    WHERE vi.asset_id = p_asset_id
    ORDER BY vi.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger Aeon™ self-healing
-- ! PATENT-PENDING: SHAHEEN_CORE_LOGIC
CREATE OR REPLACE FUNCTION trigger_aeon_healing(
    p_asset_id VARCHAR(50),
    p_trigger_type VARCHAR(30),
    p_trigger_severity VARCHAR(20) DEFAULT 'MEDIUM'
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_latest_vitality DECIMAL(12,8);
BEGIN
    -- Get latest vitality index
    SELECT vitality_index INTO v_latest_vitality
    FROM get_latest_vitality_index(p_asset_id)
    LIMIT 1;
    
    -- Insert healing event
    INSERT INTO aeon_healing_events (
        asset_id,
        trigger_type,
        trigger_severity,
        pre_healing_vitality
    ) VALUES (
        p_asset_id,
        p_trigger_type,
        p_trigger_severity,
        v_latest_vitality
    ) RETURNING event_id INTO v_event_id;
    
    -- Update vitality index to show healing is active
    UPDATE vitality_index 
    SET aeon_healing_active = TRUE,
        updated_at = NOW()
    WHERE asset_id = p_asset_id
    AND timestamp = (
        SELECT timestamp FROM vitality_index 
        WHERE asset_id = p_asset_id 
        ORDER BY timestamp DESC 
        LIMIT 1
    );
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger Phalanx™ twin-gating
-- ! PATENT-PENDING: SHAHEEN_CORE_LOGIC
CREATE OR REPLACE FUNCTION trigger_phalanx_gating(
    p_asset_id VARCHAR(50),
    p_gating_reason VARCHAR(100),
    p_anomaly_score DECIMAL(8,4),
    p_confidence_level DECIMAL(5,2)
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    -- Insert gating event
    INSERT INTO phalanx_twin_gating_events (
        asset_id,
        gating_reason,
        anomaly_score,
        confidence_level
    ) VALUES (
        p_asset_id,
        p_gating_reason,
        p_anomaly_score,
        p_confidence_level
    ) RETURNING event_id INTO v_event_id;
    
    -- Update vitality index to show gating is active
    UPDATE vitality_index 
    SET phalanx_twin_gating = TRUE,
        updated_at = NOW()
    WHERE asset_id = p_asset_id
    AND timestamp = (
        SELECT timestamp FROM vitality_index 
        WHERE asset_id = p_asset_id 
        ORDER BY timestamp DESC 
        LIMIT 1
    );
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE VIEW vitality_summary AS
SELECT 
    asset_id,
    vitality_index,
    operational_status,
    aeon_healing_active,
    phalanx_twin_gating,
    timestamp,
    CASE 
        WHEN vitality_index >= 0.8 THEN 'EXCELLENT'
        WHEN vitality_index >= 0.6 THEN 'GOOD'
        WHEN vitality_index >= 0.4 THEN 'FAIR'
        ELSE 'POOR'
    END as vitality_grade
FROM vitality_index vi
WHERE vi.timestamp = (
    SELECT MAX(timestamp) 
    FROM vitality_index vi2 
    WHERE vi2.asset_id = vi.asset_id
);

-- Grant permissions for application user
-- CREATE USER shaheen_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE shaheenpulse TO shaheen_app;
-- GRANT USAGE ON SCHEMA public TO shaheen_app;
-- GRANT SELECT, INSERT, UPDATE ON vitality_index TO shaheen_app;
-- GRANT SELECT, INSERT, UPDATE ON aeon_healing_events TO shaheen_app;
-- GRANT SELECT, INSERT, UPDATE ON phalanx_twin_gating_events TO shaheen_app;
-- GRANT SELECT, INSERT, UPDATE ON performance_metrics TO shaheen_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO shaheen_app;

-- Performance optimization settings
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';
-- ALTER SYSTEM SET default_statistics_target = 100;
-- ALTER SYSTEM SET random_page_cost = 1.1;
-- ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
-- SELECT pg_reload_conf();

COMMIT;

-- 🚀 Vitality Index™ Database Schema Complete
-- Optimized for sub-10ms writes with industrial-grade performance
