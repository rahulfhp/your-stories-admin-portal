"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";

interface StoryDetailPageProps {
  params: {
    storyId: string;
  };
}

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = params;
  const router = useRouter();

  const {
    currentStory,
    isLoading,
    error,
    fetchStoryById,
    approveStories,
    rejectStories,
  } = useAdminStore();

  useEffect(() => {
    fetchStoryById(storyId);
  }, [fetchStoryById, storyId]);

  const handleApprove = async () => {
    await approveStories([storyId]);
    router.push("/dashboard");
  };

  const handleReject = async () => {
    await rejectStories([storyId]);
    router.push("/dashboard");
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !currentStory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p className="text-destructive mb-6">{error || "Story not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <div className="bg-card rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{currentStory.storyTitle}</h1>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleReject}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleApprove}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Author
            </h3>
            <p className="font-medium">{currentStory.userName}</p>
            <p className="text-sm text-muted-foreground">
              {currentStory.userEmail}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Submission Date
            </h3>
            <p>{formatDate(currentStory.submissionDate)}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {currentStory.tagList.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {currentStory.userDetails && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Author's Description</h3>
            <div className="bg-muted/50 p-4 rounded-md">
              <p>{currentStory.userDetails}</p>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-4">Story Content</h3>
          <div className="bg-muted/50 p-6 rounded-md whitespace-pre-wrap">
            {currentStory.storyContent}
          </div>
        </div>
      </div>
    </div>
  );
}