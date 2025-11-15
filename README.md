# Argos - Cargo Damage Inspection System

A comprehensive AI-powered cargo damage inspection solution developed for the **8th Cathay Hackathon**. Argos combines mobile scanning capabilities with cloud-based analysis to streamline ULD (Unit Load Device) inspection workflows.

## Project Overview

Argos is a full-stack application designed to automate and enhance cargo damage inspection processes. The system leverages YOLO object detection for real-time damage identification and AI analysis for intelligent decision-making.

### Key Features

- **Mobile Scanning**: Android app for on-site cargo inspection with camera integration
- **Real-time Detection**: YOLO-based damage detection and classification
- **Cloud Analysis**: AI-powered analysis using Google Gemini for intelligent damage assessment
- **Dashboard Management**: Web-based dashboard for inventory tracking and reporting
- **Historical Tracking**: Complete scan history and trend analysis
- **Multi-stage Classification**: Traffic light system (Green/Yellow/Red) for ULD status

## Technology Stack

### Frontend

- **Android App**: Java, Material Design 3, Navigation Component, MVVM Architecture
- **Web Dashboard**: React, Tailwind CSS, TypeScript

### Backend

- **API Server**: FastAPI (Python)
- **Database**: SQLAlchemy with SQLite/PostgreSQL
- **ML Models**: YOLOv8 for object detection
- **AI Analysis**: Google Gemini API for intelligent damage assessment

### Mobile Technologies

- Android 12+ (API 26+)
- Jetpack Libraries (LiveData, ViewModel, Navigation)
- Retrofit for API communication
- Glide for image loading
- Material 3 UI Components

### Build & DevOps

- **Android**: Gradle 8.11.1, Java 11
- **Backend**: Python with FastAPI
- **Package Management**: npm for frontend dependencies

## Project Structure

```
ArgosApp/
├── app/                           # Android application
│   ├── src/main/java/            # Java source code
│   ├── src/main/res/             # Resources (layouts, strings, themes)
│   ├── src/androidTest/          # Instrumented tests
│   └── build.gradle.kts          # Build configuration
├── cloud_api/                    # YOLO detection service
└── tools/                        # Utility scripts
    └── export_yolo_ptl.py       # YOLO model export tool

ArgosDashboard/
├── backend/                      # FastAPI server
│   ├── main.py                  # Main application
│   └── check_models.py          # Model verification
└── frontend/                     # React dashboard
    └── src/
        ├── pages/               # Page components
        ├── components/          # Reusable components
        └── App.jsx             # Main app
```

## Getting Started

### Prerequisites

- Java 11+ (for Android development)
- Android SDK 35+
- Python 3.8+
- Node.js 16+
- Gradle 8.11.1

### Android App Setup

1. Clone the repository
2. Navigate to `ArgosApp` directory
3. Set up `local.properties` with your Android SDK path
4. Configure API endpoint in `ArgosApp/app/src/main/java/com/example/argosapp/data/ApiClient.java`
5. Build and run:
   ```bash
   ./gradlew build
   ```

### Backend Setup

1. Navigate to `ArgosDashboard/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables (e.g., `GOOGLE_API_KEY`)
4. Run the server: `python main.py`

### Frontend Setup

1. Navigate to `ArgosDashboard/frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Architecture Highlights

### MVVM Pattern (Android)

- `MainViewModel` manages app state and business logic
- LiveData for reactive UI updates
- Separation of concerns between UI and data layers

### Navigation

- Navigation Graph for fragment-based navigation
- Fragment-based architecture for modular UI

### API Integration

- Retrofit-based `ApiService` for cloud communication
- YoloProcessor for ML model inference

## Contact & Attribution

Developed as part of the **8th Cathay Hackathon** with a focus on improving cargo handling efficiency through intelligent automation.

---

**Built with ❤️ for Cathay Pacific Cargo**
