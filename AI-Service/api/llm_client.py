import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5:7b"

def generate_answer(question: str, context: str) -> str:
    """Gọi Ollama API với model qwen2.5 để trả lời câu hỏi dựa trên context."""
    prompt = f"""Bạn là một trợ lý ảo học tập thông minh. 
Sử dụng ngữ cảnh được cung cấp dưới đây để trả lời câu hỏi của người dùng một cách chính xác và ngắn gọn bằng tiếng Việt.
Nếu ngữ cảnh không chứa thông tin để trả lời, hãy nói rằng "Tôi không tìm thấy thông tin trong tài liệu này" và đừng tự bịa ra thông tin.

Ngữ cảnh:
{context}

Câu hỏi:
{question}

Câu trả lời:"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        print(f"[LLM] Đang gửi request tới Ollama ({MODEL_NAME})...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=300)
        response.raise_for_status()
        data = response.json()
        print("[LLM] Đã nhận được phản hồi từ Ollama.")
        return data.get("response", "Lỗi: Không nhận được phản hồi từ mô hình.")
    except Exception as e:
        print(f"[LLM] Ollama API Error: {e}")
        return "Xin lỗi, hiện tại tôi không thể kết nối tới mô hình AI để tạo câu trả lời. Vui lòng đảm bảo Ollama đang chạy."
