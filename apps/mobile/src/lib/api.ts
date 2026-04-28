import axios from "axios";
import * as SecureStore from "expo-secure-store";
import type { Generation, GenerationRequest } from "@musicai/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const http = axios.create({ baseURL: `${API_URL}/api/v1` });

http.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  generations: {
    create: (req: GenerationRequest): Promise<{ generation_id: string }> =>
      http.post("/generate", req).then((r) => r.data),

    get: (id: string): Promise<Generation> =>
      http.get(`/generate/${id}`).then((r) => r.data),

    list: (): Promise<{ items: Generation[] }> =>
      http.get("/generate").then((r) => r.data),
  },

  users: {
    me: () => http.get("/users/me").then((r) => r.data),
  },
};
