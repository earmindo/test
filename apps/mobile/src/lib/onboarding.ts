import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboarding_done";

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEY);
  return val === "true";
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEY, "true");
}
