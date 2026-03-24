import os
import json
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["GLOG_minloglevel"] = "3" 
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_textline_orientation=True, lang='en')
res = ocr.ocr(r"d:\skripsi\ocr-docu-check\tmp\32c9a9ff-005d-4cce-b500-b8844a1e04fe.jpg")
print("\n--- OCR OUTPUT ---")
print(type(res))
print(len(res))
if len(res) > 0:
    print(type(res[0]))
    print(len(res[0]))
    for i, line in enumerate(res[0][:3]):
        print(f"Item {i}: {line}")
