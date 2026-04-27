"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  setAuth: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      setAuth: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "admin-auth-storage",
    }
  )
);

export function useAdminAuth() {
  return useAdminAuthStore();
}
