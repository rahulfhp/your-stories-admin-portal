"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Edit, Save } from "lucide-react";
import { format } from "date-fns";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ImageSelectionModal } from "@/components/ui/ImageSelectionModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StoryDetailPageProps {
  params: Promise<{
    storyId: string;
  }>;
}

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source"); // 'pending', 'approve', or 'reject'

  const [confirmAction, setConfirmAction] = useState<
    null | "approve" | "reject"
  >(null);
  
  const [imageEditType, setImageEditType] = useState<null | "profile" | "cover">(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStory, setEditedStory] = useState({
    storyTitle: '',
    storyContent: '',
    userName: '',
    userEmail: '',
    userDetails: '',
    tagList: [] as string[],
  });

  const {
    currentStory,
    isLoading,
    error,
    fetchPendingStoryById,
    fetchApprovedStoryById,
    fetchRejectedStoryById,
    approveStories,
    rejectStories,
    updateStoryCoverImage,
    updateStory
  } = useAdminStore();

  useEffect(() => {
    // Fetch the appropriate story based on source
    if (source === "pending") {
      fetchPendingStoryById(storyId);
    } else if (source === "approve") {
      fetchApprovedStoryById(storyId);
    } else if (source === "reject") {
      fetchRejectedStoryById(storyId);
    } else {
      // Default to pending if no source is specified
      fetchPendingStoryById(storyId);
    }
  }, [
    storyId,
    source,
    fetchPendingStoryById,
    fetchApprovedStoryById,
    fetchRejectedStoryById,
  ]);
  
  // State to track if there are any changes
  const [hasChanges, setHasChanges] = useState(false);

  // State to track raw tag input
  const [tagInput, setTagInput] = useState('');
  
  // Initialize editedStory when currentStory changes
  useEffect(() => {
    if (currentStory) {
      setEditedStory({
        storyTitle: currentStory.storyTitle || '',
        storyContent: currentStory.storyContent || '',
        userName: currentStory.userName || '',
        userEmail: currentStory.userEmail || '',
        userDetails: currentStory.userDetails || '',
        tagList: currentStory.tagList || [],
      });
      // Initialize tag input with joined tags
      setTagInput((currentStory.tagList || []).join(', '));
      setHasChanges(false);
    }
  }, [currentStory]);

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
      if (source) {
        router.back();
      } else {
        router.push("/");
      }
    } else if (confirmAction === "reject") {
      await rejectStories([storyId]);
      if (source) {
        router.back();
      } else {
        router.push("/");
      }
    }
    setConfirmAction(null);
  };
  
  const handleEditImage = (type: "profile" | "cover") => {
    setImageEditType(type);
    setIsImageModalOpen(true);
  };
  
  const handleSelectImage = async (imageUrl: string) => {
    if (currentStory && imageEditType) {
      try {
        // Determine the stories type based on the source
        const storiesType = source === "approve" ? "approved" : "pending";
        
        // Use the updateStoryCoverImage from the admin store instead of calling the API directly
        // The admin store already shows a toast notification, so we don't need to show one here
        await updateStoryCoverImage(storyId, imageUrl, storiesType as 'pending' | 'approved');
        
        // Update UI immediately for better UX
        if (imageEditType === "profile") {
          currentStory.profilePicRef = imageUrl;
        } else {
          currentStory.coverPicRef = imageUrl;
        }
      } catch (error) {
        console.error("Error updating image:", error);
        // No need to show error toast here as it's already shown in the admin store
      }
    }
    setIsImageModalOpen(false);
    setImageEditType(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newEditedStory = {
      ...editedStory,
      [name]: value
    };
    setEditedStory(newEditedStory);
    
    // Check if there are any changes
    checkForChanges(newEditedStory);
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    // Store the raw input
    setTagInput(tagsString);
    
    // Process tags for the data model
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const newEditedStory = {
      ...editedStory,
      tagList: tagsArray
    };
    setEditedStory(newEditedStory);
    
    // Check if there are any changes
    checkForChanges(newEditedStory);
  };
  
  // Function to check if there are any changes compared to the original story
  const checkForChanges = (newEditedStory: typeof editedStory) => {
    if (!currentStory) return;
    
    const hasChanged = 
      newEditedStory.storyTitle !== (currentStory.storyTitle || '') ||
      newEditedStory.storyContent !== (currentStory.storyContent || '') ||
      newEditedStory.userName !== (currentStory.userName || '') ||
      newEditedStory.userEmail !== (currentStory.userEmail || '') ||
      newEditedStory.userDetails !== (currentStory.userDetails || '') ||
      JSON.stringify(newEditedStory.tagList) !== JSON.stringify(currentStory.tagList || []);
    
    setHasChanges(hasChanged);
  };
  
  const handleSaveChanges = async () => {
    if (!currentStory || !editedStory || !hasChanges) return;
    
    try {
      const storiesType = source === "approve" ? "approved" : "pending";
      await updateStory(storyId, storiesType as 'pending' | 'approved', editedStory);
      setIsEditMode(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving story changes:", error);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset to original values
    if (currentStory) {
      setEditedStory({
        storyTitle: currentStory.storyTitle || '',
        storyContent: currentStory.storyContent || '',
        userName: currentStory.userName || '',
        userEmail: currentStory.userEmail || '',
        userDetails: currentStory.userDetails || '',
        tagList: currentStory.tagList || [],
      });
      // Reset tag input
      setTagInput((currentStory.tagList || []).join(', '));
    }
    setIsEditMode(false);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !currentStory) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
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
        <div className="flex justify-between gap-6 items-start mb-6 flex-wrap">
          {!isEditMode ? (
            <>
              <h1 className="text-3xl font-bold">{currentStory.storyTitle}</h1>
              <div className="flex gap-3 flex-wrap">
                {/* Edit button only visible if not coming from reject screen */}
                {source !== "reject" && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Story
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full mb-4">
              <h1 className="text-2xl font-bold">Edit Story</h1>
            </div>
          )}
        </div>

        {!isEditMode ? (
          <>
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

            <div className="w-full flex items-center justify-center">
              {(currentStory.profilePicRef || currentStory.coverPicRef) && (
                <div className="mb-6 w-full md:w-[600px] aspect-[16/9] relative group">
                  <img
                    src={currentStory.profilePicRef || currentStory.coverPicRef}
                    alt="Story Image"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="opacity-90 hover:opacity-100"
                      onClick={() => handleEditImage(currentStory.coverPicRef ? "cover" : "profile")}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Cover Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {currentStory.userDetails && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Author's Description</h3>
                <div className="bg-muted/50 p-4 rounded-md text-wrap">
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

            {/* Approve/Reject buttons at the bottom for pending stories */}
            {source === "pending" && (
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button
                  variant="default"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleApprove}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Edit form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="storyTitle" className="mb-2 block">Story Title</Label>
                  <Input 
                    id="storyTitle" 
                    name="storyTitle" 
                    value={editedStory.storyTitle} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="userName" className="mb-2 block">Author Name</Label>
                  <Input 
                    id="userName" 
                    name="userName" 
                    value={editedStory.userName} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="userEmail" className="mb-2 block">Author Email</Label>
                  <Input 
                    id="userEmail" 
                    name="userEmail" 
                    value={editedStory.userEmail} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags" className="mb-2 block">Tags (comma separated)</Label>
                  <Input 
                    id="tags" 
                    name="tags" 
                    value={tagInput} 
                    onChange={handleTagsChange}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userDetails" className="mb-2 block">Author's Description</Label>
                  <Textarea 
                    id="userDetails" 
                    name="userDetails" 
                    value={editedStory.userDetails} 
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="storyContent" className="mb-2 block">Story Content</Label>
                <Textarea 
                  id="storyContent" 
                  name="storyContent" 
                  value={editedStory.storyContent} 
                  onChange={handleInputChange}
                  className="min-h-[300px]"
                />
              </div>
            </div>
            
            {/* Save and Cancel buttons at the bottom */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={handleSaveChanges}
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
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
      
      {/* Image Selection Modal */}
      <ImageSelectionModal
        open={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setImageEditType(null);
        }}
        onSelectImage={handleSelectImage}
        title="Choose Cover Image"
      />
    </div>
  );
}