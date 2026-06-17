from fastapi import FastAPI, HTTPException
from api.schemas import ChatRequest, ChatResponse
from api.retriever import retrieve_context
from api.llm_client import generate_answer
import uvicorn
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("API")

app = FastAPI(title="AI Study Hub - Chat API")

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    logger.info(f"Nhận request chat cho docId={request.docId}, question='{request.question}'")
    try:
        # 1. Lấy ngữ cảnh từ pgvector
        context = retrieve_context(request.docId, request.question)
        
        if not context:
            logger.warning("Không tìm thấy ngữ cảnh.")
            return ChatResponse(answer="Xin lỗi, tôi không tìm thấy thông tin nào liên quan trong tài liệu này.")
            
        # 2. Gọi LLM sinh câu trả lời
        logger.info("Đã tìm thấy ngữ cảnh, đang gọi LLM...")
        answer = generate_answer(request.question, context)
        
        logger.info("Đã có câu trả lời.")
        return ChatResponse(answer=answer)
    except Exception as e:
        logger.error(f"Lỗi trong endpoint /chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    uvicorn.run("api.main_api:app", host="0.0.0.0", port=8000, reload=True)
