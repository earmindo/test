import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("music-ready", {
      name: "Music ready",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function notifyMusicReady(prompt: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your music is ready!",
      body: `"${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}"`,
      sound: "default",
      data: { screen: "library" },
    },
    trigger: null, // immédiat
  });
}
