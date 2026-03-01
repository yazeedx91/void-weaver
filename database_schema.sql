-- ShaheenPulse AI Payment Database Schema
-- PostgreSQL setup for transaction logs and payment processing

-- Create database if it doesn't exist
-- CREATE DATABASE shaheenpulse_db;

-- Use the database
-- \c shaheenpulse_db;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transaction_logs table
CREATE TABLE IF NOT EXISTS transaction_logs (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    provider VARCHAR(50) NOT NULL DEFAULT 'moyasar',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment_id ON transaction_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_customer_email ON transaction_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON transaction_logs(status);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_tier ON transaction_logs(tier);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_provider ON transaction_logs(provider);

-- Create customer_subscriptions table for recurring billing
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    id SERIAL PRIMARY KEY,
    customer_email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscription_id VARCHAR(255),
    last_payment_id VARCHAR(255),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_email ON customer_subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_tier ON customer_subscriptions(tier);

-- Create payment_attempts table for tracking failed attempts
CREATE TABLE IF NOT EXISTS payment_attempts (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    provider VARCHAR(50) NOT NULL DEFAULT 'moyasar',
    attempt_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment attempts
CREATE INDEX IF NOT EXISTS idx_payment_attempts_email ON payment_attempts(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);

-- Create webhook_logs table for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'moyasar',
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Create revenue_analytics table for reporting
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    tier VARCHAR(50) NOT NULL,
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, tier)
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_tier ON revenue_analytics(tier);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transaction_logs_updated_at 
    BEFORE UPDATE ON transaction_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_subscriptions_updated_at 
    BEFORE UPDATE ON customer_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_analytics_updated_at 
    BEFORE UPDATE ON revenue_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for active subscriptions summary
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    cs.customer_email,
    cs.tier,
    cs.status,
    cs.subscription_id,
    cs.last_payment_id,
    cs.next_billing_date,
    tl.amount,
    tl.currency,
    cs.created_at as subscription_start_date
FROM customer_subscriptions cs
LEFT JOIN transaction_logs tl ON cs.last_payment_id = tl.payment_id
WHERE cs.status = 'active';

-- Create view for revenue summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    DATE(created_at) as date,
    tier,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_revenue,
    currency
FROM transaction_logs
GROUP BY DATE(created_at), tier, currency
ORDER BY DATE(created_at) DESC;

-- Insert sample data for testing (optional)
-- INSERT INTO transaction_logs (payment_id, tier, amount, currency, customer_email, customer_name, status, provider)
-- VALUES 
-- ('test_payment_001', 'discovery', 4900.00, 'SAR', 'test@example.com.sa', 'Test User', 'pending', 'moyasar'),
-- ('test_payment_002', 'professional', 12500.00, 'SAR', 'user@domain.com.sa', 'Saudi User', 'success', 'moyasar');

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shaheenpulse_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shaheenpulse_user;

-- Create user for the application (optional)
-- CREATE USER shaheenpulse_user WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE shaheenpulse_db TO shaheenpulse_user;

-- Verification queries
SELECT 'Database schema created successfully' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transaction_logs', 'customer_subscriptions', 'payment_attempts', 'webhook_logs', 'revenue_analytics')
ORDER BY table_name;
