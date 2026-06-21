import os
from functools import lru_cache

import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering

MODEL_DIR = os.getenv(
    "LOCAL_MODEL_DIR",
    "D:/Workspace/projects/Java-Group/AI-Service/models/xlm-roberta-qa"
)

BASE_TOKENIZER = os.getenv("BASE_TOKENIZER", "xlm-roberta-base")


@lru_cache(maxsize=1)
def _load_tokenizer():
    try:
        return AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=True)
    except Exception:
        return AutoTokenizer.from_pretrained(BASE_TOKENIZER, use_fast=True)


@lru_cache(maxsize=1)
def _load_model():
    device_map = "auto" if torch.cuda.is_available() else None
    model = AutoModelForQuestionAnswering.from_pretrained(
        MODEL_DIR,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map=device_map,
        local_files_only=True,
    )
    model.eval()
    if not torch.cuda.is_available():
        model.to("cpu")
    return model


def _predict_answer(question: str, context: str) -> str:
    tokenizer = _load_tokenizer()
    model = _load_model()

    # Thêm return_offsets_mapping=True để biết vị trí chính xác của từng token thuộc về question hay context
    inputs = tokenizer(
        question,
        context,
        add_special_tokens=True,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        return_offsets_mapping=True 
    )

    offset_mapping = inputs.pop("offset_mapping")[0]
    # Xác định các token thuộc về phần context (bỏ qua phần câu hỏi và token đặc biệt)
    sequence_ids = inputs.sequence_ids(0)

    device = next(model.parameters()).device
    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)

    start_logits = outputs.start_logits[0]
    end_logits = outputs.end_logits[0]

    # Masking (Che) các token không thuộc phần context bằng giá trị cực âm để model không chọn nhầm vào câu hỏi
    for i in range(len(sequence_ids)):
        if sequence_ids[i] != 1:  # 1 đại diện cho phần văn bản thứ hai (context)
            start_logits[i] = -10000.0
            end_logits[i] = -10000.0

    # Lấy index có xác suất cao nhất
    start_index = int(torch.argmax(start_logits).item())
    end_index = int(torch.argmax(end_logits).item())

    # Kiểm tra tính hợp lệ của index
    if start_index >= len(sequence_ids) or end_index >= len(sequence_ids) or end_index < start_index:
        return "Tôi không tìm thấy thông tin trong tài liệu này."

    # Kiểm tra xem khoảng trích xuất có ký tự thực sự hay không
    if offset_mapping[start_index] == (0, 0) or offset_mapping[end_index] == (0, 0):
        return "Tôi không tìm thấy thông tin trong tài liệu này."

    # Cắt chính xác đoạn text câu trả lời gốc từ context, không sợ bị lỗi decode ký tự đặc biệt
    input_ids = inputs["input_ids"][0][start_index:end_index + 1]
    answer = tokenizer.decode(input_ids, skip_special_tokens=True).strip()

    return answer


def generate_answer(question: str, context: str) -> str:
    """Sinh câu trả lời từ model QA local dựa trên context."""
    if not context or not context.strip():
        return "Tôi không tìm thấy thông tin trong tài liệu này."

    try:
        answer = _predict_answer(question, context)

        if not answer:
            return "Tôi không tìm thấy thông tin trong tài liệu này."

        return answer

    except Exception as e:
        print(f"[LLM] Local model error: {e}")
        return "Xin lỗi, hiện tại tôi không thể chạy model local. Hãy kiểm tra lại tokenizer, model weights, và thư mục LOCAL_MODEL_DIR."