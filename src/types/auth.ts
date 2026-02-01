export type SentOtpParams = {
    phoneNumber: string;
}

export type VerifyOtpParams = {
    phoneNumber: string;
    otp: string;
}
