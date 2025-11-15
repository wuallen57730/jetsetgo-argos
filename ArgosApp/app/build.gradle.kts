plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.argosapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.argosapp"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {

    implementation(libs.appcompat)
    implementation(libs.material) // (M3 函式庫)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.navigation:navigation-fragment:2.7.7")
    implementation("androidx.navigation:navigation-ui:2.7.7")
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)

    // --- ViewModel 和 LiveData (狀態管理) ---
    implementation("androidx.lifecycle:lifecycle-viewmodel:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata:2.7.0")

    // --- Retrofit (處理 API 請求) ---
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // --- 圖片載入 (Glide) - 方便將照片顯示在畫面上 ---
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // --- (*** 1. 關鍵新增 ***) ---
    // 這是 Android 12+ 官方的啟動畫面 API
    implementation("androidx.core:core-splashscreen:1.0.1")
}