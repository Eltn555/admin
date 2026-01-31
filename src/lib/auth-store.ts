import { create } from "zustand";
import Cookies from "js-cookie";
import { authApi, TOKEN_KEY } from "./api";

interface User {
  id: string;
  phone: string;
}

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

    const response = await authApi.sendOtp(phone);

    if (response.success) {
      set({ isLoading: false });
      return true;
    }

    set({ isLoading: false, error: response.message || "Failed to send OTP" });
    return false;
  },

  validateOtp: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });

    const response = await authApi.validateOtp(phone, otp);

    if (response.success && response.data) {
      const { token, user } = response.data;
      Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: "strict" });
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }

    set({ isLoading: false, error: response.message || "Invalid OTP" });
    return false;
  },

  checkAuth: async () => {
    const token = Cookies.get(TOKEN_KEY);

    if (!token) {
      set({ isAuthenticated: false, isLoading: false, user: null });
      return false;
    }

    set({ isLoading: true });

    const response = await authApi.validateToken();

    if (response.success && response.data) {
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return true;
    }

    Cookies.remove(TOKEN_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
    return false;
  },

  logout: async () => {
    set({ isLoading: true });

    await authApi.logout();

    Cookies.remove(TOKEN_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

