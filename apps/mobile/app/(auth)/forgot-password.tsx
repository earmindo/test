import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Email sent</Text>
        <Text style={styles.desc}>Check your inbox to reset your password.</Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Back to login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.desc}>Enter your email to receive a reset link.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send link</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712", justifyContent: "center", padding: 24 },
  center: { flex: 1, backgroundColor: "#030712", justifyContent: "center", alignItems: "center", padding: 24 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 8, textAlign: "center" },
  desc: { color: "#9ca3af", textAlign: "center", marginBottom: 24 },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#6366f1", fontSize: 14, fontWeight: "600" },
});
