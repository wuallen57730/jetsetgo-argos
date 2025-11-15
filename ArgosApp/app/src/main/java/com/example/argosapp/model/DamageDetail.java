package com.example.argosapp.model;

import androidx.annotation.NonNull;

public class DamageDetail {

    private final String title;
    private final String severityKey;
    private final String severityLabel;
    private final String suggestion;

    public DamageDetail(@NonNull String title,
                        @NonNull String severityKey,
                        @NonNull String severityLabel,
                        @NonNull String suggestion) {
        this.title = title;
        this.severityKey = severityKey;
        this.severityLabel = severityLabel;
        this.suggestion = suggestion;
    }

    @NonNull
    public String getTitle() {
        return title;
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
    public String getSuggestion() {
        return suggestion;
    }
}

