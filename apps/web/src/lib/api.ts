import axios from "axios";
import { supabase } from "./supabase";
import type { Generation, GenerationRequest, User } from "@musicai/shared";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
});

http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

export const api = {
  users: {
    me: (): Promise<User> => http.get("/users/me").then((r) => r.data),
  },

  generations: {
    create: (req: GenerationRequest): Promise<{ generation_id: string; status: string }> =>
      http.post("/generate", req).then((r) => r.data),

    get: (id: string): Promise<Generation> =>
      http.get(`/generate/${id}`).then((r) => r.data),

    list: (page = 1): Promise<{ items: Generation[]; page: number; total: number }> =>
      http.get("/generate", { params: { page } }).then((r) => r.data),
  },

  subscriptions: {
    me: (): Promise<{ plan: string; subscription: { status: string; current_period_end: string | null; cancel_at_period_end: boolean } | null }> =>
      http.get("/subscriptions/me").then((r) => r.data),

    checkout: (priceKey: string, successUrl: string, cancelUrl: string): Promise<{ checkout_url: string }> =>
      http.post("/subscriptions/checkout", {
        price_key: priceKey,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }).then((r) => r.data),

    portal: (returnUrl: string): Promise<{ portal_url: string }> =>
      http.post("/subscriptions/portal", { return_url: returnUrl }).then((r) => r.data),
  },

  share: {
    create: (generationId: string): Promise<{ share_token: string }> =>
      http.post(`/share/${generationId}`).then((r) => r.data),
  },
};
