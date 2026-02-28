-- 🧬 Supabase Memory Schema for Level 3 Agentic Application
-- PostgreSQL with pgvector extension for vector similarity search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table with vector support
CREATE TABLE IF NOT EXISTS memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_session_id ON memories(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_memories(
    query_embedding vector(1536),
    similarity_threshold FLOAT DEFAULT 0.7,
    session_filter VARCHAR DEFAULT NULL,
    limit_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    session_id VARCHAR,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.session_id,
        m.content,
        m.metadata,
        m.created_at,
        1 - (m.embedding <=> query_embedding) as similarity
    FROM memories m
    WHERE 
        1 - (m.embedding <=> query_embedding) > similarity_threshold
        AND (session_filter IS NULL OR m.session_id = session_filter)
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create sessions table for tracking agent sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_goal TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    steps_completed INT DEFAULT 0,
    tools_used JSONB DEFAULT '[]',
    final_result TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_id ON agent_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at DESC);

-- Trigger for sessions updated_at
CREATE TRIGGER update_agent_sessions_updated_at
    BEFORE UPDATE ON agent_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update session status
CREATE OR REPLACE FUNCTION update_session_status(
    session_uuid VARCHAR,
    new_status VARCHAR,
    steps_completed INT DEFAULT NULL,
    tools_used JSONB DEFAULT NULL,
    final_result TEXT DEFAULT NULL,
    error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE agent_sessions 
    SET 
        status = new_status,
        steps_completed = COALESCE(steps_completed, agent_sessions.steps_completed),
        tools_used = COALESCE(tools_used, agent_sessions.tools_used),
        final_result = COALESCE(final_result, agent_sessions.final_result),
        error_message = COALESCE(error_message, agent_sessions.error_message),
        updated_at = NOW()
    WHERE session_id = session_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create view for session statistics
CREATE OR REPLACE VIEW session_stats AS
SELECT 
    s.session_id,
    s.user_goal,
    s.status,
    s.steps_completed,
    s.created_at,
    s.updated_at,
    COUNT(m.id) as memory_count,
    MAX(m.created_at) as last_memory_at
FROM agent_sessions s
LEFT JOIN memories m ON s.session_id = m.session_id
GROUP BY s.id, s.session_id, s.user_goal, s.status, s.steps_completed, s.created_at, s.updated_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON memories TO authenticated;
-- GRANT ALL ON agent_sessions TO authenticated;
-- GRANT ALL ON session_stats TO authenticated;
-- GRANT EXECUTE ON FUNCTION search_memories TO authenticated;
-- GRANT EXECUTE ON FUNCTION update_session_status TO authenticated;
