import psycopg2
from typing import List
from core.database import _get_connection
from core.embedder import _model

def retrieve_context(doc_id: int, question: str, limit: int = 5) -> str:
    """Tìm kiếm các chunks liên quan nhất đến câu hỏi bằng pgvector."""
    # 1. Embed câu hỏi thành vector
    question_embedding = _model.encode(question).tolist()
    
    # 2. Query pgvector để lấy chunks
    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # <=> là toán tử cosine distance trong pgvector
                # LIMIT 5 để lấy top 5 chunks gần nhất
                query = """
                    SELECT chunk_content 
                    FROM rag_core.document_chunks
                    WHERE chunk_document_id = %s
                    ORDER BY chunk_embedding <=> %s::vector
                    LIMIT %s
                """
                cur.execute(query, (doc_id, str(question_embedding), limit))
                rows = cur.fetchall()
                
                context_chunks = [row[0] for row in rows]
                return "\n\n".join(context_chunks)
    except Exception as e:
        print(f"[Retriever] Lỗi khi lấy context: {e}")
        return ""
    finally:
        conn.close()
