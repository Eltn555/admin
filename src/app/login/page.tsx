"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

type Step = "phone" | "otp";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { sendOtp, validateOtp, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await sendOtp(phone);
    if (success) {
      setStep("otp");
    }
  };

  const handleValidateOtp = async (otp: string) => {
    clearError();

    const success = await validateOtp(phone, otp);
    if (success) {
      router.push(redirect);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    clearError();
  };

  return (
    <>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {step === "phone" ? "Welcome Back" : "Enter Verification Code"}
        </h1>
        <p className="text-zinc-400">
          {step === "phone"
            ? "Sign in to your admin dashboard"
            : `We sent a code to ${phone}`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Phone Step */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Send Verification Code
          </Button>
        </form>
      )}

      {/* OTP Step */}
      {step === "otp" && (
        <div className="space-y-6">
          <OtpInput onComplete={handleValidateOtp} disabled={isLoading} />

          {isLoading && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-zinc-400">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Verifying...</span>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={() => sendOtp(phone)}
              disabled={isLoading}
              className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors disabled:opacity-50"
            >
              Resend Code
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              disabled={isLoading}
              className="block mx-auto text-zinc-400 hover:text-zinc-300 text-sm transition-colors disabled:opacity-50"
            >
              ← Change phone number
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-2 text-zinc-400">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-900/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-sm mt-8">
          Admin Panel • E-Commerce Dashboard
        </p>
      </div>
    </div>
  );
}
