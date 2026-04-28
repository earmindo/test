"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xl">
        <p className="text-sm text-gray-300 flex-1">
          We use cookies to improve your experience and analyze traffic.{" "}
          <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline">
            Learn more
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
