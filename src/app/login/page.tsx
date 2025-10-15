"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";
import YourStoriesLogo from "../../../public/YourStoriesLogo.svg";
import YourStoriesLogoLight from "../../../public/YourStoriesLogoLight.svg";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Store auth data
      login(response.admin, response.accessToken);
      
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md backdrop-blur-xl border rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] dark:bg-black/30 dark:border-white/10 bg-white/40 border-black/10 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-48 h-16 relative">
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
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
              Email
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
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white/90 text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border dark:border-white/20 border-gray-300/40 bg-white/70 dark:bg-black/30 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full cursor-pointer" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}