"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import YourStoriesLogo from "../../public/YourStoriesLogo.svg";
import YourStoriesLogoLight from "../../public/YourStoriesLogoLight.svg";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp" | "newPassword";

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      toast.success("OTP sent to your email");
      setCurrentStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setIsLoading(true);
      await authService.verifyOtp(email, otp);
      toast.success("OTP verified successfully");
      setCurrentStep("newPassword");
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(email, newPassword);
      toast.success("Password reset successfully");
      onClose();
      setCurrentStep("email");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state when closing
    setTimeout(() => {
      setCurrentStep("email");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }, 300);
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border dark:border-white/20 border-gray-300/40 bg-white/70 dark:bg-black/30 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your email"
          disabled={isLoading}
          required
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          An OTP has been sent to your email <strong>{email}</strong>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Please enter the OTP to verify your email
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
          Enter OTP
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border dark:border-white/20 border-gray-300/40 bg-white/70 dark:bg-black/30 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter the 6-digit OTP"
          disabled={isLoading}
          required
          maxLength={6}
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("email")}
          className="flex-1"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </div>
    </form>
  );

  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Create your new password
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 pr-11 rounded-xl border dark:border-white/20 border-gray-300/40 bg-white/70 dark:bg-black/30 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter new password"
            disabled={isLoading}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            {showNewPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 pr-11 rounded-xl border dark:border-white/20 border-gray-300/40 bg-white/70 dark:bg-black/30 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm new password"
            disabled={isLoading}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep("otp")}
          className="flex-1"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Forgot Password";
      case "otp":
        return "Verify OTP";
      case "newPassword":
        return "Create New Password";
      default:
        return "Forgot Password";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4">
        <div className="backdrop-blur-xl border rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] dark:bg-black/30 dark:border-white/10 bg-white/40 border-black/10 p-6">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-48 h-16 relative mb-4">
              <Image
                src={YourStoriesLogo}
                alt="Your Stories Logo"
                fill
                className="object-contain dark:block hidden"
              />
              <Image
                src={YourStoriesLogoLight}
                alt="Your Stories Logo"
                fill
                className="object-contain block dark:hidden"
              />
            </div>
            <h2 className="text-xl font-semibold dark:text-white text-gray-800">
              {getStepTitle()}
            </h2>
          </div>

          {currentStep === "email" && renderEmailStep()}
          {currentStep === "otp" && renderOtpStep()}
          {currentStep === "newPassword" && renderNewPasswordStep()}
        </div>
      </div>
    </div>
  );
}