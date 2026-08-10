import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, setToken } from "../src/api";
import { theme } from "../src/theme";

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"login" | "register">(params.mode === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await api.login(email.trim(), password);
        setToken(res.accessToken);
      } else {
        const res = await api.register(email.trim(), password, name.trim());
        setToken(res.accessToken);
      }
      router.replace(mode === "register" ? "/onboarding" : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Accede a tu entrenamiento."
              : "Empieza hoy a transformar tu cuerpo."}
          </Text>

          {mode === "register" && (
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={theme.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={theme.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primary} onPress={submit} disabled={loading}>
            <Text style={styles.primaryText}>
              {loading ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </Text>
          </Pressable>

          <Pressable onPress={toggle}>
            <Text style={styles.toggle}>
              {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 28, gap: 14 },
  title: { color: theme.text, fontSize: 30, fontWeight: "900" },
  subtitle: { color: theme.muted, fontSize: 15, marginBottom: 12 },
  input: {
    backgroundColor: theme.bgSoft,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.text,
    padding: 16,
    fontSize: 16,
  },
  error: { color: theme.accent, fontSize: 14 },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  toggle: { color: theme.muted, textAlign: "center", marginTop: 8, fontSize: 14 },
});
