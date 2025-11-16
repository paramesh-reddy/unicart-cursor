"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Component to initialize authentication state on app load
 * This should be included in the root layout
 */
export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}

