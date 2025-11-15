package com.example.argosapp.model;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.List;

public class ScanResultUiModel {

    private final String uldId;
    private final String severityKey;
    private final String severityLabel;
    private final String severityDescription;
    private final String primaryDamageTitle;
    private final String primarySuggestion;
    private final String yoloSummary;
    @Nullable
    private final Uri imageUri;
    private final long timestamp;
    private final List<DamageDetail> damageDetails;

    public ScanResultUiModel(@NonNull String uldId,
                             @NonNull String severityKey,
                             @NonNull String severityLabel,
                             @NonNull String severityDescription,
                             @NonNull String primaryDamageTitle,
                             @NonNull String primarySuggestion,
                             @NonNull String yoloSummary,
                             @Nullable Uri imageUri,
                             long timestamp,
                             @NonNull List<DamageDetail> damageDetails) {
        this.uldId = uldId;
        this.severityKey = severityKey;
        this.severityLabel = severityLabel;
        this.severityDescription = severityDescription;
        this.primaryDamageTitle = primaryDamageTitle;
        this.primarySuggestion = primarySuggestion;
        this.yoloSummary = yoloSummary;
        this.imageUri = imageUri;
        this.timestamp = timestamp;
        this.damageDetails = damageDetails;
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
    public String getSeverityDescription() {
        return severityDescription;
    }

    @NonNull
    public String getPrimaryDamageTitle() {
        return primaryDamageTitle;
    }

    @NonNull
    public String getPrimarySuggestion() {
        return primarySuggestion;
    }

    @NonNull
    public String getYoloSummary() {
        return yoloSummary;
    }

    @Nullable
    public Uri getImageUri() {
        return imageUri;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @NonNull
    public List<DamageDetail> getDamageDetails() {
        return damageDetails;
    }
}

