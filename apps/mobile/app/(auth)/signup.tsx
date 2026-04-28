import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/auth";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) return;
    if (password.length < 8) {
      Alert.alert("Password too short", "Minimum 8 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      Alert.alert("Sign up failed", error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneEmoji}>✉️</Text>
        <Text style={styles.doneTitle}>Check your email</Text>
        <Text style={styles.doneText}>
          We sent a confirmation link to {email}. Tap it to activate your account.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back to login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>MusicAI</Text>
        <Text style={styles.subtitle}>Create your free account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#6b7280"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#6366f1",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { color: "#6b7280", textAlign: "center", marginBottom: 40, fontSize: 15 },
  form: { gap: 12 },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#6b7280", fontSize: 14 },
  footerLink: { color: "#6366f1", fontSize: 14, fontWeight: "600" },
  doneContainer: {
    flex: 1,
    backgroundColor: "#030712",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  doneEmoji: { fontSize: 56, marginBottom: 16 },
  doneTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 12 },
  doneText: { color: "#9ca3af", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  backBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  backBtnText: { color: "#6366f1", fontWeight: "600" },
});
