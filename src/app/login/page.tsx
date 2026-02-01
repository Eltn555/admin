"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { toast } from "sonner";
import { AuthService } from "@/service/auth";
import { LocalStorageKeys } from "@/enums/local-storage.enum";

type Step = "phone" | "otp";

function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const timeOutOtp = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (!otpExpiresAt) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((otpExpiresAt - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setOtpExpiresAt(null);
        if (timeOutOtp.current) {
          clearTimeout(timeOutOtp.current);
          timeOutOtp.current = null;
        }
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isOtpExpired = step === "otp" && otpExpiresAt === null && remainingSeconds === 0;

  const sendOtp = async (phone: string) => {
    // check if phone number is in these formats: +998901234567, 998901234567, 901234567
    if (!phone.match(/^\+9989\d{7}$|^\+998\d{7}$|^\d{7}$/)) {
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid Phone Number",
      })
    }

    setIsLoading(true)
    try {
      const { phoneNumber } = await AuthService.sendOtp({ phoneNumber: phone });
      setPhone(phoneNumber);
      setStep("otp");
      
      // Set expiration time (10 minutes from now)
      const expiresAt = Date.now() + 600000;
      setOtpExpiresAt(expiresAt);
      
      timeOutOtp.current = setTimeout(() => {
        setOtpExpiresAt(null);
      }, 600000); // 10 minutes
      toast.success("OTP sent successfully", {
        description: "Please enter the OTP sent to your phone",
      })
    }catch (error) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to send OTP", {
        description: message,
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleValidateOtp = async (otp: string) => {
    // check if otp is 6 digits and only numbers
    if (otp.length !== 6 || !otp.match(/^\d+$/)) {
      toast.error("Invalid OTP", {
        description: "Please enter a valid OTP",
      })
    }

    setIsLoading(true)
    try {
      const { user, token } = await AuthService.verifyOtp({ phoneNumber: phone, otp });

      // store user and token in local storage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, token);
      localStorage.setItem("isLoggedIn", "true");
      
      // Set cookie for middleware (required for server-side route protection)
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      toast.success("Login successful", {
        description: "You are now logged in",
      });

      // redirect to dashboard (route group serves at root /)
      router.replace("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast.error("Login failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Phone Step */}
      {step === "phone" && (
        <div className="space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="901234567"
            value={phone.replace(/^\+998/, "")}
            onChange={(e) => setPhone(e.target.value.replace(/^\+998/, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && phone && !isLoading) {
                sendOtp(phone);
              }
            }}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            onClick={() => sendOtp(phone)}
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Send Verification Code
          </Button>
        </div>
      )}

      {/* OTP Step */}
      {step === "otp" && (
        <div className="space-y-6">
          <OtpInput onComplete={(otp) => handleValidateOtp(otp)} disabled={isLoading} />

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
            {/* Countdown timer */}
            {remainingSeconds > 0 && (
              <p className="text-zinc-400 text-sm">
                Time remaining: <span className="font-mono text-emerald-400">{formatTime(remainingSeconds)}</span>
              </p>
            )}
            
            {/* OTP Expired message */}
            {isOtpExpired && (
              <p className="text-red-400 text-sm font-medium">
                OTP has expired. Please request a new code.
              </p>
            )}
            
            <button
              type="button"
              onClick={() => sendOtp(phone)}
              disabled={isLoading || remainingSeconds > 0}
              className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}
    </>
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

          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-sm mt-8">
          Admin Panel • E-Commerce Dashboard
        </p>
      </div>
    </div>
  );
}
