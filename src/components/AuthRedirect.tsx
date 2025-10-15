"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // If user is authenticated and on the login page, redirect to dashboard
    if (isAuthenticated && pathname === "/login") {
      router.replace("/dashboard");
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && pathname !== "/login" && pathname !== "/") {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router]);

  return null;
}