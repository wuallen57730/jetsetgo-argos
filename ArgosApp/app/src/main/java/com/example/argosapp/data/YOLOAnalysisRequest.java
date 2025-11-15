package com.example.argosapp.data;

// This class is used by Gson to serialize requests sent to the FastAPI backend
public class YOLOAnalysisRequest {
    String uld_id;
    String yolo_findings;

    public YOLOAnalysisRequest(String uld_id, String yolo_findings) {
        this.uld_id = uld_id;
        this.yolo_findings = yolo_findings;
    }
}