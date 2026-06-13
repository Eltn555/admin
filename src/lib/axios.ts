import axios from "axios";
import { getAccessToken, getAccessTokenFromHeader, handleSessionExpired } from "../helpers/auth.helper";
import type { AxiosError } from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
});

const AUTH_FLOW_PATHS = ["/auth/send-otp", "/auth/validate-otp"];

function shouldHandleUnauthorized(error: AxiosError, requestUrl?: string): boolean {
  if (error.response?.status !== 401) return false;

  const url = requestUrl ?? "";
  if (AUTH_FLOW_PATHS.some((path) => url.includes(path))) return false;

  const data = error.response.data as { message?: string } | undefined;
  return data?.message === "Invalid or expired access token";
}

axiosInstance.interceptors.request.use((config) => {
    const accessTokenFromHeader = getAccessTokenFromHeader(config?.headers?.Authorization as string | undefined);
    if (accessTokenFromHeader) {
        return config;
    }
    
    const accessToken = getAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (shouldHandleUnauthorized(error, error.config?.url)) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;