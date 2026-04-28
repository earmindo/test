import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Linking } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://api.musicai.app";

interface Track {
  prompt: string;
  genre?: string;
  duration: number;
  audio_url: string;
  created_at: string;
}

export default function SharedTrackScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/v1/share/public/${token}`);
        if (!res.ok) throw new Error("not found");
        setTrack(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (error || !track) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Track not found</Text>
      </View>
    );
  }

  const date = new Date(track.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <>
      <Stack.Screen options={{ title: "Shared Track", headerStyle: { backgroundColor: "#030712" }, headerTintColor: "#fff" }} />
      <View style={styles.container}>
        <Text style={styles.label}>AI-generated track</Text>
        <Text style={styles.prompt}>"{track.prompt}"</Text>

        <View style={styles.meta}>
          {track.genre ? <Text style={styles.metaText}>{track.genre}</Text> : null}
          <Text style={styles.metaText}>{track.duration}s</Text>
          <Text style={styles.metaText}>{date}</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL(track.audio_url)}
        >
          <Text style={styles.buttonText}>Open audio</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => Linking.openURL(`https://musicai.app/s/${token}`)}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>Open in browser</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#030712" },
  container: { flex: 1, backgroundColor: "#030712", padding: 24, paddingTop: 40 },
  label: { color: "#6b7280", fontSize: 13, marginBottom: 8 },
  prompt: { color: "#fff", fontSize: 20, fontWeight: "600", lineHeight: 28, marginBottom: 12 },
  meta: { flexDirection: "row", gap: 12, marginBottom: 32 },
  metaText: { color: "#6b7280", fontSize: 13, textTransform: "capitalize" },
  button: { backgroundColor: "#4f46e5", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  secondaryButton: { backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondaryText: { color: "#d1d5db" },
  errorText: { color: "#6b7280", fontSize: 16 },
});
