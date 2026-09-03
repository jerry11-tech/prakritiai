from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.db.models import User, Document
from app.db.schemas import BrailleResponse
from app.services.braille_converter import BrailleConverter

router = APIRouter(prefix="/braille", tags=["Braille Accessibility"])

@router.get("/convert/{document_id}", response_model=BrailleResponse)
def convert_document_to_braille(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    full_text_blocks = []
    for elem in doc.layout_elements:
        full_text_blocks.append(f"[{elem.category}]\n{elem.extracted_text}\n")

    full_text = "\n".join(full_text_blocks)
    unicode_braille = BrailleConverter.text_to_unicode_braille(full_text)

    # Generate BRF file
    brf_filename = f"braille_doc_{doc.id}.brf"
    brf_filepath = os.path.join(settings.EXPORTS_DIR, brf_filename)
    BrailleConverter.generate_brf_file(full_text, brf_filepath)

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "grade1_braille": unicode_braille,
        "unicode_braille": unicode_braille,
        "brf_file_url": f"{settings.API_V1_STR}/braille/download/{doc.id}"
    }


@router.get("/download/{document_id}")
def download_brf_file(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    brf_filename = f"braille_doc_{document_id}.brf"
    brf_filepath = os.path.join(settings.EXPORTS_DIR, brf_filename)

    if not os.path.exists(brf_filepath):
        # Generate on the fly
        doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        full_text = "\n".join([f"[{e.category}]\n{e.extracted_text}\n" for e in doc.layout_elements])
        BrailleConverter.generate_brf_file(full_text, brf_filepath)

    return FileResponse(brf_filepath, media_type="text/plain", filename=f"braille_document_{document_id}.brf")
