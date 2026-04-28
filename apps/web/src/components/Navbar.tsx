"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

const PLAN_COLORS = {
  free: "text-gray-500",
  pro: "text-brand-400",
  studio: "text-purple-400",
};

export function Navbar() {
  const router = useRouter();
  const { user, fetch } = useUserStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleLogout() {
    await supabase.auth.signOut();
    useUserStore.getState().clear();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-900 bg-gray-950/80 backdrop-blur sticky top-0 z-30">
      <Link href="/dashboard" className="text-lg font-bold text-brand-500">
        MusicAI
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <span className={`text-xs font-bold uppercase ${PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] ?? "text-gray-500"}`}>
            {user.plan}
          </span>
        )}
        <Link href="/dashboard/library" className="text-sm text-gray-400 hover:text-white transition-colors">
          Library
        </Link>
        <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
