package com.example.argosapp.data;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {

    // Calls the FastAPI `/api/ai/analyze` endpoint with YOLOAnalysisRequest and expects ULDReport
    @POST("/api/ai/analyze")
    Call<ULDReport> analyzeDetections(@Body YOLOAnalysisRequest request);
}