import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Story {
  _id: string;
  storyTitle: string;
  storyContent: string;
  userName: string;
  userEmail: string;
  userDetails: string;
  tagList: string[];
  submissionDate: number;
  status: number;
  readCount: number;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
  coverPicRef?: string;
  profilePicRef?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStories: number;
  storiesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PendingStoriesResponse {
  success: boolean;
  message: string;
  data: {
    stories: Story[];
    pagination: PaginationInfo;
  };
}

export interface StoryDetailResponse {
  success: boolean;
  message: string;
  data: Story;
}

export interface ApproveRejectResponse {
  success: boolean;
  message: string;
  data: {
    approved?: {
      storyId: string;
      title: string;
      publishedId: string;
    }[];
    rejected?: {
      storyId: string;
      reason: string;
    }[];
    failed: {
      storyId: string;
      reason: string;
    }[];
    summary: {
      totalRequested: number;
      successfullyApproved?: number;
      successfullyRejected?: number;
      failed: number;
    };
  };
}

// Create axios config - adjust headers as needed
const getConfig = () => {
  // Safely access localStorage only on client side
  const authStorage = localStorage.getItem("auth-storage");

  let accessToken = null;
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      // Zustand persist middleware stores data in a 'state' property
      accessToken = parsed.state?.accessToken || parsed.accessToken;
      console.log("Extracted token:", accessToken ? "Token found" : "No token");
    } catch (error) {
      console.error("Error parsing auth storage:", error);
    }
  }

  return {
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if needed
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
    },
  };
};


export const adminService = {
  // Update story fields
  updateStory: async (storyId: string, storiesType: 'pending' | 'approved', updateData: Partial<Story>): Promise<any> => {
    try {
      // Destructure the updateData to match API request body format
      const requestBody = {
        storyId,
        storiesType,
        ...updateData
      };
      
      const response = await axios.put(
        `${API_BASE_URL}admin/update-story`,
        requestBody,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  },
  
  // Update story cover image
  updateStoryCoverImage: async (storyId: string, imageUrl: string, storiesType: 'pending' | 'approved'): Promise<any> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}admin/update-story`,
        { 
          storyId,
          profilePicRef: imageUrl,
          storiesType
        },
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating story cover image:', error);
      throw error;
    }
  },

  // Get all the stories information
  getAllStoriesInfo: async (): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}admin/stories-counts`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching stories details:', error);
      throw error;
    }
  },

  // Get approved stories with pagination
  getApprovedStories: async (page: number = 1, limit: number = 10): Promise<PendingStoriesResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}publishedStories?page=${page}&limit=${limit}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching approved stories:', error);
      throw error;
    }
  },

  // Get a single approved story by ID
  getApprovedStoryById: async (storyId: string): Promise<StoryDetailResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}publishedStories/${storyId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      throw error;
    }
  },

  // Get pending stories with pagination
  getPendingStories: async (page: number = 1, limit: number = 10): Promise<PendingStoriesResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}pendingStories?page=${page}&limit=${limit}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pending stories:', error);
      throw error;
    }
  },

  // Get a single pending story by ID
  getPendingStoryById: async (storyId: string): Promise<StoryDetailResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}pendingStories/${storyId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      throw error;
    }
  },

  // Get rejected stories with pagination
  getRejectedStories: async (page: number = 1, limit: number = 10): Promise<PendingStoriesResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}rejectStories/rejected?page=${page}&limit=${limit}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected stories:', error);
      throw error;
    }
  },

  // Get a single rejected story by ID
  getRejectedStoryById: async (storyId: string): Promise<StoryDetailResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}rejectStories/rejected/${storyId}`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching story with ID ${storyId}:`, error);
      throw error;
    }
  },

  // Approve stories (single or multiple)
  approveStories: async (storyIds: string[]): Promise<ApproveRejectResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}pendingStories/approve`,
        { storyIds },
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error approving stories:', error);
      throw error;
    }
  },

  // Reject stories (single or multiple)
  rejectStories: async (storyIds: string[]): Promise<ApproveRejectResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}rejectStories/reject`,
        { storyIds },
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting stories:', error);
      throw error;
    }
  },

  // Search stories
  searchPendingStories: async (
    searchText: string,
    storiesType: string,
    page = 1,
    limit = 10
  ): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}admin/search-stories`,
        {
          params: { searchText, storiesType, page, limit },
          ...getConfig(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching pending stories:", error);
      throw error;
    }
  },
};

export default adminService;