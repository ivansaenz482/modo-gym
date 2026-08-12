import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { theme } from "../../src/theme";

const GROUPS = ["Todos", "Pecho", "Espalda", "Pierna", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio"];

export default function ExercisesScreen() {
  const [group, setGroup] = useState("Todos");
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api
      .exercises()
      .then((data) => {
        setExercises(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = group === "Todos" ? exercises : exercises.filter((e) => e.muscleGroup === group);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groups}>
        {GROUPS.map((g) => (
          <Pressable
            key={g}
            style={[styles.groupChip, group === g && styles.groupChipActive]}
            onPress={() => setGroup(g)}
          >
            <Text style={[styles.groupText, group === g && styles.groupTextActive]}>{g}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={styles.loader} />
        ) : (
          filtered.map((ex) => {
            const open = expanded === ex.id;
            return (
              <Pressable
                key={ex.id}
                style={styles.card}
                onPress={() => setExpanded(open ? null : ex.id)}
              >
                {ex.imageUrl ? (
                  <Image source={{ uri: ex.imageUrl }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.image, styles.imageFallback]}>
                    <Ionicons name="barbell" size={36} color={theme.muted} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{ex.name}</Text>
                  <Text style={styles.meta}>
                    {ex.muscleGroup} · {ex.category}
                  </Text>
                  {open && ex.description ? (
                    <Text style={styles.desc}>{ex.description}</Text>
                  ) : null}
                  {open && ex.videoUrl ? (
                    <Text style={styles.videoLink}>
                      <Ionicons name="play-circle" size={14} color={theme.accent} /> Ver video
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  groups: { flexGrow: 0, paddingHorizontal: 16, paddingVertical: 12 },
  groupChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
    backgroundColor: theme.bgSoft,
  },
  groupChipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  groupText: { color: theme.muted, fontWeight: "600", fontSize: 13 },
  groupTextActive: { color: "#fff" },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  loader: { marginTop: 40 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  image: { width: "100%", height: 170, backgroundColor: theme.bgSoft },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 14 },
  name: { color: theme.text, fontWeight: "800", fontSize: 17 },
  meta: { color: theme.muted, fontSize: 13, marginTop: 3 },
  desc: { color: theme.text, fontSize: 14, marginTop: 8, lineHeight: 20 },
  videoLink: { color: theme.accent, fontSize: 14, marginTop: 8, fontWeight: "600" },
});
