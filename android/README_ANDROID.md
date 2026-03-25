# Android build

This folder contains a minimal Android app wrapper for `https://deutschgram.metro-gatecontrol.de/`.

## What it already does

- Opens the hosted Deutschgram web app inside a full-screen WebView
- Keeps chat and call flow inside the app
- Grants camera and microphone access for WebRTC calls
- Opens invite links and personal links like `/mama` directly in the app

## What still comes next

- Native push notifications through Firebase Cloud Messaging (FCM)
- Incoming call notifications even when the app is closed
- A signed release APK or AAB

## Build in Android Studio

1. Open the `android` folder in Android Studio.
2. Let Android Studio sync Gradle.
3. If Android Studio asks to create or update the Gradle wrapper, allow it.
4. Build the debug APK from `Build -> Build Bundle(s) / APK(s) -> Build APK(s)`.
5. Install the generated APK on the phone.

## Base URL

The app currently loads:

`https://deutschgram.metro-gatecontrol.de/`

If you ever change the domain, update `DEUTSCHGRAM_BASE_URL` and `DEUTSCHGRAM_HOST` in `android/app/build.gradle`.