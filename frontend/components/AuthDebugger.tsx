"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthDebugger() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (process.env.NODE_ENV === "development") {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
        <div>Auth: {isAuthenticated ? "✅" : "❌"}</div>
        <div>User: {user?.email || "None"}</div>
        <div>Role: {user?.role || "None"}</div>
      </div>
    );
  }

  return null;
}
