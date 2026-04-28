import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import type { Generation } from "@musicai/shared";

type Status = "idle" | "loading" | "polling" | "done" | "failed";

const GENRES = ["electronic", "classical", "jazz", "rock", "hiphop", "ambient", "pop"];

export default function GenerateScreen() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Generation | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  async function generate() {
    if (!prompt.trim()) return;
    setStatus("loading");
    setResult(null);

    try {
      const { generation_id } = await api.generations.create({
        prompt,
        duration,
        genre: genre ?? undefined,
        format: "mp3",
      });

      setStatus("polling");
      pollRef.current = setInterval(async () => {
        const gen = await api.generations.get(generation_id);
        if (gen.status === "done" || gen.status === "failed") {
          clearInterval(pollRef.current!);
          setResult(gen);
          setStatus(gen.status === "done" ? "done" : "failed");
        }
      }, 2000);
    } catch {
      setStatus("failed");
      Alert.alert("Error", "Failed to generate music. Please try again.");
    }
  }

  async function togglePlay() {
    if (!result?.audio_url) return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: result.audio_url },
      { shouldPlay: true }
    );
    newSound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) setIsPlaying(false);
    });
    setSound(newSound);
    setIsPlaying(true);
  }

  const isGenerating = status === "loading" || status === "polling";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Generate music</Text>

        <TextInput
          style={styles.input}
          placeholder="Describe your music..."
          placeholderTextColor="#6b7280"
          multiline
          numberOfLines={4}
          value={prompt}
          onChangeText={setPrompt}
        />

        {/* Genre selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genreChip, genre === g && styles.genreChipActive]}
              onPress={() => setGenre(genre === g ? null : g)}
            >
              <Text style={[styles.genreText, genre === g && styles.genreTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duration */}
        <View style={styles.row}>
          <Text style={styles.label}>Duration: {duration}s</Text>
          <View style={styles.durationButtons}>
            {[15, 30, 60, 120].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                  {d}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isGenerating && styles.buttonDisabled]}
          onPress={generate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate</Text>
          )}
        </TouchableOpacity>

        {isGenerating && (
          <Text style={styles.hint}>
            {status === "loading" ? "Submitting..." : "Generating your music..."}
          </Text>
        )}

        {result && result.status === "done" && (
          <View style={styles.player}>
            <Text style={styles.playerPrompt} numberOfLines={2}>{result.prompt}</Text>
            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
              <Text style={styles.playButtonText}>{isPlaying ? "Pause" : "Play"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 20 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
    minHeight: 100,
  },
  genreScroll: { marginBottom: 16 },
  genreChip: {
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  genreChipActive: { backgroundColor: "#312e81", borderColor: "#6366f1" },
  genreText: { color: "#9ca3af", fontSize: 13 },
  genreTextActive: { color: "#a5b4fc" },
  row: { marginBottom: 20 },
  label: { color: "#9ca3af", fontSize: 13, marginBottom: 8 },
  durationButtons: { flexDirection: "row", gap: 8 },
  durationBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  durationBtnActive: { backgroundColor: "#312e81", borderColor: "#6366f1" },
  durationText: { color: "#9ca3af", fontSize: 14 },
  durationTextActive: { color: "#a5b4fc" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { color: "#6b7280", textAlign: "center", fontSize: 14 },
  player: {
    marginTop: 20,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  playerPrompt: { color: "#d1d5db", marginBottom: 12, fontSize: 14 },
  playButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  playButtonText: { color: "#fff", fontWeight: "600" },
});
