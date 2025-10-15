"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import AuthRedirect from "@/components/AuthRedirect";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Apply theme changes (blocking script handles initial load)
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Set loading to false after auth check
    setIsLoading(false);
  }, []);

  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <AuthRedirect />
      {pathname !== "/login" && <Header />}
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: "glassmorphism-toast",
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
        }}
      />
      {/* <Footer /> */}
    </>
  );
}