import axios from "axios";
import { getAccessToken, getAccessTokenFromHeader } from "../helpers/auth.helper";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
});

axiosInstance.interceptors.request.use((config) => {
    const accessTokenFromHeader = getAccessTokenFromHeader(config?.headers?.Authorization as string | undefined);
    if (accessTokenFromHeader) {
        return config;
    }
    
    const accessToken = getAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

export default axiosInstance;