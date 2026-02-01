import { SentOtpParams, VerifyOtpParams } from "../types/auth";
import axios from "../lib/axios";
import { LocalStorageKeys } from "@/enums/local-storage.enum";

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
        try {
            const { data } = await axios.post('/auth/logout');
            localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}