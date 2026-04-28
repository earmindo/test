import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { api } from "@/lib/api";
import { PLAN_FEATURES } from "@musicai/shared";

type UserData = { email: string; name: string | null; plan: string; generations_today: number };

const PLAN_COLORS = { free: "#6b7280", pro: "#6366f1", studio: "#7c3aed" };

export default function ProfileScreen() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    api.users.me().then(setUser).catch(() => {});
  }, []);

  async function logout() {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("access_token");
        },
      },
    ]);
  }

  if (!user) return null;

  const plan = user.plan as "free" | "pro" | "studio";
  const features = PLAN_FEATURES[plan];
  const planColor = PLAN_COLORS[plan];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name ?? user.email)[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name ?? user.email}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={[styles.planBadge, { backgroundColor: `${planColor}22`, borderColor: planColor }]}>
          <Text style={[styles.planText, { color: planColor }]}>{plan.toUpperCase()} PLAN</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.generations_today}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {features.generationsPerDay === "unlimited" ? "∞" : features.generationsPerDay}
            </Text>
            <Text style={styles.statLabel}>Daily limit</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{features.maxDuration}s</Text>
            <Text style={styles.statLabel}>Max duration</Text>
          </View>
        </View>

        {plan === "free" && (
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  content: { flex: 1, alignItems: "center", padding: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#312e81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  avatarText: { color: "#a5b4fc", fontSize: 32, fontWeight: "700" },
  name: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { color: "#6b7280", fontSize: 14, marginBottom: 16 },
  planBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  planText: { fontWeight: "700", fontSize: 13 },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    width: "100%",
    marginBottom: 24,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#fff", fontSize: 24, fontWeight: "700" },
  statLabel: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: "#1f2937" },
  upgradeButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  upgradeText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  logoutText: { color: "#6b7280", fontSize: 16 },
});
