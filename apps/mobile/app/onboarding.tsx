import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, getToken } from "../src/api";
import { experienceLabels, goalLabels, theme } from "../src/theme";

const goals = Object.keys(goalLabels);
const experiences = Object.keys(experienceLabels);

export default function Onboarding() {
  const router = useRouter();
  const [goal, setGoal] = useState("GANAR_MASA");
  const [experience, setExperience] = useState("PRINCIPIANTE");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [startWeightKg, setStartWeightKg] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    try {
      const me = await api.me();
      await api.updateProfile(me.id, {
        goal,
        experience,
        daysPerWeek,
        age: age ? Number(age) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        startWeightKg: startWeightKg ? Number(startWeightKg) : undefined,
      });
      router.replace("/(tabs)");
    } catch (err) {
      // Sin persistencia aún: pasamos igual para poder probar la app
      router.replace("/(tabs)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cuéntanos de ti</Text>
        <Text style={styles.subtitle}>
          Así la IA crea tu plan perfecto.
        </Text>

        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.chips}>
          {goals.map((g) => (
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

        <Text style={styles.label}>Nivel</Text>
        <View style={styles.chips}>
          {experiences.map((e) => (
            <Pressable
              key={e}
              style={[styles.chip, experience === e && styles.chipActive]}
              onPress={() => setExperience(e)}
            >
              <Text style={[styles.chipText, experience === e && styles.chipTextActive]}>
                {experienceLabels[e]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>¿Cuántos días entrenas a la semana?</Text>
        <View style={styles.chips}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Pressable
              key={d}
              style={[styles.chip, daysPerWeek === d && styles.chipActive]}
              onPress={() => setDaysPerWeek(d)}
            >
              <Text style={[styles.chipText, daysPerWeek === d && styles.chipTextActive]}>
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Edad"
            placeholderTextColor={theme.muted}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Altura (cm)"
            placeholderTextColor={theme.muted}
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="number-pad"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Peso actual (kg)"
          placeholderTextColor={theme.muted}
          value={startWeightKg}
          onChangeText={setStartWeightKg}
          keyboardType="decimal-pad"
        />

        <Pressable style={styles.primary} onPress={save} disabled={saving}>
          <Text style={styles.primaryText}>
            {saving ? "Guardando..." : "Continuar"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 28, gap: 12, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 32, fontWeight: "900", marginTop: 8 },
  subtitle: { color: theme.muted, fontSize: 15, marginBottom: 8 },
  label: { color: theme.text, fontWeight: "700", fontSize: 15, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.bgSoft,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.muted, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  input: {
    backgroundColor: theme.bgSoft,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.text,
    padding: 16,
    fontSize: 16,
  },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
