import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { goalLabels, theme } from "../../src/theme";

function bmiStatus(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#38bdf8" };
  if (bmi < 25) return { label: "Normal", color: "#22c55e" };
  if (bmi < 30) return { label: "Sobrepeso", color: "#fb923c" };
  return { label: "Obesidad", color: "#ef4444" };
}

export default function ProgressScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [data, me] = await Promise.all([api.myProgress(), api.me()]);
      setEntries(Array.isArray(data) ? data : []);
      setProfile(me?.profile ?? null);
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
      setMsg("Peso registrado ✓");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const height = profile?.heightCm;
  const startWeight = profile?.startWeightKg;
  const latest = entries[0];
  const previous = entries[1];
  const currentWeight = latest?.weightKg ?? startWeight;

  const bmi = height && currentWeight ? currentWeight / ((height / 100) * (height / 100)) : null;
  const status = bmi ? bmiStatus(bmi) : null;

  const daysSince = latest
    ? Math.max(0, Math.floor((Date.now() - new Date(latest.date).getTime()) / 86400000))
    : null;

  const diffVsStart =
    startWeight && currentWeight ? Number((currentWeight - startWeight).toFixed(1)) : null;
  const diffVsPrev =
    latest?.weightKg != null && previous?.weightKg != null
      ? Number((latest.weightKg - previous.weightKg).toFixed(1))
      : null;

  const goal = profile?.goal ?? "SALUD";
  const losing = goal === "PERDER_PESO";
  const gaining = goal === "GANAR_MASA";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        <Text style={styles.title}>Mi progreso</Text>
        <Text style={styles.subtitle}>Pésate una vez por semana y sigue tu evolución.</Text>

        {!loading && (height || currentWeight) ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Tu estado</Text>
            <View style={styles.statusRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{height ?? "—"}</Text>
                <Text style={styles.statLabel}>altura (cm)</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{startWeight ?? "—"}</Text>
                <Text style={styles.statLabel}>peso inicial</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentWeight ?? "—"}</Text>
                <Text style={styles.statLabel}>peso actual</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: status?.color }]}>
                  {bmi ? bmi.toFixed(1) : "—"}
                </Text>
                <Text style={styles.statLabel}>IMC</Text>
              </View>
            </View>
            {status ? (
              <View style={styles.bmiRow}>
                <Text style={[styles.bmiBadge, { color: status.color, borderColor: status.color }]}>
                  {status.label}
                </Text>
                {diffVsStart != null ? (
                  <Text style={styles.bmiNote}>
                    {diffVsStart === 0
                      ? "Mantienes tu peso inicial."
                      : `${Math.abs(diffVsStart)} kg ${diffVsStart > 0 ? "arriba" : "abajo"} del inicial.`}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {!loading && latest ? (
          <View style={styles.weighCard}>
            <Ionicons name="scale" size={22} color={theme.accent} />
            <View style={styles.weighBody}>
              <Text style={styles.weighTitle}>
                {daysSince != null && daysSince >= 7
                  ? "Ya toca tu pesaje semanal"
                  : "Pesaje semanal"}
              </Text>
              <Text style={styles.weighText}>
                {daysSince != null && daysSince < 7
                  ? `Te pesaste hace ${daysSince} día${daysSince === 1 ? "" : "s"}. Registra tu peso cada semana el mismo día.`
                  : daysSince != null && daysSince >= 7
                    ? `Pasaron ${daysSince} días desde tu último registro. ¡Pésate hoy!`
                    : "Registra tu primer peso para empezar a medir tu evolución."}
              </Text>
              {diffVsPrev != null ? (
                <Text style={styles.weighTrend}>
                  <Ionicons
                    name={diffVsPrev === 0 ? "remove" : diffVsPrev < 0 ? "trending-down" : "trending-up"}
                    size={13}
                    color={diffVsPrev === 0 ? theme.muted : diffVsPrev < 0 ? "#22c55e" : "#ef4444"}
                  />{" "}
                  {Math.abs(diffVsPrev)} kg respecto al registro anterior
                </Text>
              ) : null}
              {goal && (losing || gaining) ? (
                <Text style={styles.goalNote}>
                  Objetivo: {goalLabels[goal]}.{" "}
                  {gaining
                    ? "Subir de peso de forma controlada es la meta."
                    : losing
                      ? "Bajar de peso de forma sostenida es la meta."
                      : ""}
                </Text>
              ) : null}
            </View>
          </View>
        ) : !loading ? (
          <View style={styles.weighCard}>
            <Ionicons name="scale" size={22} color={theme.accent} />
            <View style={styles.weighBody}>
              <Text style={styles.weighTitle}>Primer pesaje</Text>
              <Text style={styles.weighText}>
                Registra tu peso actual. Después pésate cada semana el mismo día para ver la
                tendencia.
              </Text>
            </View>
          </View>
        ) : null}

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
            style={[styles.input, styles.notesInput]}
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
  statusCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 18,
    marginTop: 6,
  },
  statusTitle: { color: theme.text, fontWeight: "800", fontSize: 16, marginBottom: 14 },
  statusRow: { flexDirection: "row", gap: 6 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: theme.text, fontWeight: "900", fontSize: 20 },
  statLabel: { color: theme.muted, fontSize: 11, marginTop: 3, textTransform: "uppercase" },
  bmiRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  bmiBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontWeight: "800",
    fontSize: 13,
  },
  bmiNote: { color: theme.muted, fontSize: 13, flex: 1 },
  weighCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
  },
  weighBody: { flex: 1 },
  weighTitle: { color: theme.text, fontWeight: "800", fontSize: 16 },
  weighText: { color: theme.muted, fontSize: 14, marginTop: 4, lineHeight: 20 },
  weighTrend: { color: theme.text, fontSize: 14, marginTop: 6, fontWeight: "600" },
  goalNote: { color: theme.muted, fontSize: 13, marginTop: 6 },
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
  notesInput: { height: 80, textAlignVertical: "top" },
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
