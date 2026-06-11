from typing import List
from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL, EMBEDDING_DIM

print(f"[Embedder] Loading model '{EMBEDDING_MODEL}'... (this may take a moment)")
_model = SentenceTransformer(EMBEDDING_MODEL)
print(f"[Embedder] Model loaded. Output dimension: {EMBEDDING_DIM}")


def embed_chunks(chunks: List[str]) -> List[List[float]]:
    """
    Chuyển đổi danh sách text chunks thành danh sách vector embeddings.
    
    Args:
        chunks: Danh sách chuỗi text cần embedding
        
    Returns:
        Danh sách vector (mỗi vector là list float 384 chiều)
    """
    print(f"[Embedder] Embedding {len(chunks)} chunks...")
    
    # batch_size=32 để tối ưu tốc độ trên CPU
    embeddings = _model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
    )
    
    result = [emb.tolist() for emb in embeddings]
    print(f"[Embedder] Done. Each vector has {len(result[0])} dimensions.")
    return result
