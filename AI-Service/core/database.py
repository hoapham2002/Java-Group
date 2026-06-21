from typing import List
import psycopg2
from psycopg2.extras import execute_values
from core.config import PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD


def _get_connection():
    """Tạo kết nối mới tới PostgreSQL."""
    return psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DATABASE,
        user=PG_USER,
        password=PG_PASSWORD,
    )


def save_chunks(doc_id: int, chunks: List[str], embeddings: List[List[float]]):
    """
    Lưu tất cả chunks và vector embeddings vào bảng rag_core.document_chunks.
    
    Args:
        doc_id: ID của Document trong bảng rag_core.documents
        chunks: Danh sách chuỗi text chunks
        embeddings: Danh sách vector tương ứng (384 chiều)
    """
    if len(chunks) != len(embeddings):
        raise ValueError(f"Mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings")

    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Chuẩn bị dữ liệu dạng list of tuples
                # Format: (chunk_index, chunk_content, chunk_embedding_as_str, chunk_document_id)
                rows = [
                    (i, chunk, str(embedding), doc_id)
                    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
                ]
                
                # Dùng execute_values để INSERT nhiều dòng hiệu quả (1 câu SQL)
                execute_values(
                    cur,
                    """
                    INSERT INTO rag_core.document_chunks 
                        (chunk_index, chunk_content, chunk_embedding, chunk_document_id)
                    VALUES %s
                    """,
                    rows,
                    template="(%s, %s, %s::vector, %s)",
                )
                
                print(f"[DB] Inserted {len(rows)} chunks for doc_id={doc_id}.")
    finally:
        conn.close()


def update_document_status(doc_id: int, status: str):
    """
    Cập nhật trạng thái xử lý của Document.
    
    Args:
        doc_id: ID của Document cần cập nhật
        status: Trạng thái mới ('processing', 'completed', 'failed')
    """
    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE rag_core.documents SET doc_status = %s WHERE doc_id = %s",
                    (status, doc_id),
                )
                print(f"[DB] Updated doc_id={doc_id} status → '{status}'.")
    finally:
        conn.close()
