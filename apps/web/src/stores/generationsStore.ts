import { create } from "zustand";
import { api } from "@/lib/api";
import type { Generation, GenerationRequest } from "@musicai/shared";

interface GenerationsState {
  items: Generation[];
  loading: boolean;
  generating: boolean;
  fetch: () => Promise<void>;
  generate: (req: GenerationRequest) => Promise<string | null>;
  updateOne: (id: string, patch: Partial<Generation>) => void;
}

export const useGenerationsStore = create<GenerationsState>((set, get) => ({
  items: [],
  loading: false,
  generating: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { items } = await api.generations.list();
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  generate: async (req: GenerationRequest): Promise<string | null> => {
    set({ generating: true });
    try {
      const { generation_id } = await api.generations.create(req);
      // Ajouter un placeholder optimiste
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
