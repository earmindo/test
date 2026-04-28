import { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { markOnboardingDone } from "@/lib/onboarding";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    emoji: "🎵",
    title: "Generate music with AI",
    desc: "Describe any music you imagine — style, mood, instruments — and our AI creates it in seconds.",
  },
  {
    id: "2",
    emoji: "✍️",
    title: "Just type a prompt",
    desc: 'Try: "Chill lo-fi beats with rain sounds, 85 BPM" or "Epic orchestral trailer music in C minor".',
  },
  {
    id: "3",
    emoji: "⚡",
    title: "Powered by ACE-Step 1.5",
    desc: "State-of-the-art AI music generation. Studio quality, multiple formats, up to 2 minutes.",
  },
  {
    id: "4",
    emoji: "🚀",
    title: "Ready to create?",
    desc: "Start free with 3 tracks per day. Upgrade anytime for unlimited generations.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  async function finish() {
    await markOnboardingDone();
    router.replace("/(auth)/signup");
  }

  function next() {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finish();
    }
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Boutons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={finish}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextText}>
            {isLast ? "Get started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  desc: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: "#374151",
  },
  dotActive: {
    backgroundColor: "#6366f1",
    width: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skipBtn: { padding: 12 },
  skipText: { color: "#6b7280", fontSize: 15 },
  nextBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
