// Configuración dinámica de Expo (SDK 57). Sustituye a app.json.
//
// Variables de entorno:
// - EXPO_PUBLIC_API_URL: URL de la API para builds EAS (ver eas.json). También se
//   expone en Constants.expoConfig.extra.apiUrl.
// - EAS_BUILD_PROFILE: lo define EAS en cada build ("development", "preview", "production").

const { withAndroidManifest } = require("@expo/config-plugins");

// SDK 57 ya no aplica android.usesCleartextTraffic desde la config, así que lo
// inyectamos directamente en el AndroidManifest con un config plugin.
function withCleartextTraffic(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const application =
      configWithManifest.modResults.manifest.application?.[0];
    if (application) {
      application.$["android:usesCleartextTraffic"] = "true";
    }
    return configWithManifest;
  });
}

const base = {
  name: "MODO GYM",
  slug: "modo-gym",
  version: "2.0.0",
  scheme: "modogym",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0d0d0f",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.modogym.app",
  },
  android: {
    package: "com.modogym.app",
    permissions: ["INTERNET"],
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0d0d0f",
    },
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: "http://localhost:3000",
    eas: {
      projectId: "d855b824-26be-4bb6-b090-cfb4f2c4e34d",
    },
  },
};

module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE || "development";
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    base.extra.apiUrl ||
    "http://localhost:3000";

  const plugins = ["expo-router"];
  if (profile === "preview") {
    // El APK de prueba conecta a una API en HTTP (LAN o VPS) sin certificado HTTPS.
    plugins.push(withCleartextTraffic);
  }

  return {
    ...base,
    plugins,
    extra: { ...base.extra, apiUrl },
    android: base.android,
  };
};
