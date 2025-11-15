package com.example.argosapp.data;

// Data model returned by the FastAPI service
public class ULDReport {
    private String uld_id;
    private String status; // "green", "yellow", "red"
    private String damage_category;
    private String maintenance_suggestion;

    // Getters (needed for Gson deserialization)
    public String getUld_id() { return uld_id; }
    public String getStatus() { return status; }
    public String getDamage_category() { return damage_category; }
    public String getMaintenance_suggestion() { return maintenance_suggestion; }
}