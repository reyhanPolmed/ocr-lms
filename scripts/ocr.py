"""
ocr.py — PaddleOCR script for text extraction
Usage: python scripts/ocr.py <image_path>

Outputs JSON to stdout: { "success": true, "text": "..." }
                     or: { "success": false, "error": "..." }
"""

import sys
import json
import os
import warnings

# Force stdout to use utf-8 to prevent charmap errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Must be set BEFORE importing paddle/paddleocr
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["GLOG_minloglevel"] = "3"  # Suppress C++ glog output

# Suppress Python warnings
warnings.filterwarnings("ignore")

# Redirect stderr to devnull to suppress C++ logging from paddle
import contextlib


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({"success": False, "error": f"File not found: {image_path}"}))
        sys.exit(1)

    try:
        # Redirect stderr at file descriptor level to suppress C++ output
        devnull_fd = os.open(os.devnull, os.O_WRONLY)
        old_stderr_fd = os.dup(2)
        os.dup2(devnull_fd, 2)
        os.close(devnull_fd)

        from paddleocr import PaddleOCR

        # Initialize PaddleOCR (v3.4+ API)
        # use_textline_orientation=True → detect rotated text
        # lang='en' → English; change to 'id' for Indonesian, etc.
        ocr = PaddleOCR(use_textline_orientation=True, lang='en')

        lines = []
        is_pdf = image_path.lower().endswith('.pdf')

        if is_pdf:
            import fitz
            doc = fitz.open(image_path)
            for i in range(len(doc)):
                page = doc[i]
                pix = page.get_pixmap(dpi=150)
                temp_img_path = f"{image_path}_page_{i}.png"
                pix.save(temp_img_path)
                
                # Run OCR on the page image
                try:
                    result = ocr.ocr(temp_img_path)
                finally:
                    # Cleanup temp image
                    if os.path.exists(temp_img_path):
                        os.remove(temp_img_path)
                    
                if result and len(result) > 0 and result[0]:
                    lines.append(f"--- Halaman {i+1} ---")
                    page_data = result[0]
                    if isinstance(page_data, dict) and 'rec_texts' in page_data:
                        lines.extend(page_data['rec_texts'])
                    elif isinstance(page_data, list):
                        for line in page_data:
                            if len(line) > 1 and isinstance(line[1], tuple):
                                text = line[1][0]
                                lines.append(text)
        else:
            # Run OCR on single image
            result = ocr.ocr(image_path)

            # Extract text lines from result
            if result and len(result) > 0 and result[0]:
                page_data = result[0]
                # Handle new PaddleOCR 3.x dict format
                if isinstance(page_data, dict) and 'rec_texts' in page_data:
                    lines.extend(page_data['rec_texts'])
                # Handle older PaddleOCR list format
                elif isinstance(page_data, list):
                    for line in page_data:
                        # Each line: [box_coords, (text, confidence)]
                        if len(line) > 1 and isinstance(line[1], tuple):
                            text = line[1][0]
                            lines.append(text)

        extracted_text = "\n".join(lines) if lines else "(Tidak ada teks yang terdeteksi)"

        # Restore stderr
        os.dup2(old_stderr_fd, 2)
        os.close(old_stderr_fd)

        print(json.dumps({"success": True, "text": extracted_text}, ensure_ascii=False))

    except ImportError:
        # Restore stderr if needed
        try:
            os.dup2(old_stderr_fd, 2)
            os.close(old_stderr_fd)
        except:
            pass
        print(json.dumps({
            "success": False,
            "error": "PaddleOCR belum terinstal. Jalankan: pip install paddlepaddle paddleocr"
        }))
        sys.exit(1)
    except Exception as e:
        # Restore stderr if needed
        try:
            os.dup2(old_stderr_fd, 2)
            os.close(old_stderr_fd)
        except:
            pass
        import traceback
        err_msg = str(e) + "\n" + traceback.format_exc()
        print(json.dumps({"success": False, "error": err_msg}))
        sys.exit(1)


if __name__ == "__main__":
    main()
