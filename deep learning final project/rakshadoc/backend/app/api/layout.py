from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.db.models import User, Document, LayoutElement, AuditLog
from app.db.schemas import DocumentResponse, LayoutElementResponse
from app.services.preprocessor import DocumentPreprocessor
from app.services.layout_parser import layout_parser_service

router = APIRouter(prefix="/layout", tags=["Layout Analysis"])

from PIL import Image
import io

@router.post("/parse", response_model=DocumentResponse)
async def upload_and_parse_document(
    file: UploadFile = File(...),
    language: str = Form("hi"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.pdf')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PNG, JPG, JPEG, BMP or PDF."
        )

    content = await file.read()
    file_size = len(content)

    # 1. Preprocess & Enhance Image Quality per page (Denoise, CLAHE, Deskew)
    pages_data = DocumentPreprocessor.enhance_document_pages(content, file.filename)
    total_pages = len(pages_data)
    avg_quality = round(sum(p[2] for p in pages_data) / max(1, total_pages), 2)

    # Extract dimensions of first page
    first_page_img = Image.open(io.BytesIO(pages_data[0][1]))
    img_w, img_h = first_page_img.size

    # 2. Save preprocessed image (first page)
    filename_unique = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename_unique)
    with open(file_path, "wb") as f:
        f.write(pages_data[0][1])

    # 3. Create Document DB record
    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        language=language,
        quality_score=avg_quality,
        total_pages=total_pages,
        img_width=img_w,
        img_height=img_h,
        status="processed"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 4. Perform Layout Detection & Segmentation per page
    db_elements = []
    for page_num, page_bytes, page_quality, page_angle in pages_data:
        detected_elements = layout_parser_service.parse_document_layout(
            page_bytes,
            language=language,
            page_number=page_num
        )
        for elem in detected_elements:
            layout_elem = LayoutElement(
                document_id=doc.id,
                page_number=page_num,
                category=elem["category"],
                confidence=elem["confidence"],
                bbox_x1=elem["bbox_x1"],
                bbox_y1=elem["bbox_y1"],
                bbox_x2=elem["bbox_x2"],
                bbox_y2=elem["bbox_y2"],
                extracted_text=elem["extracted_text"],
                braille_text=elem["braille_text"]
            )
            db.add(layout_elem)
            db_elements.append(layout_elem)

    db.commit()
    db.refresh(doc)

    # Audit log
    audit = AuditLog(user_id=current_user.id, action="DOCUMENT_PARSED", details=f"Doc ID {doc.id} ({doc.filename}) parsed with {len(db_elements)} layout elements")
    db.add(audit)
    db.commit()

    return doc


@router.get("/documents", response_model=List[DocumentResponse])
def get_user_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return docs


@router.get("/document/{document_id}", response_model=DocumentResponse)
def get_document_details(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
