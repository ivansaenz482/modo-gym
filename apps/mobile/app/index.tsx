import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../src/theme";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.brand}>
          MODO<Text style={styles.brandAccent}>GYM</Text>
        </Text>
        <Text style={styles.title}>Forja tu mejor versión</Text>
        <Text style={styles.subtitle}>
          Tu rutina, tu alimentación y tu progreso en un solo lugar. Con la
          inteligencia artificial de MODO GYM.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.primary} onPress={() => router.push("/login")}>
            <Text style={styles.primaryText}>Ingresar</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={() => router.push("/login?mode=register")}>
            <Text style={styles.ghostText}>Crear mi cuenta</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>Tu entrenador personal con IA está listo.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  brand: {
    color: theme.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1,
  },
  brandAccent: { color: theme.accent },
  title: {
    color: theme.text,
    fontSize: 46,
    fontWeight: "900",
    lineHeight: 48,
    textTransform: "uppercase",
  },
  subtitle: {
    color: theme.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: { gap: 12, marginTop: 24 },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ghost: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ghostText: { color: theme.text, fontWeight: "700", fontSize: 16 },
  hint: { color: theme.muted, fontSize: 13, textAlign: "center", marginTop: 8 },
});
