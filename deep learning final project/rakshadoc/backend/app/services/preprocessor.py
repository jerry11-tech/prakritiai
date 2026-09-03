import cv2
import numpy as np
from PIL import Image, ImageDraw
import io
import pypdf

class DocumentPreprocessor:
    @staticmethod
    def enhance_document_pages(file_bytes: bytes, filename: str):
        """
        Handles single or multi-page documents (Images or PDFs).
        Returns list of tuples: [(page_num, enhanced_bytes, quality_score, angle), ...]
        """
        is_pdf = filename.lower().endswith('.pdf')
        if not is_pdf:
            enhanced_bytes, quality_score, angle = DocumentPreprocessor.enhance_document(file_bytes)
            return [(1, enhanced_bytes, quality_score, angle)]

        # Handle multi-page PDF document
        pages_result = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            total_pages = len(reader.pages)
            if total_pages == 0:
                enhanced_bytes, quality_score, angle = DocumentPreprocessor.enhance_document(file_bytes)
                return [(1, enhanced_bytes, quality_score, angle)]

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                mb = page.mediabox
                w_pdf = float(mb.width) if mb and mb.width > 0 else 800.0
                h_pdf = float(mb.height) if mb and mb.height > 0 else 1000.0
                page_ratio = w_pdf / h_pdf

                page_bytes = None
                
                # Check for embedded raster image matching full page ratio
                if len(page.images) > 0:
                    for img_item in page.images:
                        try:
                            img_data = img_item.data
                            pil_test = Image.open(io.BytesIO(img_data)).convert('RGB')
                            img_ratio = pil_test.width / float(pil_test.height)
                            if abs(img_ratio - page_ratio) < 0.2 and pil_test.height > 400:
                                page_bytes = img_data
                                break
                        except Exception:
                            pass
                
                if not page_bytes:
                    # Construct full page canvas matching exact page aspect ratio
                    target_w = 800
                    target_h = int(round(target_w / page_ratio))
                    
                    pil_img = Image.new('RGB', (target_w, target_h), color=(255, 255, 255))
                    draw = ImageDraw.Draw(pil_img)
                    draw.rectangle([5, 5, target_w - 5, target_h - 5], outline=(220, 225, 230), width=2)
                    
                    page_text = page.extract_text().strip()
                    if page_text:
                        lines = page_text.split('\n')
                        y = 40
                        for line in lines:
                            if y > target_h - 35: break
                            draw.text((45, y), line[:95], fill=(15, 23, 42))
                            y += 28
                    else:
                        draw.text((45, 45), f"Page {page_num} of {total_pages}", fill=(15, 23, 42))

                    img_buf = io.BytesIO()
                    pil_img.save(img_buf, format='PNG')
                    page_bytes = img_buf.getvalue()

                enhanced_bytes, quality_score, angle = DocumentPreprocessor.enhance_document(page_bytes)
                pages_result.append((page_num, enhanced_bytes, quality_score, angle))

            return pages_result
        except Exception as err:
            console_error = f"[Preprocessor ERROR] PDF parsing fallback: {err}"
            print(console_error)
            enhanced_bytes, quality_score, angle = DocumentPreprocessor.enhance_document(file_bytes)
            return [(1, enhanced_bytes, quality_score, angle)]

    @staticmethod
    def enhance_document(image_bytes: bytes):
        """
        Enhances low-quality, noisy, blurred, or ink-faded scanned documents.
        Applies Denoising, CLAHE (Contrast Limited Adaptive Histogram Equalization),
        and Deskewing.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        # 1. Convert to Gray
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Denoising
        denoised = cv2.fastNlMeansDenoising(gray, h=10, searchWindowSize=21, templateWindowSize=7)

        # 3. CLAHE Contrast Enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(denoised)

        # 4. Deskew Angle Estimate
        deskewed_gray, angle = DocumentPreprocessor._deskew(enhanced_gray)

        # 5. Estimate Quality Score
        laplacian_var = cv2.Laplacian(deskewed_gray, cv2.CV_64F).var()
        quality_score = min(100.0, round(float(laplacian_var) / 5.0, 2))

        # Convert back to RGB for AI models
        enhanced_rgb = cv2.cvtColor(deskewed_gray, cv2.COLOR_GRAY2RGB)

        # Encode back to PNG bytes
        _, buffer = cv2.imencode('.png', enhanced_rgb)
        enhanced_bytes = buffer.tobytes()

        return enhanced_bytes, quality_score, angle

    @staticmethod
    def _deskew(image):
        coords = np.column_stack(np.where(image < 200))
        if len(coords) < 10:
            return image, 0.0
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated, round(angle, 2)
