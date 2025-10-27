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

  selectedStoryIds: string[];
  currentStory: Story | null;

  // Pagination
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllStoriesInfo: () => Promise<void>;
  fetchApprovedStories: (page?: number, limit?: number) => Promise<void>;
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
}

export const useAdminStore = create<AdminState>((set, get) => ({
  storiesInfo: [],
  approvedStories: [],
  pendingStories: [],
  rejectedStories: [],
  approvedStoriesCache: {},
  pendingStoriesCache: {},
  rejectedStoriesCache: {},
  selectedStoryIds: [],
  currentStory: null,
  pagination: null,
  isLoading: false,
  error: null,

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

  fetchApprovedStories: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      // Check if we already have this page cached
      const cachedData = get().approvedStoriesCache[page];
      if (cachedData) {
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

  // Updated search function to handle all story types
  searchStories: async (searchText: string, storiesType: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.searchPendingStories(searchText, storiesType, page, limit);

      // Update the correct story array based on storiesType
      if (storiesType === 'pending') {
        set({
          pendingStories: response.data.stories,
          pagination: response.data.pagination,
          isLoading: false,
        });
      } else if (storiesType === 'published') {
        set({
          approvedStories: response.data.stories,
          pagination: response.data.pagination,
          isLoading: false,
        });
      } else if (storiesType === 'rejected') {
        set({
          rejectedStories: response.data.stories,
          pagination: response.data.pagination,
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