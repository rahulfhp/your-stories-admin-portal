"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

const ChangePasswordPage = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.changePassword({
        oldPassword,
        newPassword,
      });
      if (response.success) {
        toast.success(response.message || "Password changed successfully!");
        router.push("/");
      } else {
        toast.error(response.message || "Failed to change password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pt-10 md:pt-30 pb-8 px-5 flex flex-col items-center justify-center min-h-screen bg-background">
        <form
          className="w-full max-w-md p-8 bg-card dark:bg-card rounded-xl shadow-lg border border-border"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
            Change Password
          </h2>
          <div className="mb-4">
            <label
              htmlFor="oldPassword"
              className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Old Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
                onClick={() => setShowOldPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showOldPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
                onClick={() => setShowNewPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmNewPassword"
              className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showConfirmNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;