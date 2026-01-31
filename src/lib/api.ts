import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const TOKEN_KEY = "auth_token";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = Cookies.get(TOKEN_KEY);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export const authApi = {
  sendOtp: async (phone: string) => {
    return request<{ message: string }>("/auth/sendOtp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  validateOtp: async (phone: string, otp: string) => {
    return request<{ token: string; user: { id: string; phone: string } }>(
      "/auth/validateOtp",
      {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      }
    );
  },

  validateToken: async () => {
    return request<{ user: { id: string; phone: string } }>("/auth/validateToken", {
      method: "GET",
    });
  },

  logout: async () => {
    return request("/auth/logout", {
      method: "POST",
    });
  },
};

