import type { SubscriptionPlan } from "./user";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface PlanFeatures {
  generationsPerDay: number | "unlimited";
  maxDuration: number;
  formats: string[];
  stems: boolean;
  commercialUse: boolean;
  apiAccess: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    generationsPerDay: 3,
    maxDuration: 30,
    formats: ["mp3"],
    stems: false,
    commercialUse: false,
    apiAccess: false,
  },
  pro: {
    generationsPerDay: "unlimited",
    maxDuration: 120,
    formats: ["mp3", "wav"],
    stems: false,
    commercialUse: false,
    apiAccess: false,
  },
  studio: {
    generationsPerDay: "unlimited",
    maxDuration: 120,
    formats: ["mp3", "wav", "flac"],
    stems: true,
    commercialUse: true,
    apiAccess: true,
  },
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 12, yearly: 99 },
  studio: { monthly: 29, yearly: 249 },
};

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
