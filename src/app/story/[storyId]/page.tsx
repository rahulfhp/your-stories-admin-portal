"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface StoryDetailPageProps {
  params: {
    storyId: string;
  };
}

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = params;
  const router = useRouter();

  const [confirmAction, setConfirmAction] = useState<
    null | "approve" | "reject"
  >(null);

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

  const handleApprove = () => setConfirmAction("approve");

  const handleReject = () => setConfirmAction("reject");

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleModalConfirm = async () => {
    if (confirmAction === "approve") {
      await approveStories([storyId]);
    } else {
      await rejectStories([storyId]);
    }
    setConfirmAction(null);
    router.push("/");
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
    <div className="mx-auto px-4 md:px-12 py-8 pt-30 bg-background text-foreground min-h-screen">
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

      {/* ConfirmModal for the approve and reject buttons */}
      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction === "approve"
            ? "Approve this story?"
            : "Reject this story?"
        }
        description={
          confirmAction === "approve"
            ? "This story will be published and visible to users."
            : "This story will be rejected and removed from the pending list."
        }
        confirmLabel="Yes"
        cancelLabel="No"
        variant={confirmAction === "approve" ? "default" : "destructive"}
        onConfirm={handleModalConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}