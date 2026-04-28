import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1f2937" },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Generate" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
