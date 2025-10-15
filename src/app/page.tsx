"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Return a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
