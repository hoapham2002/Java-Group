import os

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
STREAM_KEY = "rag_task_stream"
CONSUMER_GROUP = "rag_python_worker_group"
CONSUMER_NAME = "python_worker_1"

# ─── MinIO ────────────────────────────────────────────────────────────────────
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "12345678")
MINIO_SECURE = False  # HTTP, không phải HTTPS

# ─── PostgreSQL ───────────────────────────────────────────────────────────────
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", 5431))
PG_DATABASE = os.getenv("PG_DATABASE", "studyHubAI")
PG_USER = os.getenv("PG_USER", "admin")
PG_PASSWORD = os.getenv("PG_PASSWORD", "123456")

# ─── Embedding Model ──────────────────────────────────────────────────────────
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

# ─── Chunking ─────────────────────────────────────────────────────────────────
CHUNK_SIZE = 500       # Số ký tự tối đa mỗi chunk
CHUNK_OVERLAP = 50     # Số ký tự overlap giữa 2 chunk liền kề
