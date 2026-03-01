"""
Transaction Logs Database Service
PostgreSQL integration for payment transactions
"""

import asyncpg
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import os
import json

logger = logging.getLogger(__name__)

@dataclass
class TransactionRecord:
    """Transaction record data structure"""
    payment_id: str
    tier: str
    amount: float
    currency: str
    customer_email: str
    customer_name: str
    status: str
    provider: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TransactionLogsService:
    """Service for managing transaction logs in PostgreSQL"""
    
    def __init__(self):
        self.database_url = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost/shaheenpulse")
        self.pool = None
    
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(self.database_url)
            await self._create_table()
            logger.info("Transaction logs database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise
    
    async def _create_table(self):
        """Create transaction_logs table if it doesn't exist"""
        create_table_query = """
            CREATE TABLE IF NOT EXISTS transaction_logs (
                id SERIAL PRIMARY KEY,
                payment_id VARCHAR(255) UNIQUE NOT NULL,
                tier VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL,
                provider VARCHAR(50) NOT NULL,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment_id ON transaction_logs(payment_id);
            CREATE INDEX IF NOT EXISTS idx_transaction_logs_customer_email ON transaction_logs(customer_email);
            CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON transaction_logs(status);
            CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(create_table_query)
    
    async def create_transaction(self, transaction: TransactionRecord) -> Dict[str, Any]:
        """Create a new transaction record"""
        try:
            if not self.pool:
                await self.initialize()
            
            insert_query = """
                INSERT INTO transaction_logs (
                    payment_id, tier, amount, currency, customer_email, 
                    customer_name, status, provider, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, created_at, updated_at
            """
            
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow(
                    insert_query,
                    transaction.payment_id,
                    transaction.tier,
                    transaction.amount,
                    transaction.currency,
                    transaction.customer_email,
                    transaction.customer_name,
                    transaction.status,
                    transaction.provider,
                    json.dumps(transaction.metadata) if transaction.metadata else None
                )
                
                return {
                    "success": True,
                    "id": result["id"],
                    "payment_id": transaction.payment_id,
                    "created_at": result["created_at"],
                    "updated_at": result["updated_at"]
                }
                
        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_transaction(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """Get a transaction by payment ID"""
        try:
            if not self.pool:
                await self.initialize()
            
            query = """
                SELECT * FROM transaction_logs WHERE payment_id = $1
            """
            
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow(query, payment_id)
                
                if result:
                    return {
                        "id": result["id"],
                        "payment_id": result["payment_id"],
                        "tier": result["tier"],
                        "amount": float(result["amount"]),
                        "currency": result["currency"],
                        "customer_email": result["customer_email"],
                        "customer_name": result["customer_name"],
                        "status": result["status"],
                        "provider": result["provider"],
                        "metadata": result["metadata"],
                        "created_at": result["created_at"],
                        "updated_at": result["updated_at"]
                    }
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting transaction: {str(e)}")
            return None
    
    async def update_transaction_status(self, payment_id: str, status: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Update transaction status and metadata"""
        try:
            if not self.pool:
                await self.initialize()
            
            update_query = """
                UPDATE transaction_logs 
                SET status = $2, metadata = $3, updated_at = CURRENT_TIMESTAMP
                WHERE payment_id = $1
                RETURNING updated_at
            """
            
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow(
                    update_query,
                    payment_id,
                    status,
                    json.dumps(metadata) if metadata else None
                )
                
                return {
                    "success": True,
                    "payment_id": payment_id,
                    "status": status,
                    "updated_at": result["updated_at"]
                }
                
        except Exception as e:
            logger.error(f"Error updating transaction status: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_customer_transactions(self, customer_email: str, limit: int = 50) -> list:
        """Get all transactions for a customer"""
        try:
            if not self.pool:
                await self.initialize()
            
            query = """
                SELECT * FROM transaction_logs 
                WHERE customer_email = $1 
                ORDER BY created_at DESC 
                LIMIT $2
            """
            
            async with self.pool.acquire() as conn:
                results = await conn.fetch(query, customer_email, limit)
                
                return [
                    {
                        "id": result["id"],
                        "payment_id": result["payment_id"],
                        "tier": result["tier"],
                        "amount": float(result["amount"]),
                        "currency": result["currency"],
                        "customer_email": result["customer_email"],
                        "customer_name": result["customer_name"],
                        "status": result["status"],
                        "provider": result["provider"],
                        "metadata": result["metadata"],
                        "created_at": result["created_at"],
                        "updated_at": result["updated_at"]
                    }
                    for result in results
                ]
                
        except Exception as e:
            logger.error(f"Error getting customer transactions: {str(e)}")
            return []
    
    async def get_transaction_stats(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get transaction statistics"""
        try:
            if not self.pool:
                await self.initialize()
            
            date_filter = ""
            params = []
            if start_date and end_date:
                date_filter = "WHERE created_at BETWEEN $1 AND $2"
                params = [start_date, end_date]
            
            query = f"""
                SELECT 
                    COUNT(*) as total_transactions,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
                    SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_revenue,
                    AVG(CASE WHEN status = 'success' THEN amount ELSE NULL END) as avg_transaction_amount
                FROM transaction_logs {date_filter}
            """
            
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow(query, *params)
                
                return {
                    "total_transactions": result["total_transactions"],
                    "successful_transactions": result["successful_transactions"],
                    "pending_transactions": result["pending_transactions"],
                    "failed_transactions": result["failed_transactions"],
                    "total_revenue": float(result["total_revenue"]) if result["total_revenue"] else 0,
                    "avg_transaction_amount": float(result["avg_transaction_amount"]) if result["avg_transaction_amount"] else 0,
                    "success_rate": (result["successful_transactions"] / result["total_transactions"] * 100) if result["total_transactions"] > 0 else 0
                }
                
        except Exception as e:
            logger.error(f"Error getting transaction stats: {str(e)}")
            return {}
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Transaction logs database connection closed")
