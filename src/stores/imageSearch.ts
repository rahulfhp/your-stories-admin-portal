import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

interface ImageSearchState {
  searchQuery: string;
  unsplashImages: UnsplashImage[];
  isLoadingImages: boolean;
  hasSearched: boolean;
  error: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  searchImages: (query: string) => Promise<void>;
  clearImages: () => void;
  selectImage: (imageUrl: string) => string;
}

export const useImageSearchStore = create<ImageSearchState>()(
  devtools(
    (set, get) => ({
        searchQuery: '',
        unsplashImages: [],
        isLoadingImages: false,
        hasSearched: false,
        error: null,

        setSearchQuery: (query) => set({ searchQuery: query }),
        
        searchImages: async (query) => {
          if (!query.trim()) {
            set({ error: 'Please enter a search term' });
            return;
          }
          
          set({ isLoadingImages: true, error: null, searchQuery: query });
          
          try {
            const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
            const response = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
              {
                headers: {
                  Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
              }
            );
            
            set({ 
              unsplashImages: response.data.results,
              isLoadingImages: false,
              hasSearched: true
            });
          } catch (error) {
            console.error('Error fetching images:', error);
            set({ 
              unsplashImages: [],
              error: 'Failed to fetch images. Please try again.',
              isLoadingImages: false,
              hasSearched: true
            });
          } finally {
            set({ isLoadingImages: false });
          }
        },
        
        clearImages: () => set({ 
          unsplashImages: [],
          hasSearched: false,
          searchQuery: ''
        }),
        
        selectImage: (imageUrl) => {
          // Return the selected image URL with proper attribution
          // Format the URL to include required attribution parameters
          const formattedUrl = `${imageUrl}?utm_source=your_app_name&utm_medium=referral`;
          return formattedUrl;
        }
      })
  )
);