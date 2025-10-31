"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/auth";
import { SearchInput } from "@/components/ui/SearchInput";
import { ImageSelectionModal } from "@/components/ui/ImageSelectionModal";
import { toast } from "react-hot-toast";
import { adminService } from "@/services/adminService";

export default function ApprovePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const [searchText, setSearchText] = useState(""); // Track search state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState("");

  const {
    approvedStories,
    pagination,
    isLoading: storiesLoading,
    error,
    fetchApprovedStories,
    searchStories,
    updateStoryCoverImage,
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

      // Check if we're in search mode or normal mode
      if (searchText) {
        await searchStories(searchText, "published", currentPage, 10);
      } else {
        await fetchApprovedStories(currentPage, 10);
      }

      if (mounted) setIsPaginating(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchApprovedStories, searchStories, currentPage, isLoading, searchText]);

  const handleSearch = (searchTerm: string) => {
    setSearchText(searchTerm);
    setCurrentPage(1); // Reset to page 1 when searching
    // The useEffect will handle the API call
  };

  const handleClearSearch = () => {
    setSearchText("");
    setCurrentPage(1); // Reset to page 1 when clearing search
    
    // Force a fresh API call by bypassing cache completely
    // This will update the pagination counts at the bottom
    adminService.getApprovedStories(1, 10).then(response => {
      useAdminStore.setState({
        approvedStories: response.data.stories,
        pagination: response.data.pagination,
        approvedStoriesCache: {}, // Clear cache
        isLoading: false
      });
    }).catch(error => {
      console.error('Error fetching approved stories:', error);
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleViewStory = (storyId: string) => {
    router.push(`/story/${storyId}?source=approve`);
  };

  const handleEditCoverImage = (storyId: string) => {
    setSelectedStoryId(storyId);
    setImageModalOpen(true);
  };

  const handleSelectImage = async (imageUrl: string) => {
    if (selectedStoryId) {
      try {
        await updateStoryCoverImage(selectedStoryId, imageUrl, 'approved');
        // Refresh the stories list
        if (searchText) {
          await searchStories(searchText, "published", currentPage, 10);
        } else {
          await fetchApprovedStories(currentPage, 10);
        }
        // Toast is already shown in the admin store
      } catch (error) {
        console.error("Error updating cover image:", error);
        // Toast is already shown in the admin store
      }
    }
    setImageModalOpen(false);
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 md:px-12 py-8 bg-background text-foreground pt-24 min-h-screen">
      <h1 className="text-3xl font-bold my-6">Approved Stories</h1>
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <SearchInput
            placeholder="Search approve stories..."
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={storiesLoading}
          />
        </div>

        {storiesLoading && approvedStories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-6">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                if (searchText) {
                  handleSearch(searchText);
                } else {
                  fetchApprovedStories(currentPage, 10);
                }
              }}
            >
              Retry
            </Button>
          </div>
        ) : approvedStories.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No approve stories found</p>
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
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Author</th>
                    <th className="py-3 px-4 text-left">Submitted</th>
                    <th className="py-3 px-4 text-left">Tags</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedStories.map((story) => (
                    <tr key={story._id} className="border-b hover:bg-muted/50">
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
                            className="cursor-pointer border-black"
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCoverImage(story._id)}
                            className="cursor-pointer border-black"
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            {story.coverPicRef || story.profilePicRef ? 'Edit Cover' : 'Add Cover'}
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
                  Showing {(pagination.currentPage - 1) * pagination.storiesPerPage + 1}-{Math.min(pagination.currentPage * pagination.storiesPerPage, pagination.totalStories)} of {pagination.totalStories}{" "}
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

      {/* Image Selection Modal */}
      <ImageSelectionModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelectImage={handleSelectImage}
        title="Choose Cover Image"
      />
    </div>
  );
}
