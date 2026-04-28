import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/auth";
import { initPurchases } from "@/lib/purchases";
import { registerForPushNotifications } from "@/lib/notifications";
import { isOnboardingDone } from "@/lib/onboarding";
import type { Session } from "@supabase/supabase-js";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    Promise.all([
      supabase.auth.getSession(),
      isOnboardingDone(),
    ]).then(([{ data }, done]) => {
      setOnboarded(done);
      setSession(data.session);
      if (data.session?.user) {
        initPurchases(data.session.user.id).catch(() => {});
        registerForPushNotifications().catch(() => {});
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        initPurchases(session.user.id).catch(() => {});
      }
    });

    // Refresh session when app comes back to foreground
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      appState.remove();
    };
  }, []);

  useEffect(() => {
    if (session === undefined || onboarded === undefined) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!onboarded && !inOnboarding) {
      router.replace("/onboarding");
    } else if (!session && !inAuthGroup && !inOnboarding) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, onboarded, segments]);

  if (session === undefined || onboarded === undefined) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
