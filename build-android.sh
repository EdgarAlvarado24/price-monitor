#!/bin/bash
# Build script for Al Cambio - Release APK

set -e

echo "🔨 Al Cambio - Build Release APK"
echo "================================"

export ANDROID_HOME="/home/edgar-alvarado/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

cd "$(dirname "$0")/android"

echo "📦 Compilando APK release (esto tarda varios minutos)..."
echo "    (primera vez: codegen + build, puede tomar 5-10 min)"

./gradlew assembleRelease

APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo ""
    echo "✅ APK generado: $APK_PATH"
    echo "   Tamaño: $SIZE"
    echo ""
    echo "📱 Para instalar en tu dispositivo:"
    echo "   adb install $APK_PATH"
else
    echo "❌ Error: No se encontró el APK"
    find app/build -name "*.apk" -type f 2>/dev/null
    exit 1
fi
