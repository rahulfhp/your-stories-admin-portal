"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    storiesInfo,
    isLoading: storiesLoading,
    error,
    fetchAllStoriesInfo,
  } = useAdminStore();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await fetchAllStoriesInfo();
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchAllStoriesInfo]);

  const handleNavigate = (path: string) => {
    // Reset all pagination data before navigating
    if (path === "/approve-stories") {
      useAdminStore.getState().clearCache('published');
    } else if (path === "/pending-stories") {
      useAdminStore.getState().clearCache('pending');
    } else if (path === "/reject-stories") {
      useAdminStore.getState().clearCache('rejected');
    }
    
    // Also reset the pagination state directly
    useAdminStore.setState({ pagination: null });
    
    router.push(path);
  };

  // Show loading spinner while checking authentication
  if (storiesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Approved Stories",
      count: storiesInfo?.publishedStories || 0,
      icon: CheckCircle,
      iconColor: "text-green-500",
      path: "/approve-stories",
    },
    {
      title: "Pending Stories",
      count: storiesInfo?.pendingStories || 0,
      icon: Clock,
      iconColor: "text-amber-500",
      path: "/pending-stories",
    },
    {
      title: "Rejected Stories",
      count: storiesInfo?.rejectedStories || 0,
      icon: XCircle,
      iconColor: "text-red-500",
      path: "/reject-stories",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto px-4 md:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>

          {storiesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-6 bg-destructive/10 rounded-lg">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchAllStoriesInfo()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-50`}
                    />

                    {/* Content */}
                    <div className="relative p-6">
                      {/* Icon and Count */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center-safe gap-3">
                              <div
                                className={`rounded-lg bg-background/80 backdrop-blur-sm ${card.iconColor}`}
                              >
                                <Icon className="w-6" />
                              </div>
                              <h2 className="text-lg font-semibold text-foreground">
                                {card.title}
                              </h2>
                            </div>

                            {/* See All Button */}
                            <Button
                              variant="default"
                              className="w-22 cursor-pointer"
                              onClick={() => handleNavigate(card.path)}
                            >
                              <span className="cursor-pointer flex items-center gap-1">
                                See All <ChevronRight className="h-4 w-4" />
                              </span>
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {card.count === 1 ? "Story Count" : "Stories Count"}
                          </p>

                          {/* Count Display */}
                          <div className="my-6">
                            <p className="text-5xl font-bold text-foreground text-center">
                              {card.count}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
