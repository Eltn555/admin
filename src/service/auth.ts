import { SentOtpParams, VerifyOtpParams } from "../types/auth";
import axios from "../lib/axios";
import { LocalStorageKeys } from "@/enums/local-storage.enum";
import { AxiosError } from "axios";

export class AuthService {
    public static async sendOtp(params: SentOtpParams) {
        try {
            const { data } = await axios.post('/auth/send-otp', params);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public static async verifyOtp(params: VerifyOtpParams) {
        try {
            const { data } = await axios.post('/auth/validate-otp', params);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public static async validateToken() {
        try {
            const { data } = await axios.get('/auth/validate-token');
            return data;
        } catch (error) {
            localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            throw error;
        }
    }

    public static async logout() {
        const clearStorage = () => {
            localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
        };

        try {
            const response = await axios.post('/auth/logout');
            clearStorage();
            return { success: true, message: response.data?.message || "Logged out successfully" };
        } catch (error) {
            clearStorage();
            if (error instanceof AxiosError && error.response) {
                return { success: true, message: error.response.data?.message || "Logged out successfully" };
            }
            console.error(error);
            return { success: true, message: "Logged out successfully" };
        }
    }
}