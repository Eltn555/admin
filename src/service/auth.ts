import { SentOtpParams, VerifyOtpParams } from "../types/auth";
import axios from "../lib/axios";
import { clearAuthSession } from "@/helpers/auth.helper";
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
            clearAuthSession();
            throw error;
        }
    }

    public static async logout() {
        try {
            const response = await axios.post('/auth/logout');
            clearAuthSession();
            return { success: true, message: response.data?.message || "Logged out successfully" };
        } catch (error) {
            clearAuthSession();
            if (error instanceof AxiosError && error.response) {
                return { success: true, message: error.response.data?.message || "Logged out successfully" };
            }
            console.error(error);
            return { success: true, message: "Logged out successfully" };
        }
    }
}