import io
from typing import List
import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter
from core.config import CHUNK_SIZE, CHUNK_OVERLAP


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Trích xuất toàn bộ text từ file PDF (dạng bytes).
    
    Args:
        pdf_bytes: Nội dung file PDF dưới dạng bytes
        
    Returns:
        Chuỗi text đã được trích xuất từ tất cả các trang
    """
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    
    full_text = []
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            full_text.append(text.strip())
    
    result = "\n\n".join(full_text)
    print(f"[PDF] Extracted {len(result):,} characters from {len(reader.pages)} pages.")
    return result


def split_text_into_chunks(text: str) -> List[str]:
    """
    Chia nhỏ text thành các chunks với RecursiveCharacterTextSplitter.
    
    Args:
        text: Chuỗi text đầy đủ cần chia nhỏ
        
    Returns:
        Danh sách các chuỗi chunk
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        # Thứ tự ưu tiên tách: đoạn văn → dòng → dấu câu → ký tự
        separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    )
    
    chunks = splitter.split_text(text)
    # Lọc bỏ các chunk rỗng hoặc quá ngắn (< 20 ký tự)
    chunks = [c.strip() for c in chunks if len(c.strip()) >= 20]
    
    print(f"[PDF] Split into {len(chunks)} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP}).")
    return chunks


def process_pdf(pdf_bytes: bytes) -> List[str]:
    """
    Hàm tổng hợp: nhận bytes → trả về danh sách chunks.
    """
    text = extract_text_from_pdf(pdf_bytes)
    if not text:
        raise ValueError("Could not extract any text from the PDF. The file may be empty or image-based.")
    return split_text_into_chunks(text)
