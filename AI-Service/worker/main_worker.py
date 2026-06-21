import json
import time
import redis
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("Worker")
from core.config import (
    REDIS_HOST, REDIS_PORT,
    STREAM_KEY, CONSUMER_GROUP, CONSUMER_NAME,
)
from worker.minio_client import download_pdf_bytes
from worker.pdf_processor import process_pdf
from core.embedder import embed_chunks
from core.database import save_chunks, update_document_status


def connect_redis() -> redis.Redis:
    """Khởi tạo kết nối Redis và đảm bảo Consumer Group tồn tại."""
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    
    try:
        r.xgroup_create(STREAM_KEY, CONSUMER_GROUP, id="0", mkstream=True)
        logger.info(f"Created Consumer Group '{CONSUMER_GROUP}' on stream '{STREAM_KEY}'.")
    except redis.exceptions.ResponseError as e:
        if "BUSYGROUP" in str(e):
            logger.info(f"Consumer Group '{CONSUMER_GROUP}' already exists. OK.")
        else:
            raise
    
    return r


def process_message(message_id: str, payload: dict):
    """
    Xử lý một message từ Redis Stream qua toàn bộ RAG pipeline.
    
    Args:
        message_id: ID của message trong Redis Stream (dùng để XACK)
        payload: Dict chứa docId, minioUrl, fileName
    """
    doc_id = int(payload["docId"])
    minio_url = payload["minioUrl"]
    file_name = payload["fileName"]
    
    logger.info(f"Processing doc_id={doc_id} | file='{file_name}'")
    
    # 1. Cập nhật trạng thái → processing
    update_document_status(doc_id, "processing")
    
    # 2. Tải PDF từ MinIO
    pdf_bytes = download_pdf_bytes(minio_url)
    
    # 3. Trích xuất text + chia chunks
    chunks = process_pdf(pdf_bytes)
    
    # 4. Embedding
    embeddings = embed_chunks(chunks)
    
    # 5. Lưu vào PostgreSQL
    save_chunks(doc_id, chunks, embeddings)
    
    # 6. Cập nhật trạng thái → completed
    update_document_status(doc_id, "completed")
    
    logger.info(f"✅ Successfully processed doc_id={doc_id}. {len(chunks)} chunks saved.")


def run():
    """Vòng lặp chính của Worker: đọc và xử lý message từ Redis Stream."""
    logger.info("Starting AI Worker...")
    r = connect_redis()
    logger.info(f"Listening on stream '{STREAM_KEY}' as '{CONSUMER_NAME}'...")
    
    while True:
        try:
            # XREADGROUP: chờ tối đa 5 giây để có message mới
            # ">" nghĩa là chỉ lấy message chưa được deliver cho consumer nào
            messages = r.xreadgroup(
                groupname=CONSUMER_GROUP,
                consumername=CONSUMER_NAME,
                streams={STREAM_KEY: ">"},
                count=1,        # Xử lý 1 message mỗi lần để đảm bảo an toàn
                block=5000,     # Block tối đa 5000ms (5 giây)
            )
            
            if not messages:
                # Hết timeout, không có message → tiếp tục vòng lặp
                # logger.debug("No new messages. Waiting...")
                continue
            
            # messages có dạng: [(stream_key, [(message_id, {field: value})])]
            for stream_name, message_list in messages:
                for message_id, fields in message_list:
                    try:
                        # Parse JSON payload từ field "payload"
                        payload = json.loads(fields["payload"])
                        
                        process_message(message_id, payload)
                        
                        # XACK: báo Redis đã xử lý thành công → xóa khỏi PEL
                        r.xack(STREAM_KEY, CONSUMER_GROUP, message_id)
                        logger.info(f"XACK message_id={message_id}")
                        
                    except Exception as e:
                        # Không XACK → Redis giữ lại message trong PEL để retry sau
                        logger.error(f"❌ Error processing message_id={message_id}: {e}", exc_info=True)
        
        except KeyboardInterrupt:
            logger.info("Shutting down gracefully...")
            break
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}. Retrying in 3s...")
            time.sleep(3)


if __name__ == "__main__":
    run()
