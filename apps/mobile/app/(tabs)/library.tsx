import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { api } from "@/lib/api";
import type { Generation } from "@musicai/shared";

export default function LibraryScreen() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    api.generations.list().then((r) => {
      setGenerations(r.items.filter((g) => g.status === "done"));
      setLoading(false);
    });
  }, []);

  async function playTrack(gen: Generation) {
    if (!gen.audio_url) return;

    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    if (playingId === gen.id) {
      setPlayingId(null);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: gen.audio_url },
      { shouldPlay: true }
    );
    newSound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) setPlayingId(null);
    });
    setSound(newSound);
    setPlayingId(gen.id);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Library</Text>
      {generations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No tracks yet. Generate your first music!</Text>
        </View>
      ) : (
        <FlatList
          data={generations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => playTrack(item)}>
              <View style={styles.cardContent}>
                <Text style={styles.cardPrompt} numberOfLines={2}>{item.prompt}</Text>
                <Text style={styles.cardMeta}>
                  {item.duration}s • {item.format?.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.playIcon, playingId === item.id && styles.playIconActive]}>
                <Text style={styles.playIconText}>{playingId === item.id ? "■" : "▶"}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", padding: 20, paddingBottom: 8 },
  empty: { color: "#6b7280", textAlign: "center" },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardContent: { flex: 1, marginRight: 12 },
  cardPrompt: { color: "#e5e7eb", fontSize: 14, marginBottom: 4 },
  cardMeta: { color: "#6b7280", fontSize: 12 },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconActive: { backgroundColor: "#312e81" },
  playIconText: { color: "#6366f1", fontSize: 14 },
});
