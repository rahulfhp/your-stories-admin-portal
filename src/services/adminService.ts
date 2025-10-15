import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PendingStory {
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
    stories: PendingStory[];
    pagination: PaginationInfo;
  };
}

export interface StoryDetailResponse {
  success: boolean;
  message: string;
  data: PendingStory;
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
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("ys_access_token")
      : null;

  return {
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if needed
      ...(token && { Authorization: `Bearer ${token}` }),
      "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
    },
  };
};


export const adminService = {
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
  }
};

export default adminService;