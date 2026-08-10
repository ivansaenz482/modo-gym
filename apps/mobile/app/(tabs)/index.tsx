import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { goalLabels, theme } from "../../src/theme";

export default function RoutineScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<"view" | "generate" | "custom">("view");
  const [days, setDays] = useState(3);
  const [goal, setGoal] = useState("GANAR_MASA");
  const [exp, setExp] = useState("INTERMEDIO");
  const [customName, setCustomName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [rs, exs] = await Promise.all([api.myRoutines(), api.exercises()]);
      setRoutines(Array.isArray(rs) ? rs : []);
      setExercises(Array.isArray(exs) ? exs : []);
    } catch {
      setMsg("No se pudo conectar con el servidor. Revisa tu API.");
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
      await api.generateRoutine({ daysPerWeek: days, goal, experience: exp });
      await load();
      setMode("view");
      setMsg("¡Rutina generada con IA! 🎉");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error generando rutina");
    } finally {
      setGenerating(false);
    }
  };

  const saveCustom = async () => {
    if (selected.length === 0 || !customName.trim()) return;
    setMsg("");
    try {
      await api.createRoutine({
        name: customName,
        daysPerWeek: days,
        exercises: selected.map((id, i) => ({
          exerciseId: id,
          order: i + 1,
          sets: 3,
          reps: "10-12",
        })),
      });
      await load();
      setMode("view");
      setSelected([]);
      setCustomName("");
      setMsg("Rutina guardada ✓");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error guardando rutina");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={theme.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const active = routines[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        {mode === "view" && !active && (
          <>
            <Text style={styles.title}>Tu rutina</Text>
            <Text style={styles.subtitle}>
              No tienes rutina todavía. Déjale a la IA crearla o arma la tuya.
            </Text>
            <Pressable style={styles.primary} onPress={() => setMode("generate")}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.primaryText}>Generar con IA</Text>
            </Pressable>
            <Pressable style={styles.ghost} onPress={() => setMode("custom")}>
              <Ionicons name="construct" size={18} color={theme.text} />
              <Text style={styles.ghostText}>Armar mi propia rutina</Text>
            </Pressable>
          </>
        )}

        {mode === "view" && active && (
          <>
            <Text style={styles.title}>{active.name}</Text>
            <Text style={styles.subtitle}>
              {active.source === "IA" ? "Generada por inteligencia artificial" : "Rutina personal"} ·{" "}
              {active.daysPerWeek} días/semana
            </Text>
            <View style={styles.routineCard}>
              {active.exercises.map((re: any, i: number) => (
                <View key={re.id} style={styles.exerciseRow}>
                  <Text style={styles.exerciseIndex}>{i + 1}</Text>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{re.exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {re.sets} series × {re.reps}
                      {re.weightKg ? ` · ${re.weightKg} kg` : ""} · descanso {re.restSeconds}s
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.rowActions}>
              <Pressable style={styles.ghost} onPress={() => setMode("generate")}>
                <Text style={styles.ghostText}>Nueva con IA</Text>
              </Pressable>
              <Pressable style={styles.ghost} onPress={() => setMode("custom")}>
                <Text style={styles.ghostText}>Armar otra</Text>
              </Pressable>
            </View>
          </>
        )}

        {mode === "generate" && (
          <>
            <Text style={styles.title}>Generar con IA</Text>
            <Text style={styles.label}>Días por semana</Text>
            <View style={styles.chips}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <Pressable
                  key={d}
                  style={[styles.chip, days === d && styles.chipActive]}
                  onPress={() => setDays(d)}
                >
                  <Text style={[styles.chipText, days === d && styles.chipTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Objetivo</Text>
            <View style={styles.chips}>
              {Object.keys(goalLabels).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.chip, goal === g && styles.chipActive]}
                  onPress={() => setGoal(g)}
                >
                  <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>
                    {goalLabels[g]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.primary} onPress={generate} disabled={generating}>
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Generar ahora</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setMode("view")}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </>
        )}

        {mode === "custom" && (
          <>
            <Text style={styles.title}>Arma tu rutina</Text>
            <Text style={styles.subtitle}>
              Elige los ejercicios que sabes hacer y agrégales series y repeticiones.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la rutina"
              placeholderTextColor={theme.muted}
              value={customName}
              onChangeText={setCustomName}
            />
            {exercises.map((ex) => {
              const on = selected.includes(ex.id);
              return (
                <Pressable
                  key={ex.id}
                  style={[styles.selectRow, on && styles.selectRowActive]}
                  onPress={() =>
                    setSelected((s) =>
                      on ? s.filter((x) => x !== ex.id) : [...s, ex.id],
                    )
                  }
                >
                  <Ionicons
                    name={on ? "checkbox" : "square-outline"}
                    size={20}
                    color={on ? theme.accent : theme.muted}
                  />
                  <Text style={styles.selectText}>{ex.name}</Text>
                  <Text style={styles.selectMeta}>{ex.muscleGroup}</Text>
                </Pressable>
              );
            })}
            <Pressable style={styles.primary} onPress={saveCustom}>
              <Text style={styles.primaryText}>Guardar rutina</Text>
            </Pressable>
            <Pressable onPress={() => setMode("view")}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  loader: { marginTop: 60 },
  content: { padding: 24, gap: 12, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 30, fontWeight: "900", marginTop: 8 },
  subtitle: { color: theme.muted, fontSize: 15, marginBottom: 8 },
  msg: {
    color: theme.accent,
    backgroundColor: "rgba(255,59,48,0.12)",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
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
  ghost: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  ghostText: { color: theme.text, fontWeight: "700", fontSize: 15 },
  label: { color: theme.text, fontWeight: "700", fontSize: 15, marginTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: theme.bgSoft,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.muted, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  input: {
    backgroundColor: theme.bgSoft,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.text,
    padding: 16,
    fontSize: 16,
  },
  routineCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  exerciseIndex: {
    color: theme.accent,
    fontWeight: "900",
    fontSize: 18,
    width: 24,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: theme.text, fontWeight: "700", fontSize: 15 },
  exerciseMeta: { color: theme.muted, fontSize: 13, marginTop: 2 },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgSoft,
  },
  selectRowActive: { borderColor: theme.accent },
  selectText: { color: theme.text, fontWeight: "600", flex: 1 },
  selectMeta: { color: theme.muted, fontSize: 12 },
  rowActions: { flexDirection: "row", gap: 12 },
  cancel: { color: theme.muted, textAlign: "center", marginTop: 12, fontSize: 14 },
});
