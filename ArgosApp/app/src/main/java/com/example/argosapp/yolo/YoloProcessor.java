package com.example.argosapp.yolo;

import android.graphics.Bitmap;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.argosapp.data.YoloDetection;
import com.google.gson.annotations.SerializedName;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public class YoloProcessor {

    private static final String TAG = "YoloProcessor";
    private static final String BASE_URL = "https://lima-wu-my-yolo-hackathon.hf.space/";
    private static final MediaType MEDIA_TYPE_JPEG = MediaType.parse("image/jpeg");
    private static final String[] FALLBACK_LABELS = {"normal", "squash", "breach"};

    private final RemoteYoloService remoteYoloService;

    public YoloProcessor() {
        OkHttpClient client = new OkHttpClient.Builder()
                .callTimeout(60, TimeUnit.SECONDS)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        remoteYoloService = retrofit.create(RemoteYoloService.class);
    }

    public List<YoloDetection> processImage(@Nullable Bitmap bitmap) {
        if (bitmap == null) {
            return Collections.emptyList();
        }
        try {
            MultipartBody.Part filePart = bitmapToPart(bitmap);
            Call<RemoteDetectionResponse> call = remoteYoloService.detect(filePart);
            Response<RemoteDetectionResponse> response = call.execute();
            if (response.isSuccessful() && response.body() != null) {
                return mapDetections(response.body());
            } else {
                Log.e(TAG, "Remote YOLO failed: " +
                        (response != null ? response.code() + " " + response.message() : "null response"));
            }
        } catch (Exception e) {
            Log.e(TAG, "Remote YOLO failure", e);
        }
        return Collections.emptyList();
    }

    private MultipartBody.Part bitmapToPart(@NonNull Bitmap bitmap) throws IOException {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, stream);
        byte[] bytes = stream.toByteArray();
        RequestBody requestBody = RequestBody.create(MEDIA_TYPE_JPEG, bytes);
        return MultipartBody.Part.createFormData("file", "capture.jpg", requestBody);
    }

    private List<YoloDetection> mapDetections(@NonNull RemoteDetectionResponse response) {
        if (response.detections == null || response.detections.isEmpty()) {
            return Collections.emptyList();
        }
        List<YoloDetection> mapped = new ArrayList<>(response.detections.size());
        for (RemoteDetection detection : response.detections) {
            if (detection == null) {
                continue;
            }
            String label = mapLabel(detection.classId, detection.label);
            List<Float> box = detection.boxNorm != null ? detection.boxNorm : Collections.emptyList();
            mapped.add(new YoloDetection(label, detection.confidence, box));
        }
        return mapped;
    }

    private String mapLabel(int classId, @Nullable String fallback) {
        if (classId >= 0 && classId < FALLBACK_LABELS.length) {
            return FALLBACK_LABELS[classId];
        }
        if (fallback != null && !fallback.trim().isEmpty()) {
            return fallback;
        }
        return String.format(Locale.US, "class_%d", classId);
    }

    private interface RemoteYoloService {
        @Multipart
        @POST("detect")
        Call<RemoteDetectionResponse> detect(@Part MultipartBody.Part file);
    }

    private static final class RemoteDetectionResponse {
        List<RemoteDetection> detections;
        String filename;
    }

    private static final class RemoteDetection {
        @SerializedName("box_norm")
        List<Float> boxNorm;

        @SerializedName("confidence")
        float confidence;

        @SerializedName("class_id")
        int classId;

        String label;
    }
}
