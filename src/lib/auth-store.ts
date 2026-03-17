import { create } from "zustand";
import { AuthService } from "@/service/auth";
import { LocalStorageKeys } from "@/enums/local-storage.enum";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendOtp: (phone: string) => Promise<boolean>;
  validateOtp: (phone: string, otp: string) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  sendOtp: async (phone: string) => {
    set({ isLoading: true, error: null });

    const response = await AuthService.sendOtp({ phoneNumber: phone });

    if (response.success) {
      set({ isLoading: false });
      return true;
    }

    set({ isLoading: false, error: response.message || "Failed to send OTP" });
    return false;
  },

  validateOtp: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });

    const response = await AuthService.verifyOtp({ phoneNumber: phone, otp });

    if (response.success && response.data) {
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      
      return true;
    }
    
    set({ isLoading: false, error: response.message || "Invalid OTP" });
    return false;
  },

  checkAuth: async () => {
    const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);

    if (!token || token === "undefined") {
      set({ isAuthenticated: false, isLoading: false, user: null });
      return false;
    }

    set({ isLoading: true });

    try {
      const response = await AuthService.validateToken();

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        set({ user: response.user, isAuthenticated: true, isLoading: false });
        return true;
      }

      throw new Error("No user in response");
    } catch {
      localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await AuthService.logout();
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

