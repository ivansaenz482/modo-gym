import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { theme } from "../../src/theme";

export default function NutritionScreen() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await api.myNutrition();
      const plans = Array.isArray(data) ? data : [];
      setPlan(plans[0] ?? null);
    } catch {
      setMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const generate = async () => {
    setGenerating(true);
    setMsg("");
    try {
      await api.generateNutrition();
      await load();
      setMsg("Plan nutricional generado con IA 🥗");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error generando plan");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        <Text style={styles.title}>Nutrición</Text>
        <Text style={styles.subtitle}>Tu rutina de alimentación según tu objetivo.</Text>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={styles.loader} />
        ) : plan ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{plan.name}</Text>
            <Text style={styles.cardSubtitle}>Meta diaria</Text>
            <View style={styles.macroRow}>
              <View style={styles.macro}>
                <Text style={styles.macroValue}>{plan.dailyCalories ?? "—"}</Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroValue}>{plan.proteinG ?? "—"}g</Text>
                <Text style={styles.macroLabel}>proteína</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroValue}>{plan.carbsG ?? "—"}g</Text>
                <Text style={styles.macroLabel}>carbos</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroValue}>{plan.fatG ?? "—"}g</Text>
                <Text style={styles.macroLabel}>grasas</Text>
              </View>
            </View>
            {plan.notes ? <Text style={styles.notes}>{plan.notes}</Text> : null}
          </View>
        ) : (
          <Text style={styles.empty}>
            Aún no tienes plan nutricional. Deja que la IA lo calcule según tu perfil.
          </Text>
        )}

        <Pressable style={styles.primary} onPress={generate} disabled={generating}>
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.primaryText}>Generar plan con IA</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  loader: { marginTop: 40 },
  content: { padding: 24, gap: 14, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 8 },
  subtitle: { color: theme.muted, fontSize: 15 },
  msg: {
    color: theme.accent,
    backgroundColor: "rgba(255,59,48,0.12)",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  cardTitle: { color: theme.text, fontWeight: "900", fontSize: 20 },
  cardSubtitle: { color: theme.muted, fontSize: 13, marginTop: 4, marginBottom: 16 },
  macroRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  macro: { alignItems: "center", flex: 1 },
  macroValue: { color: theme.accent, fontWeight: "900", fontSize: 20 },
  macroLabel: { color: theme.muted, fontSize: 12, marginTop: 2, textTransform: "uppercase" },
  notes: { color: theme.text, fontSize: 14, lineHeight: 20, marginTop: 16 },
  empty: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
