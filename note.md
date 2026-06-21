
Redis Stream (rag_task_stream)
        │
        │  XREADGROUP (đọc message)
        ▼
[Python Worker]
   1. Parse JSON message → lấy minioUrl, docId, fileName
   2. Tải file PDF từ MinIO về bộ nhớ
   3. Trích xuất văn bản từ PDF (PyPDF2)
   4. Chia nhỏ thành từng chunk (LangChain TextSplitter)
   5. Embedding từng chunk → vector 384 chiều (sentence-transformers)
   6. Lưu vector vào PostgreSQL + pgvector
   7. Cập nhật trạng thái Document → "completed"
   8. Gửi XACK về Redis để xác nhận đã xử lý xong







