import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api, apiUrl } from "../../src/api";
import { goalLabels, theme } from "../../src/theme";

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const [data, me] = await Promise.all([api.myRoutines(), api.me()]);
      setRoutines(Array.isArray(data) ? data : []);
      setProfile(me?.profile ?? null);
    } catch {
      setMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const routine = routines[0] ?? null;

  const days = useMemo(() => {
    if (!routine?.exercises?.length) return [];
    const map = new Map<number, any[]>();
    for (const ex of routine.exercises) {
      const d = ex.day ?? 1;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(ex);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, list]) => ({
        day,
        name: list[0]?.dayName || `Día ${day}`,
        exercises: list,
      }));
  }, [routine]);

  const isWarmup = (name: string) => name.toLowerCase().includes("calentamiento");

  const generate = async () => {
    setGenerating(true);
    setMsg("");
    try {
      const p = profile ?? {};
      await api.generateRoutine({
        daysPerWeek: p.daysPerWeek ?? 4,
        goal: p.goal ?? "SALUD",
        experience: p.experience ?? "PRINCIPIANTE",
      });
      await load();
      setMsg("Rutina generada con tu split semanal + calentamiento ✓");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error generando rutina");
    } finally {
      setGenerating(false);
    }
  };

  const imageUri = (u?: string) => {
    if (!u) return null;
    return u.startsWith("http") ? u : `${apiUrl()}/api/uploads/${u}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        <Text style={styles.title}>Rutina</Text>
        <Text style={styles.subtitle}>
          {routine
            ? `${routine.name} · separada por días con calentamiento incluido.`
            : "Tu plan de entrenamiento por día, generado con IA."}
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={styles.loader} />
        ) : routine ? (
          <>
            {routine.source === "PROPIA" && (
              <Text style={styles.sourceNote}>
                <Ionicons name="information-circle" size={14} color={theme.muted} /> Rutina de
                prueba (sin IA configurada). Genera una para ver el split por días.
              </Text>
            )}
            {days.map(({ day, name, exercises }) => {
              const warmup = isWarmup(name);
              return (
                <View key={`${routine.id}-${day}`} style={styles.dayCard}>
                  <View style={[styles.dayHeader, warmup && styles.dayHeaderWarmup]}>
                    <Ionicons
                      name={warmup ? "flame" : "barbell"}
                      size={18}
                      color={warmup ? "#ffb020" : theme.accent}
                    />
                    <Text style={[styles.dayTitle, warmup && styles.dayTitleWarmup]}>
                      {warmup ? name : `Día ${day} · ${name}`}
                    </Text>
                  </View>
                  {exercises.map((ex) => {
                    const uri = imageUri(ex.exercise?.imageUrl);
                    return (
                      <View key={`${ex.id}-${ex.exercise?.id}`} style={styles.exerciseRow}>
                        {uri ? (
                          <Image source={{ uri }} style={styles.thumb} />
                        ) : (
                          <View style={[styles.thumb, styles.thumbFallback]}>
                            <Ionicons name="barbell" size={20} color={theme.muted} />
                          </View>
                        )}
                        <View style={styles.exerciseBody}>
                          <Text style={styles.exerciseName}>
                            {ex.exercise?.name || "Ejercicio"}
                          </Text>
                          <Text style={styles.exerciseMeta}>
                            {ex.sets} × {ex.reps} · {ex.restSeconds}s descanso
                          </Text>
                          {ex.weightKg ? (
                            <Text style={styles.exerciseMeta}>{ex.weightKg} kg</Text>
                          ) : null}
                          {ex.exercise?.description ? (
                            <Text style={styles.exerciseNotes}>{ex.exercise.description}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        ) : (
          <Text style={styles.empty}>
            Aún no tienes rutina. Pulsa el botón para que la IA la cree con tu split semanal y un
            calentamiento.
          </Text>
        )}

        <Pressable style={styles.primary} onPress={generate} disabled={generating || loading}>
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.primaryText}>
                {routine ? "Generar otra rutina" : "Generar rutina con IA"}
              </Text>
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
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 8 },
  subtitle: { color: theme.muted, fontSize: 15, lineHeight: 21 },
  msg: {
    color: theme.accent,
    backgroundColor: "rgba(255,59,48,0.12)",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  sourceNote: { color: theme.muted, fontSize: 13, marginTop: 2 },
  dayCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dayHeaderWarmup: { backgroundColor: "rgba(255,176,32,0.10)" },
  dayTitle: { color: theme.text, fontWeight: "800", fontSize: 16 },
  dayTitleWarmup: { color: "#ffb020" },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: theme.bgSoft },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  exerciseBody: { flex: 1 },
  exerciseName: { color: theme.text, fontWeight: "700", fontSize: 15 },
  exerciseMeta: { color: theme.muted, fontSize: 13, marginTop: 3 },
  exerciseNotes: { color: theme.text, fontSize: 13, marginTop: 4, lineHeight: 18 },
  empty: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
