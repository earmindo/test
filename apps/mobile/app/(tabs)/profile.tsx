import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/auth";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";
import { PLAN_FEATURES } from "@musicai/shared";
import {
  getOfferings, purchasePackage, restorePurchases, getPlan, getCustomerInfo,
} from "@/lib/purchases";
import type { PurchasesPackage } from "react-native-purchases";

const PLAN_COLORS = { free: "#6b7280", pro: "#6366f1", studio: "#7c3aed" } as const;

export default function ProfileScreen() {
  const { user, fetch: fetchUser } = useUserStore();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchUser();
    loadOfferings();
  }, []);

  async function loadOfferings() {
    try {
      const pkgs = await getOfferings();
      setPackages(pkgs);
    } catch {}
  }

  async function handlePurchase(pkg: PurchasesPackage) {
    setPurchasing(true);
    try {
      const info = await purchasePackage(pkg);
      const newPlan = getPlan(info);
      Alert.alert("Success", `You are now on the ${newPlan} plan!`);
      fetchUser();
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert("Purchase failed", e.message);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const info = await restorePurchases();
      const plan = getPlan(info);
      Alert.alert("Restored", plan !== "free" ? `Restored ${plan} plan.` : "No active subscription found.");
      fetchUser();
    } catch {
      Alert.alert("Error", "Could not restore purchases.");
    } finally {
      setRestoring(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          useUserStore.getState().clear();
        },
      },
    ]);
  }

  if (!user) {
    return <View style={styles.center}><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  const plan = user.plan as "free" | "pro" | "studio";
  const features = PLAN_FEATURES[plan];
  const planColor = PLAN_COLORS[plan];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name ?? user.email)[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name ?? user.email}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={[styles.planBadge, { backgroundColor: `${planColor}22`, borderColor: planColor }]}>
          <Text style={[styles.planText, { color: planColor }]}>{plan.toUpperCase()}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            [String(user.generations_today), "Today"],
            [features.generationsPerDay === "unlimited" ? "∞" : String(features.generationsPerDay), "Daily limit"],
            [`${features.maxDuration}s`, "Max duration"],
          ].map(([val, label], i) => (
            <View key={label} style={[styles.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: "#1f2937" }]}>
              <Text style={styles.statValue}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Plans disponibles si free */}
        {plan === "free" && packages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade</Text>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={styles.packageCard}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
              >
                <View>
                  <Text style={styles.packageName}>{pkg.product.title}</Text>
                  <Text style={styles.packageDesc} numberOfLines={1}>{pkg.product.description}</Text>
                </View>
                <Text style={styles.packagePrice}>
                  {purchasing ? "…" : pkg.product.priceString}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Restore */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={restoring}>
          <Text style={styles.restoreText}>{restoring ? "Restoring…" : "Restore purchases"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#030712" },
  content: { alignItems: "center", padding: 24, paddingBottom: 40 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#312e81", justifyContent: "center", alignItems: "center",
    marginTop: 20, marginBottom: 12,
  },
  avatarText: { color: "#a5b4fc", fontSize: 32, fontWeight: "700" },
  name: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { color: "#6b7280", fontSize: 14, marginBottom: 16 },
  planBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 24 },
  planText: { fontWeight: "700", fontSize: 13 },
  statsCard: {
    flexDirection: "row", backgroundColor: "#111827", borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: "#1f2937", width: "100%", marginBottom: 24,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "700" },
  statLabel: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  section: { width: "100%", marginBottom: 16 },
  sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  packageCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#111827", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#312e81", marginBottom: 8,
  },
  packageName: { color: "#fff", fontWeight: "600", fontSize: 15, marginBottom: 2 },
  packageDesc: { color: "#6b7280", fontSize: 12 },
  packagePrice: { color: "#a5b4fc", fontWeight: "700", fontSize: 16 },
  restoreBtn: { paddingVertical: 12, marginBottom: 8 },
  restoreText: { color: "#6b7280", fontSize: 13 },
  logoutBtn: {
    borderWidth: 1, borderColor: "#374151", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center", marginTop: 8,
  },
  logoutText: { color: "#6b7280", fontSize: 16 },
});
