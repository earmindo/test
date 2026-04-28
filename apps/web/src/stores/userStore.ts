import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@musicai/shared";

interface UserState {
  user: User | null;
  loading: boolean;
  fetch: () => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const user = await api.users.me();
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clear: () => set({ user: null }),
}));
