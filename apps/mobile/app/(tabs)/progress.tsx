import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { theme } from "../../src/theme";

export default function ProgressScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await api.myProgress();
      setEntries(Array.isArray(data) ? data : []);
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

  const save = async () => {
    if (!weight) return;
    setSaving(true);
    setMsg("");
    try {
      await api.createProgress({ weightKg: Number(weight), notes: notes || undefined });
      setWeight("");
      setNotes("");
      await load();
      setMsg("Progreso guardado ✓");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        <Text style={styles.title}>Registra tu progreso</Text>
        <Text style={styles.subtitle}>
          Tu peso, tus medidas y tus resultados. La IA los usa para ajustar tu plan.
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Peso actual (kg)"
            placeholderTextColor={theme.muted}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Notas (opcional)"
            placeholderTextColor={theme.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Pressable style={styles.primary} onPress={save} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Guardar registro</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.section}>Historial</Text>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : entries.length === 0 ? (
          <Text style={styles.empty}>Aún no tienes registros.</Text>
        ) : (
          entries.map((e) => (
            <View key={e.id} style={styles.entry}>
              <Ionicons name="trending-up" size={20} color={theme.accent} />
              <View style={styles.entryBody}>
                <Text style={styles.entryDate}>
                  {new Date(e.date).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {e.notes ? <Text style={styles.entryNotes}>{e.notes}</Text> : null}
              </View>
              <Text style={styles.entryValue}>{e.weightKg ? `${e.weightKg} kg` : "—"}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
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
  form: { gap: 12, marginTop: 8 },
  input: {
    backgroundColor: theme.bgSoft,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.text,
    padding: 16,
    fontSize: 16,
  },
  notes: { height: 80, textAlignVertical: "top" },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  section: { color: theme.text, fontWeight: "800", fontSize: 18, marginTop: 16 },
  empty: { color: theme.muted, fontSize: 14 },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
  },
  entryBody: { flex: 1 },
  entryDate: { color: theme.text, fontWeight: "700", fontSize: 14 },
  entryNotes: { color: theme.muted, fontSize: 13, marginTop: 2 },
  entryValue: { color: theme.text, fontWeight: "900", fontSize: 16 },
});
