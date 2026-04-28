import { create } from "zustand";
import { api } from "@/lib/api";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  generations_today: number;
}

interface UserState {
  user: UserData | null;
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
