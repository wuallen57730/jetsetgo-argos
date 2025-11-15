from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI(title="Argos YOLO API", version="1.0")
model = YOLO("yolov8s.pt")

LABEL_MAP = {0: "normal", 1: "breach", 2: "squeeze", 3: "leakage"}


@app.get("/")
async def health_check():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(image, imgsz=640, conf=0.25)[0]

    detections = []
    for box in results.boxes:
        cls = int(box.cls.item())
        score = float(box.conf.item())
        xyxy = box.xyxy.tolist()[0]
        detections.append(
            {
                "class_id": cls,
                "label": LABEL_MAP.get(cls, f"class_{cls}"),
                "confidence": score,
                "bbox": xyxy,
            }
        )

    top_detection = max(detections, key=lambda d: d["confidence"], default=None)

    return JSONResponse({"detections": detections, "top_result": top_detection})

