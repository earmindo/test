import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

const REVENUECAT_KEY =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

export const ENTITLEMENT_PRO = "pro";
export const ENTITLEMENT_STUDIO = "studio";

export async function initPurchases(userId: string): Promise<void> {
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey: REVENUECAT_KEY, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function getPlan(info: CustomerInfo): "free" | "pro" | "studio" {
  if (info.entitlements.active[ENTITLEMENT_STUDIO]) return "studio";
  if (info.entitlements.active[ENTITLEMENT_PRO]) return "pro";
  return "free";
}
