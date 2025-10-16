"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/auth";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function DashboardPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<
    null | "approve" | "reject"
  >(null);

  const {
    pendingStories,
    pagination,
    selectedStoryIds,
    isLoading: storiesLoading,
    error,
    fetchPendingStories,
    toggleSelectStory,
    selectAllStories,
    deselectAllStories,
    approveSelectedStories,
    rejectSelectedStories,
  } = useAdminStore();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isLoading) return;

    let mounted = true;
    const load = async () => {
      setIsPaginating(true);
      await fetchPendingStories(currentPage, 10);
      if (mounted) setIsPaginating(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchPendingStories, currentPage, isLoading]);

  const handleSelectAll = () => {
    if (selectAll) {
      deselectAllStories();
    } else {
      selectAllStories();
    }
    setSelectAll(!selectAll);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    deselectAllStories();
    setSelectAll(false);
  };

  const handleViewStory = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  const handleApproveSelected = async () => {
    if (selectedStoryIds.length === 0) {
      toast.error("No stories selected");
      return;
    }
    setConfirmAction("approve");
  };

  const handleRejectSelected = async () => {
    if (selectedStoryIds.length === 0) {
      toast.error("No stories selected");
      return;
    }
    setConfirmAction("reject");
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleModalConfirm = async () => {
    if (confirmAction === "approve") {
      await approveSelectedStories();
    } else {
      await rejectSelectedStories();
    }
    setConfirmAction(null);
    setSelectAll(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 md:px-12 py-8 bg-background text-foreground min-h-screen pt-20">
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Pending Stories</h2>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={handleRejectSelected}
              disabled={selectedStoryIds.length === 0 || storiesLoading}
              className="cursor-pointer w-full sm:w-auto"
            >
              Reject Selected
            </Button>
            <Button
              variant="default"
              onClick={handleApproveSelected}
              disabled={selectedStoryIds.length === 0 || storiesLoading}
              className="cursor-pointer w-full sm:w-auto"
            >
              Approve Selected
            </Button>
          </div>
        </div>

        {storiesLoading && pendingStories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-6">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchPendingStories(currentPage, 10)}
            >
              Retry
            </Button>
          </div>
        ) : pendingStories.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No pending stories found</p>
          </div>
        ) : (
          <>
            <div
              className={`overflow-x-auto ${
                storiesLoading || isPaginating
                  ? "opacity-60 pointer-events-none transition-opacity duration-200"
                  : ""
              }`}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all stories"
                      />
                    </th>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Author</th>
                    <th className="py-3 px-4 text-left">Submitted</th>
                    <th className="py-3 px-4 text-left">Tags</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStories.map((story) => (
                    <tr key={story._id} className="border-b hover:bg-muted/50">
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedStoryIds.includes(story._id)}
                          onCheckedChange={() => toggleSelectStory(story._id)}
                          aria-label={`Select story ${story.storyTitle}`}
                        />
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {story.storyTitle}
                      </td>
                      <td className="py-3 px-4">{story.userName}</td>
                      <td className="py-3 px-4">
                        {formatDate(story.submissionDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {story.tagList.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {story.tagList.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{story.tagList.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStory(story._id)}
                            className="cursor-pointer"
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {pendingStories.length} of {pagination.totalStories}{" "}
                  stories
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {(storiesLoading || isPaginating) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ConfirmModal for the approve and reject buttons */}
      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction === "approve"
            ? "Approve selected stories?"
            : "Reject selected stories?"
        }
        description={
          confirmAction === "approve"
            ? "Once approved, these stories will be published and visible to users."
            : "Once rejected, these stories will be removed from the pending list."
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
