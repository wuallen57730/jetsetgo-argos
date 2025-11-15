package com.example.argosapp.data;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

// Simple Java singleton to mirror the original Kotlin object
public class ApiClient {

    // Use 10.0.2.2 to access the host machine from an Android emulator
//    private static final String BASE_URL = "http://10.0.2.2:8000/";
    private static final String BASE_URL = "http://192.168.194.39:8000/";
    private static ApiService apiServiceInstance;

    // Lazy initialization
    public static ApiService getApiService() {
        if (apiServiceInstance == null) {
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
            apiServiceInstance = retrofit.create(ApiService.class);
        }
        return apiServiceInstance;
    }
}