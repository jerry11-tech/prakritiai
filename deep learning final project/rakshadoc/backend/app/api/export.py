from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.db.models import User, Document
from app.services.exporter import ExporterService

router = APIRouter(prefix="/export", tags=["Document Exporters"])

@router.get("/download/{document_id}")
def export_document_format(
    document_id: int,
    format: str = Query("json", pattern="^(json|docx|pdf)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    output_filename = f"export_{doc.id}.{format}"
    output_filepath = os.path.join(settings.EXPORTS_DIR, output_filename)

    if format == "json":
        doc_dict = {
            "document_id": doc.id,
            "filename": doc.filename,
            "file_size": doc.file_size,
            "language": doc.language,
            "quality_score": doc.quality_score,
            "status": doc.status,
            "created_at": doc.created_at.isoformat(),
            "layout_elements": [
                {
                    "category": e.category,
                    "confidence": e.confidence,
                    "bbox": {"x1": e.bbox_x1, "y1": e.bbox_y1, "x2": e.bbox_x2, "y2": e.bbox_y2},
                    "extracted_text": e.extracted_text,
                    "braille_text": e.braille_text
                }
                for e in doc.layout_elements
            ]
        }
        ExporterService.export_json(doc_dict, output_filepath)
        return FileResponse(output_filepath, media_type="application/json", filename=f"{doc.filename}_layout.json")

    elif format == "docx":
        ExporterService.export_docx(doc, doc.layout_elements, output_filepath)
        return FileResponse(output_filepath, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=f"{doc.filename}_layout.docx")

    elif format == "pdf":
        ExporterService.export_pdf(doc, doc.layout_elements, output_filepath)
        return FileResponse(output_filepath, media_type="application/pdf", filename=f"{doc.filename}_searchable.pdf")
