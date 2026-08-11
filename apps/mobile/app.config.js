// Configuración dinámica de Expo (SDK 57). Sustituye a app.json.
//
// Variables de entorno:
// - EXPO_PUBLIC_API_URL: URL de la API para builds EAS (ver eas.json). También se
//   expone en Constants.expoConfig.extra.apiUrl.
// - EAS_BUILD_PROFILE: lo define EAS en cada build ("development", "preview", "production").

const base = {
  name: "MODO GYM",
  slug: "modo-gym",
  version: "2.0.0",
  scheme: "modogym",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.modogym.app",
  },
  android: {
    package: "com.modogym.app",
    permissions: ["INTERNET"],
  },
  androidStatusBar: {
    backgroundColor: "#0d0d0f",
  },
  plugins: [
    "expo-router",
    ["expo-splash-screen", { backgroundColor: "#0d0d0f" }],
  ],
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

  const android = { ...base.android };
  if (profile === "preview") {
    // El APK de prueba conecta a una API en HTTP (LAN o VPS) sin certificado HTTPS.
    android.usesCleartextTraffic = true;
  }

  return {
    ...base,
    extra: { ...base.extra, apiUrl },
    android,
  };
};
