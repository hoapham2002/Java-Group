import io
import boto3
from botocore.client import Config
from config import MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY

# Khởi tạo S3 client tương thích với MinIO một lần duy nhất
_s3_client = boto3.client(
    "s3",
    endpoint_url=f"http://{MINIO_ENDPOINT}",
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",  # MinIO yêu cầu region nhưng giá trị không quan trọng
)


def download_pdf_bytes(minio_url: str) -> bytes:
    """
    Tải file PDF từ MinIO về bộ nhớ dưới dạng bytes.
    
    Args:
        minio_url: Đường dẫn dạng "bucket_name/object_name.pdf"
        
    Returns:
        Nội dung file PDF dưới dạng bytes
    """
    # Tách bucket và object_name từ URL
    # VD: "studyhub/uuid-file.pdf" → bucket="studyhub", key="uuid-file.pdf"
    parts = minio_url.split("/", 1)
    if len(parts) != 2:
        raise ValueError(f"Invalid minio_url format: '{minio_url}'. Expected 'bucket/object'")
    
    bucket_name, object_name = parts[0], parts[1]
    
    print(f"[MinIO] Downloading '{object_name}' from bucket '{bucket_name}'...")
    
    buffer = io.BytesIO()
    _s3_client.download_fileobj(bucket_name, object_name, buffer)
    buffer.seek(0)
    
    pdf_bytes = buffer.read()
    print(f"[MinIO] Downloaded {len(pdf_bytes):,} bytes successfully.")
    return pdf_bytes
