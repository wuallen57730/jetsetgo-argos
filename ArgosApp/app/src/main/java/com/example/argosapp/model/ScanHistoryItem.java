package com.example.argosapp.model;

import androidx.annotation.NonNull;

public class ScanHistoryItem {

    private final String uldId;
    private final String severityKey;
    private final String severityLabel;
    private final String summary;
    private final String damageTitle;
    private final String suggestion;
    private final String imageUri;
    private final long timestamp;

    public ScanHistoryItem(@NonNull String uldId,
                           @NonNull String severityKey,
                           @NonNull String severityLabel,
                           @NonNull String summary,
                           @NonNull String damageTitle,
                           @NonNull String suggestion,
                           @NonNull String imageUri,
                           long timestamp) {
        this.uldId = uldId;
        this.severityKey = severityKey;
        this.severityLabel = severityLabel;
        this.summary = summary;
        this.damageTitle = damageTitle;
        this.suggestion = suggestion;
        this.imageUri = imageUri;
        this.timestamp = timestamp;
    }

    @NonNull
    public String getUldId() {
        return uldId;
    }

    @NonNull
    public String getSeverityKey() {
        return severityKey;
    }

    @NonNull
    public String getSeverityLabel() {
        return severityLabel;
    }

    @NonNull
    public String getSummary() {
        return summary;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @NonNull
    public String getDamageTitle() {
        return damageTitle;
    }

    @NonNull
    public String getSuggestion() {
        return suggestion;
    }

    @NonNull
    public String getImageUri() {
        return imageUri;
    }
}

