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
  _hydrated: boolean;
  setAuth: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      _hydrated: false,
      setAuth: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
      isAuthenticated: () => !!get().token,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "admin-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export function useAdminAuth() {
  return useAdminAuthStore();
}
