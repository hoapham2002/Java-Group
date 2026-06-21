from pydantic import BaseModel

class ChatRequest(BaseModel):
    docId: int
    question: str

class ChatResponse(BaseModel):
    answer: str
