package com.example.argosapp;

import com.example.argosapp.data.ULDReport;

// Abstract class with static subclasses to mimic Kotlin sealed classes
public abstract class AppStatus {
    private AppStatus() {}

    public static final class Idle extends AppStatus {}

    public static final class Processing extends AppStatus {
        public final String message;
        public Processing(String message) { this.message = message; }
    }

    public static final class Success extends AppStatus {
        public final ULDReport response;

        public Success(ULDReport response) {
            this.response = response;
        }
    }

    public static final class Error extends AppStatus {
        public final String message;
        public Error(String message) { this.message = message; }
    }
}