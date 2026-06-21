# AI Study Hub - Hệ thống Quản lý Tài liệu Học tập Tích hợp AI

Dự án này là một hệ thống quản lý tài liệu học tập, cho phép người dùng tải lên các tài liệu PDF, quản lý, chia sẻ và đặc biệt là **trò chuyện trực tiếp với tài liệu bằng AI** (RAG - Retrieval-Augmented Generation).

---

## 🛠️ Công nghệ sử dụng trong dự án

### Frontend (FE)
* Sử dụng **ReactJS** (Vite) để xây dựng giao diện người dùng.
* Giao diện Chat AI và hiển thị PDF tích hợp.

### Backend (BE)
* Sử dụng **Java Spring Boot** làm API Gateway và quản lý nghiệp vụ (User, JWT, Document CRUD).
* Tương tác bảo mật giữa Frontend và AI Service.

### AI Service (Python)
* Sử dụng **FastAPI** để phục vụ các luồng Chat AI.
* Xử lý Background Worker (chia nhỏ PDF, nhúng vector) lắng nghe qua **Redis Stream**.
* Mô hình LLM: **Ollama (qwen2.5:7b)** chạy local.
* Mô hình nhúng (Embedding): **SentenceTransformers (all-MiniLM-L6-v2)**.

### Cơ sở dữ liệu & Hạ tầng
* **PostgreSQL + pgvector**: Lưu trữ dữ liệu hệ thống và lưu trữ Vector DB cho các đoạn text.
* **MinIO**: Lưu trữ Object Storage (chứa các file PDF).
* **Redis**: Message Queue cho luồng xử lý RAG.
* **Docker**: Quản lý các container cơ sở dữ liệu.

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng (Quick Start)

Dưới đây là các lệnh cần thiết để người khác clone về và chạy toàn bộ hệ thống. Bạn cần mở tổng cộng **5 Terminal** để chạy đầy đủ các dịch vụ.

### Bước 1: Khởi động Hạ tầng (Cơ sở dữ liệu)
*Yêu cầu: Máy đã cài đặt Docker và Docker Compose.*
```bash
cd BE-Java
docker-compose up -d
```
*(Lệnh này sẽ khởi động PostgreSQL ở cổng 5431, Redis ở cổng 6379, và MinIO ở cổng 9000 & 9001. Chỉ cần chạy 1 lần).*

### Bước 2: Khởi động Backend (Spring Boot)
*Yêu cầu: Đã cài đặt JDK 17+*
Mở Terminal 1:
```bash
cd BE-Java
./gradlew bootRun
```

### Bước 3: Khởi động Frontend (React)
*Yêu cầu: Đã cài đặt NodeJS 18+*
Mở Terminal 2:
```bash
cd FE-React
npm install
npm run dev
```

### Bước 4: Khởi động AI-Service (Python)
*Yêu cầu: Đã cài đặt Python 3.10+*
Mở Terminal 3 (Chạy API Chat):
```bash
cd AI-Service
pip install -r requirements.txt
uvicorn api.main_api:app --host 0.0.0.0 --port 8000
```

Mở Terminal 4 (Chạy Worker xử lý PDF ngầm):
```bash
cd AI-Service
python -m worker.main_worker
```

### Bước 5: Khởi động AI Model (Ollama)
*Yêu cầu: Đã cài đặt phần mềm [Ollama](https://ollama.com).*
Mở Terminal 5:
```bash
ollama run qwen2.5:7b
```
*(Lần đầu tiên chạy sẽ mất thời gian tải model dung lượng khoảng 4.7GB. Sau khi tải xong hiện ra dấu `>>>`, bạn có thể thu nhỏ terminal này lại).*

---

## 📌 Kiến trúc luồng AI (RAG)

1. Người dùng Upload file PDF ở Frontend.
2. Spring Boot lưu file vào MinIO và bắn tin nhắn vào Redis Stream.
3. Python Worker nhận tin nhắn, tải file từ MinIO, cắt nhỏ (chunking) và nhúng (embedding) lưu vào PostgreSQL (pgvector).
4. Người dùng gõ câu hỏi ở khung Chat.
5. Spring Boot đẩy câu hỏi sang FastAPI.
6. FastAPI tìm các đoạn text liên quan nhất trong PostgreSQL, ghép vào câu hỏi và gửi sang Ollama.
7. Ollama trả về câu trả lời thông minh dựa trên nội dung tài liệu.
