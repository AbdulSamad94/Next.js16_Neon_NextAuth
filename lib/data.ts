import axios from "axios";
import { Blog } from "./types";
import { User } from "next-auth";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const blogApi = {
  getAllBlogs: async (): Promise<{ posts: Blog[] }> => {
    try {
      const response = await apiClient.get("/blogs");
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },

  // Get blog by ID
  getBlogById: async (slug: string): Promise<{ post: Blog }> => {
    try {
      const response = await apiClient.get(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog with slug ${slug}:`, error);
      throw error;
    }
  },

  // Get blogs by author
  getBlogsByAuthor: async (userId: string): Promise<{ posts: Blog[] }> => {
    try {
      const response = await apiClient.get(`/blogs/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blogs for user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new blog
  createBlog: async (blogData: Partial<Blog>): Promise<Blog> => {
    try {
      const response = await apiClient.post("/blogs", blogData);
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Update an existing blog
  updateBlog: async (slug: string, blogData: Partial<Blog>): Promise<Blog> => {
    try {
      const response = await apiClient.put(`/blogs/${slug}`, blogData);
      return response.data;
    } catch (error) {
      console.error(`Error updating blog with slug ${slug}:`, error);
      throw error;
    }
  },

  // Delete a blog
  deleteBlog: async (slug: string): Promise<void> => {
    try {
      await apiClient.delete(`/blogs/${slug}`);
    } catch (error) {
      console.error(`Error deleting blog with slug ${slug}:`, error);
      throw error;
    }
  },
};

// Auth-related API functions
export const authApi = {
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token?: string }> => {
    try {
      const response = await apiClient.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token?: string }> => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  },

  getUserProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
};

// User-related API functions
export const userApi = {
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },
};

// Comment-related API functions
export const commentApi = {
  getCommentsForBlog: async (blogId: string): Promise<Comment[]> => {
    try {
      const response = await apiClient.get(`/blogs/${blogId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for blog ${blogId}:`, error);
      throw error;
    }
  },

  addCommentToBlog: async (blogId: string, commentData: {
    content: string;
    authorId: string;
  }): Promise<Comment> => {
    try {
      const response = await apiClient.post(`/blogs/${blogId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to blog ${blogId}:`, error);
      throw error;
    }
  },
};