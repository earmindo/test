export type SubscriptionPlan = "free" | "pro" | "studio";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: SubscriptionPlan;
  generationsToday: number;
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
