import { create } from 'zustand';
import { adminService, Story, PaginationInfo } from '../services/adminService';
import { toast } from 'react-hot-toast';

interface AdminState {
  storiesInfo: any;
  approvedStories: Story[];
  pendingStories: Story[];
  rejectedStories: Story[];
  
  // Cache for pagination
  approvedStoriesCache: Record<number, Story[]>;
  pendingStoriesCache: Record<number, Story[]>;
  rejectedStoriesCache: Record<number, Story[]>;
  
  // Cache for search results
  searchCache: Record<string, { stories: Story[], pagination: PaginationInfo }>;

  selectedStoryIds: string[];
  currentStory: Story | null;

  // Pagination
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllStoriesInfo: () => Promise<void>;
  fetchApprovedStories: (page?: number, limit?: number, skipCache?: boolean) => Promise<void>;
  fetchApprovedStoryById: (storyId: string) => Promise<void>;
  fetchPendingStories: (page?: number, limit?: number) => Promise<void>;
  fetchPendingStoryById: (storyId: string) => Promise<void>;
  fetchRejectedStories: (page?: number, limit?: number) => Promise<void>;
  fetchRejectedStoryById: (storyId: string) => Promise<void>;
  selectStory: (storyId: string) => void;
  deselectStory: (storyId: string) => void;
  toggleSelectStory: (storyId: string) => void;
  selectAllStories: () => void;
  deselectAllStories: () => void;
  approveStories: (storyIds: string[]) => Promise<void>;
  rejectStories: (storyIds: string[]) => Promise<void>;
  approveSelectedStories: () => Promise<void>;
  rejectSelectedStories: () => Promise<void>;
  searchStories: (searchText: string, storiesType: string, page?: number, limit?: number) => Promise<void>;
  updateStoryCoverImage: (storyId: string, coverPicRef: string, storiesType: 'pending' | 'approved') => Promise<void>;
  updateStory: (storyId: string, storiesType: 'pending' | 'approved', updateData: Partial<Story>) => Promise<void>;
  clearCache: (storyType: 'pending' | 'published' | 'rejected') => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  storiesInfo: [],
  approvedStories: [],
  pendingStories: [],
  rejectedStories: [],
  approvedStoriesCache: {},
  pendingStoriesCache: {},
  rejectedStoriesCache: {},
  searchCache: {},
  selectedStoryIds: [],
  currentStory: null,
  pagination: null,
  isLoading: false,
  error: null,

  updateStory: async (storyId: string, storiesType: 'pending' | 'approved', updateData: Partial<Story>) => {
    set({ isLoading: true, error: null });
    try {
      // Use the API service to update the story
      const response = await adminService.updateStory(storyId, storiesType, updateData);
      
      if (response.success) {
        // Update the story in the appropriate list and cache
        const updateStoryInList = (stories: Story[]) => {
          return stories.map(story => 
            story._id === storyId ? { ...story, ...updateData } : story
          );
        };
        
        // Update state without triggering a page refresh
        set(state => ({
          approvedStories: updateStoryInList(state.approvedStories),
          pendingStories: updateStoryInList(state.pendingStories),
          rejectedStories: updateStoryInList(state.rejectedStories),
          currentStory: state.currentStory?._id === storyId 
            ? { ...state.currentStory, ...updateData } 
            : state.currentStory,
          isLoading: false
        }));
        
        // Update caches without triggering navigation
        Object.keys(get().approvedStoriesCache).forEach(page => {
          const pageNum = parseInt(page);
          set(state => ({
            approvedStoriesCache: {
              ...state.approvedStoriesCache,
              [pageNum]: updateStoryInList(state.approvedStoriesCache[pageNum])
            }
          }));
        });
        
        Object.keys(get().pendingStoriesCache).forEach(page => {
          const pageNum = parseInt(page);
          set(state => ({
            pendingStoriesCache: {
              ...state.pendingStoriesCache,
              [pageNum]: updateStoryInList(state.pendingStoriesCache[pageNum])
            }
          }));
        });
        
        toast.success('Story updated successfully');
      } else {
        set({ isLoading: false, error: 'Failed to update story' });
        toast.error('Failed to update story');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update story' });
      toast.error(error.message || 'Failed to update story');
    }
  },

  updateStoryCoverImage: async (storyId: string, coverPicRef: string, storiesType: 'pending' | 'approved') => {
    set({ isLoading: true, error: null });
    try {
      // Use the API service but don't navigate or refresh the page
      const response = await adminService.updateStoryCoverImage(storyId, coverPicRef, storiesType);
      
      if (response.success) {
        // Update the story in the appropriate list and cache
        const updateStoryInList = (stories: Story[]) => {
          return stories.map(story => 
            story._id === storyId ? { ...story, coverImage: coverPicRef, coverPicRef: coverPicRef } : story
          );
        };
        
        // Update state without triggering a page refresh
        set(state => ({
          approvedStories: updateStoryInList(state.approvedStories),
          pendingStories: updateStoryInList(state.pendingStories),
          rejectedStories: updateStoryInList(state.rejectedStories),
          currentStory: state.currentStory?._id === storyId 
            ? { ...state.currentStory, coverImage: coverPicRef, coverPicRef: coverPicRef } 
            : state.currentStory,
          isLoading: false
        }));
        
        // Update caches without triggering navigation
        Object.keys(get().approvedStoriesCache).forEach(page => {
          const pageNum = parseInt(page);
          set(state => ({
            approvedStoriesCache: {
              ...state.approvedStoriesCache,
              [pageNum]: updateStoryInList(state.approvedStoriesCache[pageNum])
            }
          }));
        });
        
        Object.keys(get().pendingStoriesCache).forEach(page => {
          const pageNum = parseInt(page);
          set(state => ({
            pendingStoriesCache: {
              ...state.pendingStoriesCache,
              [pageNum]: updateStoryInList(state.pendingStoriesCache[pageNum])
            }
          }));
        });
        
        Object.keys(get().rejectedStoriesCache).forEach(page => {
          const pageNum = parseInt(page);
          set(state => ({
            rejectedStoriesCache: {
              ...state.rejectedStoriesCache,
              [pageNum]: updateStoryInList(state.rejectedStoriesCache[pageNum])
            }
          }));
        });
        
        toast.success('Cover image updated successfully');
      } else {
        set({ isLoading: false });
        toast.error(response.message || 'Failed to update cover image');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      set({
        error: 'Failed to update cover image. Please try again.',
        isLoading: false
      });
      toast.error('Failed to update cover image');
    }
  },

  fetchAllStoriesInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllStoriesInfo();
      set({
        storiesInfo: response.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching stories info:', error);
      set({
        error: 'Failed to fetch stories info. Please try again.',
        isLoading: false
      });
    }
  },

  fetchApprovedStories: async (page = 1, limit = 10, skipCache = false) => {
    set({ isLoading: true, error: null });
    try {
      // Check if we already have this page cached and skipCache is false
      const cachedData = get().approvedStoriesCache[page];
      if (cachedData && !skipCache) {
        // Use cached data instead of making an API call
        const currentPagination = get().pagination;
        set({
          approvedStories: cachedData,
          pagination: currentPagination ? {
            currentPage: page,
            totalPages: currentPagination.totalPages || 1,
            totalStories: currentPagination.totalStories || cachedData.length,
            storiesPerPage: currentPagination.storiesPerPage || limit,
            hasNextPage: currentPagination.hasNextPage || false,
            hasPrevPage: page > 1
          } : null,
          isLoading: false
        });
        return;
      }
      
      // If not cached, fetch from API
      const response = await adminService.getApprovedStories(page, limit);
      
      // Update cache with new data
      const updatedCache = {
        ...get().approvedStoriesCache,
        [page]: response.data.stories
      };
      
      set({
        approvedStories: response.data.stories,
        approvedStoriesCache: updatedCache,
        pagination: response.data.pagination,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching approved stories:', error);
      set({
        error: 'Failed to fetch approved stories. Please try again.',
        isLoading: false
      });
    }
  },

  fetchApprovedStoryById: async (storyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getApprovedStoryById(storyId);
      set({
        currentStory: response.data,
        isLoading: false
      });
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      set({
        error: `Failed to fetch story details. Please try again.`,
        isLoading: false
      });
    }
  },

  fetchPendingStories: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      // Check if we already have this page cached
      const cachedData = get().pendingStoriesCache[page];
      if (cachedData) {
        // Use cached data instead of making an API call
        const currentPagination = get().pagination;
        set({
          pendingStories: cachedData,
          pagination: currentPagination ? {
            currentPage: page,
            totalPages: currentPagination.totalPages || 1,
            totalStories: currentPagination.totalStories || cachedData.length,
            storiesPerPage: currentPagination.storiesPerPage || limit,
            hasNextPage: currentPagination.hasNextPage || false,
            hasPrevPage: page > 1
          } : null,
          isLoading: false
        });
        return;
      }
      
      // If not cached, fetch from API
      const response = await adminService.getPendingStories(page, limit);
      
      // Update cache with new data
      const updatedCache = {
        ...get().pendingStoriesCache,
        [page]: response.data.stories
      };
      
      set({
        pendingStories: response.data.stories,
        pendingStoriesCache: updatedCache,
        pagination: response.data.pagination,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching pending stories:', error);
      set({
        error: 'Failed to fetch pending stories. Please try again.',
        isLoading: false
      });
    }
  },

  fetchPendingStoryById: async (storyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getPendingStoryById(storyId);
      set({
        currentStory: response.data,
        isLoading: false
      });
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      set({
        error: `Failed to fetch story details. Please try again.`,
        isLoading: false
      });
    }
  },

  fetchRejectedStories: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      // Check if we already have this page cached
      const cachedData = get().rejectedStoriesCache[page];
      if (cachedData) {
        // Use cached data instead of making an API call
        const currentPagination = get().pagination;
        set({
          rejectedStories: cachedData,
          pagination: currentPagination ? {
            currentPage: page,
            totalPages: currentPagination.totalPages || 1,
            totalStories: currentPagination.totalStories || cachedData.length,
            storiesPerPage: currentPagination.storiesPerPage || limit,
            hasNextPage: currentPagination.hasNextPage || false,
            hasPrevPage: page > 1
          } : null,
          isLoading: false
        });
        return;
      }
      
      // If not cached, fetch from API
      const response = await adminService.getRejectedStories(page, limit);
      
      // Update cache with new data
      const updatedCache = {
        ...get().rejectedStoriesCache,
        [page]: response.data.stories
      };
      
      set({
        rejectedStories: response.data.stories,
        rejectedStoriesCache: updatedCache,
        pagination: response.data.pagination,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching rejected stories:', error);
      set({
        error: 'Failed to fetch rejected stories. Please try again.',
        isLoading: false
      });
    }
  },

  fetchRejectedStoryById: async (storyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getRejectedStoryById(storyId);
      set({
        currentStory: response.data,
        isLoading: false
      });
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      set({
        error: `Failed to fetch story details. Please try again.`,
        isLoading: false
      });
    }
  },

  selectStory: (storyId: string) => {
    set((state) => ({
      selectedStoryIds: [...state.selectedStoryIds, storyId]
    }));
  },

  deselectStory: (storyId: string) => {
    set((state) => ({
      selectedStoryIds: state.selectedStoryIds.filter(id => id !== storyId)
    }));
  },

  toggleSelectStory: (storyId: string) => {
    const { selectedStoryIds } = get();
    if (selectedStoryIds.includes(storyId)) {
      get().deselectStory(storyId);
    } else {
      get().selectStory(storyId);
    }
  },

  selectAllStories: () => {
    const { pendingStories } = get();
    set({
      selectedStoryIds: pendingStories.map(story => story._id)
    });
  },

  deselectAllStories: () => {
    set({ selectedStoryIds: [] });
  },

  approveStories: async (storyIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.approveStories(storyIds);

      if (response.success) {
        // Remove approved stories from the list
        set((state) => ({
          pendingStories: state.pendingStories.filter(
            story => !storyIds.includes(story._id)
          ),
          selectedStoryIds: state.selectedStoryIds.filter(
            id => !storyIds.includes(id)
          ),
          isLoading: false
        }));

        toast.success(response.message || 'Stories approved successfully');
      } else {
        set({ isLoading: false });
        toast.error(response.message || 'Failed to approve stories');
      }
    } catch (error) {
      console.error('Error approving stories:', error);
      set({
        error: 'Failed to approve stories. Please try again.',
        isLoading: false
      });
    }
  },

  rejectStories: async (storyIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.rejectStories(storyIds);

      if (response.success) {
        // Remove rejected stories from the list
        set((state) => ({
          pendingStories: state.pendingStories.filter(
            story => !storyIds.includes(story._id)
          ),
          selectedStoryIds: state.selectedStoryIds.filter(
            id => !storyIds.includes(id)
          ),
          isLoading: false
        }));

        toast.success(response.message || 'Stories rejected successfully');
      } else {
        set({ isLoading: false });
        toast.error(response.message || 'Failed to reject stories');
      }
    } catch (error) {
      console.error('Error rejecting stories:', error);
      set({
        error: 'Failed to reject stories. Please try again.',
        isLoading: false
      });
    }
  },

  approveSelectedStories: async () => {
    const { selectedStoryIds } = get();
    if (selectedStoryIds.length === 0) {
      toast.error('No stories selected');
      return;
    }
    await get().approveStories(selectedStoryIds);
  },

  rejectSelectedStories: async () => {
    const { selectedStoryIds } = get();
    if (selectedStoryIds.length === 0) {
      toast.error('No stories selected');
      return;
    }
    await get().rejectStories(selectedStoryIds);
  },

  // Function to clear cache for a specific story type
  clearCache: (storyType: 'pending' | 'published' | 'rejected') => {
    // Reset all pagination data and the specific cache
    if (storyType === 'pending') {
      set({ 
        pendingStoriesCache: {}, 
        pagination: null,
        pendingStories: [],
      });
    } else if (storyType === 'published') {
      set({ 
        approvedStoriesCache: {}, 
        pagination: null,
        approvedStories: [],
      });
    } else if (storyType === 'rejected') {
      set({ 
        rejectedStoriesCache: {}, 
        pagination: null,
        rejectedStories: [],
      });
    }
  },

  // Updated search function to handle all story types with caching
  searchStories: async (searchText: string, storiesType: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    
    // If search text is empty, fetch regular stories instead
    if (!searchText.trim()) {
      if (storiesType === 'pending') {
        // Clear cache before fetching to ensure fresh data
        get().clearCache('pending');
        await get().fetchPendingStories(1, limit);
      } else if (storiesType === 'published') {
        // Clear cache before fetching to ensure fresh data
        get().clearCache('published');
        await get().fetchApprovedStories(1, limit);
      } else if (storiesType === 'rejected') {
        // Clear cache before fetching to ensure fresh data
        get().clearCache('rejected');
        await get().fetchRejectedStories(1, limit);
      }
      return;
    }
    
    try {
      // Create a cache key using search parameters
      const cacheKey = `${searchText}_${storiesType}_${page}_${limit}`;
      
      // Check if we have cached results for this search
      const cachedData = get().searchCache[cacheKey];
      if (cachedData) {
        // Use cached data instead of making an API call
        if (storiesType === 'pending') {
          set({
            pendingStories: cachedData.stories,
            pagination: cachedData.pagination,
            isLoading: false,
          });
        } else if (storiesType === 'published') {
          set({
            approvedStories: cachedData.stories,
            pagination: cachedData.pagination,
            isLoading: false,
          });
        } else if (storiesType === 'rejected') {
          set({
            rejectedStories: cachedData.stories,
            pagination: cachedData.pagination,
            isLoading: false,
          });
        }
        return;
      }
      
      // If not cached, fetch from API
      const response = await adminService.searchPendingStories(searchText, storiesType, page, limit);
      
      // Store the results in cache
      const updatedCache = {
        ...get().searchCache,
        [cacheKey]: {
          stories: response.data.stories,
          pagination: response.data.pagination
        }
      };
      
      // Update the correct story array based on storiesType
      if (storiesType === 'pending') {
        set({
          pendingStories: response.data.stories,
          pagination: response.data.pagination,
          searchCache: updatedCache,
          isLoading: false,
        });
      } else if (storiesType === 'published') {
        set({
          approvedStories: response.data.stories,
          pagination: response.data.pagination,
          searchCache: updatedCache,
          isLoading: false,
        });
      } else if (storiesType === 'rejected') {
        set({
          rejectedStories: response.data.stories,
          pagination: response.data.pagination,
          searchCache: updatedCache,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error searching stories:", error);
      set({
        error: "Failed to search stories. Please try again.",
        isLoading: false,
      });
    }
  },
}));

export default useAdminStore;