package com.example.argosapp.data;

import java.util.List;

// Simple POJO to mirror the original Kotlin data class
public class YoloDetection {
    private String className;
    private float confidence;
    private List<Float> box;

    public YoloDetection(String className, float confidence, List<Float> box) {
        this.className = className;
        this.confidence = confidence;
        this.box = box;
    }

    // Gson requires getters for serialization/deserialization
    public String getClassName() { return className; }
    public float getConfidence() { return confidence; }
    public List<Float> getBox() { return box; }
}