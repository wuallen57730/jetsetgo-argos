package com.example.argosapp;

import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.argosapp.R;
import com.example.argosapp.data.ApiClient;
import com.example.argosapp.data.ApiService;
import com.example.argosapp.data.ULDReport;
import com.example.argosapp.data.YOLOAnalysisRequest;
import com.example.argosapp.data.YoloDetection;
import com.example.argosapp.model.DamageDetail;
import com.example.argosapp.model.ScanHistoryItem;
import com.example.argosapp.model.ScanResultUiModel;
import com.example.argosapp.yolo.YoloProcessor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import retrofit2.Response;

public class MainViewModel extends AndroidViewModel {

    private final YoloProcessor yoloProcessor;
    private final ApiService apiService;
    private final ExecutorService executorService;

    private final MutableLiveData<AppStatus> _status = new MutableLiveData<>(new AppStatus.Idle());
    public final LiveData<AppStatus> status = _status;

    private final MutableLiveData<ScanResultUiModel> _latestResult = new MutableLiveData<>();
    public final LiveData<ScanResultUiModel> latestResult = _latestResult;

    private final MutableLiveData<List<ScanHistoryItem>> _history = new MutableLiveData<>(new ArrayList<>());
    public final LiveData<List<ScanHistoryItem>> history = _history;

    private final MutableLiveData<String> userDisplayName;
    private final MutableLiveData<Uri> lastCapturedImage = new MutableLiveData<>();
    private final SharedPreferences historyPrefs;

    private static final String PREF_HISTORY = "argos_history";
    private static final String KEY_HISTORY_PREFIX = "history_";
    private static final String DEFAULT_USER_KEY = "guest";

    @Nullable
    private Uri pendingImageUri;
    private String latestYoloFindings = "";
    private String pendingUldId = "ULD-PHOTO";
    private String currentUserKey = DEFAULT_USER_KEY;

    public MainViewModel(@NonNull Application application) {
        super(application);
        yoloProcessor = new YoloProcessor();
        apiService = ApiClient.getApiService();
        executorService = Executors.newSingleThreadExecutor();
        String defaultName = application.getString(R.string.scan_default_user_name);
        userDisplayName = new MutableLiveData<>(defaultName);
        historyPrefs = application.getSharedPreferences(PREF_HISTORY, Context.MODE_PRIVATE);
        loadHistoryForCurrentUser();
    }

    public void setPendingImageUri(@Nullable Uri uri) {
        this.pendingImageUri = uri;
        lastCapturedImage.postValue(uri);
    }

    public void processImageAndUpload(Bitmap bitmap) {
        executorService.execute(() -> {
            try {
                _status.postValue(new AppStatus.Processing("Detecting damage with local AI (YOLO)..."));
                List<YoloDetection> detections = yoloProcessor.processImage(bitmap);

                DetectionSummary detectionSummary = buildDetectionSummary(detections);

                if (!detectionSummary.hasDetection) {
                    _status.postValue(new AppStatus.Processing(
                            getApplication().getString(R.string.scan_status_no_detection)
                    ));
                    detections = Collections.singletonList(
                            new com.example.argosapp.data.YoloDetection("normal", 1.0f, Collections.emptyList())
                    );
                } else {
                    _status.postValue(new AppStatus.Processing(
                            getApplication().getString(
                                    R.string.scan_status_uploading_with_detection,
                                    detectionSummary.label,
                                    detectionSummary.confidencePercent
                            )
                    ));
                }

                String yoloFindings = convertDetectionsToString(detections);
                latestYoloFindings = yoloFindings;
                pendingUldId = "ULD-PHOTO-" + System.currentTimeMillis();

                YOLOAnalysisRequest request = new YOLOAnalysisRequest(
                        pendingUldId,
                        yoloFindings
                );

                callApi(request);

            } catch (Exception e) {
                _status.postValue(new AppStatus.Error("Processing failed: " + e.getMessage()));
            }
        });
    }

    public void simulateAndUpload(String uldId, String findings) {
        executorService.execute(() -> {
            try {
                pendingUldId = uldId;
                latestYoloFindings = findings;
                pendingImageUri = null;
                lastCapturedImage.postValue(null);

                YOLOAnalysisRequest request = new YOLOAnalysisRequest(pendingUldId, findings);

                _status.postValue(new AppStatus.Processing("Simulating upload: '" + findings + "' ..."));
                callApi(request);

            } catch (Exception e) {
                _status.postValue(new AppStatus.Error("Simulation failed: " + e.getMessage()));
            }
        });
    }

    public void resetStatus() {
        _status.postValue(new AppStatus.Idle());
    }

    public LiveData<String> getUserDisplayName() {
        return userDisplayName;
    }

    public void updateDisplayName(@Nullable String identifier) {
        userDisplayName.postValue(deriveDisplayName(identifier));
        String newKey = sanitizeIdentifier(identifier);
        if (!newKey.equals(currentUserKey)) {
            currentUserKey = newKey;
            loadHistoryForCurrentUser();
        }
    }

    public LiveData<Uri> getLastCapturedImage() {
        return lastCapturedImage;
    }

    private void callApi(YOLOAnalysisRequest request) throws IOException {
        Response<ULDReport> response = apiService.analyzeDetections(request).execute();

        if (response.isSuccessful() && response.body() != null) {
            ULDReport report = response.body();
            handleSuccessfulReport(report);
            _status.postValue(new AppStatus.Success(report));
        } else {
            _status.postValue(new AppStatus.Error("API Error: " + response.code() + " " + response.message()));
        }
    }

    private void handleSuccessfulReport(ULDReport report) {
        String normalizedStatus = normalizeStatus(report.getStatus());
        SeverityMeta meta = mapSeverity(normalizedStatus);

        String primaryDamage = report.getDamage_category() != null
                ? report.getDamage_category()
                : meta.defaultDamageLabel;
        String suggestion = report.getMaintenance_suggestion() != null
                ? report.getMaintenance_suggestion()
                : meta.defaultSuggestion;
        String resolvedUldId = report.getUld_id() != null ? report.getUld_id() : pendingUldId;

        List<DamageDetail> details = new ArrayList<>();
        details.add(new DamageDetail(
                primaryDamage,
                normalizedStatus,
                meta.label,
                suggestion
        ));

        ScanResultUiModel result = new ScanResultUiModel(
                resolvedUldId,
                normalizedStatus,
                meta.label,
                meta.description,
                primaryDamage,
                suggestion,
                latestYoloFindings,
                pendingImageUri,
                System.currentTimeMillis(),
                Collections.unmodifiableList(details)
        );

        _latestResult.postValue(result);
        appendHistory(result);

        // reset the pending image reference once we've consumed it
        pendingImageUri = null;
    }

    private void appendHistory(ScanResultUiModel result) {
        List<ScanHistoryItem> current = _history.getValue();
        if (current == null) {
            current = new ArrayList<>();
        }
        List<ScanHistoryItem> updated = new ArrayList<>(current.size() + 1);
        updated.add(new ScanHistoryItem(
                result.getUldId(),
                result.getSeverityKey(),
                result.getSeverityLabel(),
                result.getSeverityDescription(),
                result.getPrimaryDamageTitle(),
                result.getPrimarySuggestion(),
                result.getImageUri() != null ? result.getImageUri().toString() : "",
                result.getTimestamp()
        ));
        updated.addAll(current);
        _history.postValue(Collections.unmodifiableList(updated));
        persistHistory(updated);
    }

    private String normalizeStatus(@Nullable String status) {
        if (status == null) {
            return "unknown";
        }
        return status.toLowerCase(Locale.US);
    }

    private SeverityMeta mapSeverity(String status) {
        switch (status) {
            case "green":
                return new SeverityMeta("green", "Serviceable", "ULD is ready for service", "No visible damage", "Continue regular inspections");
            case "yellow":
                return new SeverityMeta("yellow", "Maintenance required", "Plan maintenance as soon as possible", "Minor damage detected", "Contact the maintenance team");
            case "red":
                return new SeverityMeta("red", "Out of service", "Severe damage detected, stop operation", "Major structural damage", "Remove from service and notify maintenance");
            default:
                return new SeverityMeta("unknown", "Unknown status", "Please rescan to confirm", "Status unclear", "Run another inspection");
        }
    }

    private String convertDetectionsToString(List<YoloDetection> detections) {
        if (detections == null || detections.isEmpty()) {
            return "no damage";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Found ").append(detections.size()).append(" potential issues: ");
        for (YoloDetection detection : detections) {
            sb.append(detection.getClassName())
                    .append(" (confidence: ")
                    .append(String.format(Locale.US, "%.2f", detection.getConfidence()))
                    .append("); ");
        }
        return sb.toString();
    }

    private String sanitizeIdentifier(@Nullable String identifier) {
        if (identifier == null) {
            return DEFAULT_USER_KEY;
        }
        String trimmed = identifier.trim().toLowerCase(Locale.US);
        if (trimmed.isEmpty()) {
            return DEFAULT_USER_KEY;
        }
        String sanitized = trimmed.replaceAll("[^a-z0-9]+", "_");
        return sanitized.isEmpty() ? DEFAULT_USER_KEY : sanitized;
    }

    private String buildHistoryKey() {
        return KEY_HISTORY_PREFIX + currentUserKey;
    }

    private void loadHistoryForCurrentUser() {
        String raw = historyPrefs.getString(buildHistoryKey(), null);
        if (raw == null || raw.isEmpty()) {
            _history.postValue(Collections.unmodifiableList(new ArrayList<>()));
            return;
        }

        try {
            JSONArray array = new JSONArray(raw);
            List<ScanHistoryItem> loaded = new ArrayList<>(array.length());
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                loaded.add(new ScanHistoryItem(
                        obj.optString("uldId", ""),
                        obj.optString("severityKey", "unknown"),
                        obj.optString("severityLabel", ""),
                        obj.optString("summary", ""),
                        obj.optString("damageTitle", ""),
                        obj.optString("suggestion", ""),
                        obj.optString("imageUri", ""),
                        obj.optLong("timestamp", 0L)
                ));
            }
            _history.postValue(Collections.unmodifiableList(loaded));
        } catch (JSONException e) {
            _history.postValue(Collections.unmodifiableList(new ArrayList<>()));
        }
    }

    private void persistHistory(List<ScanHistoryItem> historyList) {
        JSONArray array = new JSONArray();
        for (ScanHistoryItem item : historyList) {
            JSONObject obj = new JSONObject();
            try {
                obj.put("uldId", item.getUldId());
                obj.put("severityKey", item.getSeverityKey());
                obj.put("severityLabel", item.getSeverityLabel());
                obj.put("summary", item.getSummary());
                obj.put("damageTitle", item.getDamageTitle());
                obj.put("suggestion", item.getSuggestion());
                obj.put("imageUri", item.getImageUri());
                obj.put("timestamp", item.getTimestamp());
                array.put(obj);
            } catch (JSONException ignored) {
            }
        }
        historyPrefs.edit().putString(buildHistoryKey(), array.toString()).apply();
    }

    private String deriveDisplayName(@Nullable String identifier) {
        String fallback = getApplication().getString(R.string.scan_default_user_name);
        if (identifier == null) {
            return fallback;
        }
        String trimmed = identifier.trim();
        if (trimmed.isEmpty()) {
            return fallback;
        }
        int atIndex = trimmed.indexOf('@');
        if (atIndex > 0) {
            trimmed = trimmed.substring(0, atIndex);
        }
        trimmed = trimmed.replace('_', ' ').replace('.', ' ').replace('-', ' ');
        String[] tokens = trimmed.split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String token : tokens) {
            if (token.isEmpty()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            String lower = token.toLowerCase(Locale.getDefault());
            builder.append(Character.toUpperCase(lower.charAt(0)));
            if (lower.length() > 1) {
                builder.append(lower.substring(1));
            }
        }
        if (builder.length() == 0) {
            return trimmed.toUpperCase(Locale.getDefault());
        }
        return builder.toString();
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        executorService.shutdown();
    }

    private DetectionSummary buildDetectionSummary(@Nullable List<YoloDetection> detections) {
        if (detections == null || detections.isEmpty()) {
            return new DetectionSummary(false, "", 0);
        }
        YoloDetection detection = detections.get(0);
        int confidencePercent = Math.round(Math.max(0f, Math.min(1f, detection.getConfidence())) * 100f);
        return new DetectionSummary(true, formatDetectionLabel(detection.getClassName()), confidencePercent);
    }

    private String formatDetectionLabel(@Nullable String rawLabel) {
        if (rawLabel == null) {
            return getApplication().getString(R.string.scan_detection_unknown_label);
        }
        String trimmed = rawLabel.trim();
        if (trimmed.isEmpty()) {
            return getApplication().getString(R.string.scan_detection_unknown_label);
        }
        String lower = trimmed.toLowerCase(Locale.US);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private static final class SeverityMeta {
        final String key;
        final String label;
        final String description;
        final String defaultDamageLabel;
        final String defaultSuggestion;

        private SeverityMeta(String key, String label, String description, String defaultDamageLabel, String defaultSuggestion) {
            this.key = key;
            this.label = label;
            this.description = description;
            this.defaultDamageLabel = defaultDamageLabel;
            this.defaultSuggestion = defaultSuggestion;
        }
    }

    private static final class DetectionSummary {
        final boolean hasDetection;
        final String label;
        final int confidencePercent;

        private DetectionSummary(boolean hasDetection, String label, int confidencePercent) {
            this.hasDetection = hasDetection;
            this.label = label;
            this.confidencePercent = confidencePercent;
        }
    }
}