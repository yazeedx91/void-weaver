"""
🧬 MEMORY MANAGER
Long-term memory using Supabase + pgvector for context retrieval
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import numpy as np
from supabase import create_client, Client

class MemoryManager:
    """🧠 Memory Manager - Vector-based long-term memory"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.embedding_model = "text-embedding-3-small"  # OpenAI embedding model
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for text using OpenAI"""
        try:
            from openai import OpenAI
            import os
            
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * 1536
    
    async def add_memory(
        self,
        content: str,
        session_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add a new memory to the database"""
        try:
            # Get embedding
            embedding = await self._get_embedding(content)
            
            # Insert memory
            memory_data = {
                "session_id": session_id,
                "content": content,
                "embedding": embedding,
                "metadata": metadata or {},
                "created_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table("memories").insert(memory_data).execute()
            
            if result.data:
                return result.data[0]["id"]
            else:
                raise Exception("Failed to insert memory")
                
        except Exception as e:
            print(f"Error adding memory: {e}")
            raise
    
    async def get_relevant_memories(
        self,
        query: str,
        session_id: Optional[str] = None,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant memories using vector similarity"""
        try:
            # Get query embedding
            query_embedding = await self._get_embedding(query)
            
            # Build the query
            sql_query = """
            SELECT 
                id,
                session_id,
                content,
                metadata,
                created_at,
                1 - (embedding <=> $1::vector) as similarity
            FROM memories
            WHERE 1 - (embedding <=> $1::vector) > $2
            """
            
            params = [query_embedding, similarity_threshold]
            
            # Add session filter if provided
            if session_id:
                sql_query += " AND session_id = $3"
                params.append(session_id)
            
            # Add ordering and limit
            sql_query += " ORDER BY similarity DESC LIMIT $"
            params.append(len(params) + 1)
            sql_query += str(len(params))
            
            # Execute query
            result = self.supabase.rpc(
                "search_memories",
                {
                    "query_embedding": query_embedding,
                    "similarity_threshold": similarity_threshold,
                    "session_filter": session_id,
                    "limit_count": limit
                }
            ).execute()
            
            if result.data:
                return result.data
            else:
                return []
                
        except Exception as e:
            print(f"Error retrieving memories: {e}")
            return []
    
    async def get_session_memories(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get all memories for a specific session"""
        try:
            result = self.supabase.table("memories")\
                .select("*")\
                .eq("session_id", session_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"Error getting session memories: {e}")
            return []
    
    async def delete_memory(self, memory_id: str) -> bool:
        """Delete a specific memory"""
        try:
            result = self.supabase.table("memories")\
                .delete()\
                .eq("id", memory_id)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error deleting memory: {e}")
            return False
    
    async def clear_session_memories(self, session_id: str) -> bool:
        """Clear all memories for a session"""
        try:
            result = self.supabase.table("memories")\
                .delete()\
                .eq("session_id", session_id)\
                .execute()
            
            return True
            
        except Exception as e:
            print(f"Error clearing session memories: {e}")
            return False
    
    async def search_memories_by_content(
        self,
        search_term: str,
        session_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search memories by content (full-text search)"""
        try:
            query = self.supabase.table("memories")\
                .select("*")\
                .ilike("content", f"%{search_term}%")
            
            if session_id:
                query = query.eq("session_id", session_id)
            
            result = query\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"Error searching memories: {e}")
            return []
    
    async def get_memory_stats(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Get statistics about memories"""
        try:
            query = self.supabase.table("memories")\
                .select("id, session_id, created_at")
            
            if session_id:
                query = query.eq("session_id", session_id)
            
            result = query.execute()
            memories = result.data or []
            
            # Calculate stats
            total_memories = len(memories)
            sessions = len(set(m["session_id"] for m in memories))
            
            if memories:
                oldest = min(m["created_at"] for m in memories)
                newest = max(m["created_at"] for m in memories)
            else:
                oldest = newest = None
            
            return {
                "total_memories": total_memories,
                "unique_sessions": sessions,
                "oldest_memory": oldest,
                "newest_memory": newest,
                "session_id": session_id
            }
            
        except Exception as e:
            print(f"Error getting memory stats: {e}")
            return {
                "total_memories": 0,
                "unique_sessions": 0,
                "oldest_memory": None,
                "newest_memory": None,
                "session_id": session_id
            }
