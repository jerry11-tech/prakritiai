from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.db.models import User, Document
from app.db.schemas import AudioResponse
from app.services.tts_engine import TTSEngine

router = APIRouter(prefix="/tts", tags=["Text-to-Speech Accessibility"])

@router.get("/speech/{document_id}", response_model=AudioResponse)
def generate_document_speech(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    speech_parts = []
    speech_parts.append(f"Document title: {doc.filename}. Layout scanning completed.")

    for elem in doc.layout_elements:
        speech_parts.append(f"Detected {elem.category}. Content: {elem.extracted_text}")

    full_transcript = ". ".join(speech_parts)
    mp3_filename = f"speech_doc_{doc.id}.mp3"
    mp3_filepath = os.path.join(settings.EXPORTS_DIR, mp3_filename)

    TTSEngine.generate_audio_speech(full_transcript, mp3_filepath, language=doc.language)

    return {
        "document_id": doc.id,
        "audio_url": f"{settings.API_V1_STR}/tts/audio/{doc.id}",
        "transcript": full_transcript
    }


@router.get("/audio/{document_id}")
def stream_audio_file(document_id: int, db: Session = Depends(get_db)):
    mp3_filename = f"speech_doc_{document_id}.mp3"
    mp3_filepath = os.path.join(settings.EXPORTS_DIR, mp3_filename)

    if not os.path.exists(mp3_filepath):
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Audio file not found")
        full_transcript = ". ".join([f"Detected {e.category}. Content: {e.extracted_text}" for e in doc.layout_elements])
        TTSEngine.generate_audio_speech(full_transcript, mp3_filepath, language=doc.language)

    return FileResponse(mp3_filepath, media_type="audio/mpeg", filename=f"speech_{document_id}.mp3")
