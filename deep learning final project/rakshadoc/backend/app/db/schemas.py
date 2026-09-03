from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    full_name: str
    email: str
    role: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Layout Element Schemas ---
class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class LayoutElementCreate(BaseModel):
    category: str
    confidence: float
    bbox: BoundingBox
    extracted_text: Optional[str] = ""
    braille_text: Optional[str] = ""

class LayoutElementResponse(BaseModel):
    id: int
    page_number: int = 1
    category: str
    confidence: float
    bbox_x1: float
    bbox_y1: float
    bbox_x2: float
    bbox_y2: float
    extracted_text: str
    braille_text: str

    class Config:
        from_attributes = True


# --- Document Schemas ---
class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_path: Optional[str] = ""
    file_size: int
    language: str
    quality_score: float
    total_pages: int = 1
    img_width: Optional[int] = 800
    img_height: Optional[int] = 1000
    status: str
    created_at: datetime
    layout_elements: List[LayoutElementResponse] = []

    class Config:
        from_attributes = True


# --- Braille & Audio Response ---
class BrailleResponse(BaseModel):
    document_id: int
    filename: str
    grade1_braille: str
    unicode_braille: str
    brf_file_url: str

class AudioResponse(BaseModel):
    document_id: int
    audio_url: str
    transcript: str


# --- Admin Metrics Schema ---
class AdminMetrics(BaseModel):
    total_users: int
    total_documents: int
    total_layout_elements: int
    categories_breakdown: dict
    recent_activity: List[dict]
