import { create } from "zustand";
import { api } from "@/lib/api";
import type { Generation, GenerationRequest } from "@musicai/shared";

interface GenerationsState {
  items: Generation[];
  loading: boolean;
  loadingMore: boolean;
  generating: boolean;
  page: number;
  hasMore: boolean;
  fetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  generate: (req: GenerationRequest) => Promise<string | null>;
  updateOne: (id: string, patch: Partial<Generation>) => void;
}

export const useGenerationsStore = create<GenerationsState>((set, get) => ({
  items: [],
  loading: false,
  loadingMore: false,
  generating: false,
  page: 1,
  hasMore: false,

  fetch: async () => {
    set({ loading: true, page: 1 });
    try {
      const res = await api.generations.list(1);
      const total = (res as unknown as { total: number }).total ?? res.items.length;
      set({ items: res.items, loading: false, hasMore: res.items.length < total, page: 1 });
    } catch {
      set({ loading: false });
    }
  },

  fetchMore: async () => {
    const { page, loadingMore, hasMore, items } = get();
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    set({ loadingMore: true });
    try {
      const res = await api.generations.list(next);
      const total = (res as unknown as { total: number }).total ?? res.items.length;
      const merged = [...items, ...res.items];
      set({ items: merged, loadingMore: false, page: next, hasMore: merged.length < total });
    } catch {
      set({ loadingMore: false });
    }
  },

  generate: async (req: GenerationRequest): Promise<string | null> => {
    set({ generating: true });
    try {
      const { generation_id } = await api.generations.create(req);
      const placeholder: Generation = {
        id: generation_id,
        userId: "",
        prompt: req.prompt,
        duration: req.duration,
        genre: req.genre ?? null,
        bpm: req.bpm ?? null,
        format: req.format ?? "mp3",
        stems: req.stems ?? false,
        status: "pending",
        audioUrl: null,
        stemUrls: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      set((s) => ({ items: [placeholder, ...s.items] }));
      return generation_id;
    } catch {
      return null;
    } finally {
      set({ generating: false });
    }
  },

  updateOne: (id: string, patch: Partial<Generation>) =>
    set((s) => ({
      items: s.items.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),
}));
