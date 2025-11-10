"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useImageSearchStore, UnsplashImage } from "@/stores/imageSearch";

interface ImageSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
}

export function ImageSelectionModal({
  open,
  onClose,
  onSelectImage,
  title = "Choose Cover Image",
}: ImageSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    unsplashImages,
    isLoadingImages,
    hasSearched,
    searchImages,
    selectImage,
  } = useImageSearchStore();
  
  // Clear search data when modal is opened
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      useImageSearchStore.getState().clearImages();
    }
  }, [open]);

  const handleImageSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Use the store's search function
    try {
      await searchImages(searchQuery);
    } catch (error) {
      console.error('Error searching for images:', error);
    }
  };

  const handleSearchInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleImageSearch();
    }
  };

  const handleImageSelect = (image: UnsplashImage) => {
    const selectedUrl = selectImage(image.urls.regular);
    onSelectImage(selectedUrl);
    onClose();
  };

  const handleImageGalleryClose = (open: boolean) => {
    if (!open) {
      onClose();
      // Clear search results when modal is closed
      setSearchQuery("");
      useImageSearchStore.getState().clearImages();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleImageGalleryClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] bg-white/95 dark:bg-white/10 backdrop-blur-xl border border-gray-300/60 dark:border-white/20 text-gray-800 dark:text-white overflow-hidden z-[9999]">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <PhotoIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 dark:text-white" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-white/70">
                Select from our curated collection of high-quality images
              </p>
            </div>
          </div>

          {/* Search Bar */} 
          <div className="mb-4 sm:mb-6"> 
            <div className="relative"> 
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyPress={handleSearchInputKeyPress} 
                placeholder="Search for images..." 
                className="w-full bg-white/60 dark:bg-white/10 border border-gray-300/60 dark:border-white/20 rounded-lg sm:rounded-xl px-10 sm:px-12 py-2.5 sm:py-3 pr-20 sm:pr-24 text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-gray-400/80 dark:focus:border-white/40" 
              /> 
              <PhotoIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-white/50" /> 
              <Button 
                type="button"
                onClick={() => handleImageSearch()} 
                disabled={isLoadingImages} 
                className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 bg-gray-200/80 dark:bg-white/20 hover:bg-gray-300/90 dark:hover:bg-white/30 text-gray-800 dark:text-white border border-gray-300/60 dark:border-white/20 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm" 
              > 
                {isLoadingImages ? "Searching..." : "Search"} 
              </Button> 
            </div> 
          </div> 
 
          {/* Image Grid */} 
          <div className="h-[60vh] overflow-y-auto custom-scrollbar p-1 sm:p-2 pr-3"> 
            {isLoadingImages ? ( 
              <div className="flex items-center justify-center py-8 sm:py-12"> 
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-800 dark:border-white"></div> 
                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600 dark:text-white/70"> 
                  Searching for images... 
                </span> 
              </div> 
            ) : unsplashImages.length > 0 ? ( 
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-8"> 
                {unsplashImages.map((image: UnsplashImage) => ( 
                  <div 
                    key={image.id} 
                    onClick={() => handleImageSelect(image)} 
                    className="relative cursor-pointer rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 aspect-square hover:shadow-lg m-1" 
                  > 
                    <img 
                      src={image.urls.small} 
                      alt={image.alt_description || "Unsplash image"} 
                      className="w-full h-full object-cover" 
                    /> 
                  </div> 
                ))} 
              </div> 
            ) : hasSearched ? ( 
              <div className="text-center py-8 sm:py-12"> 
                <PhotoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-white/30 mx-auto mb-3 sm:mb-4" /> 
                <p className="text-base sm:text-lg text-gray-600 dark:text-white/70"> 
                  No images found for "{searchQuery}" 
                </p> 
                <p className="text-xs sm:text-sm text-gray-500 dark:text-white/50 mt-1 sm:mt-2"> 
                  Try searching for different keywords 
                </p> 
              </div> 
            ) : ( 
              <div className="text-center py-8 sm:py-12"> 
                <PhotoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-white/30 mx-auto mb-3 sm:mb-4" /> 
                <p className="text-base sm:text-lg text-gray-600 dark:text-white/70"> 
                  Search for images to get started 
                </p> 
                <p className="text-xs sm:text-sm text-gray-500 dark:text-white/50 mt-1 sm:mt-2"> 
                  Enter keywords and press Enter or click Search 
                </p> 
              </div> 
            )} 
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}