import axiosInstance from './axiosConfig';
import axios, { AxiosError } from 'axios';

// Types
export interface PostAuthor {
  id: string;
  username: string;
  email?: string;
}

export interface PostList {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  reading_time: number;
  tags?: string[];
  author: PostAuthor;
  published: boolean;
  created_at: string;
}

// Add a new interface that extends PostList[] with totalCount
export interface PostListResponse {
  items: PostList[];
  total_count: number;
  has_more: boolean;
  limit: number;
  skip: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags?: string[];
  published?: boolean;
  reading_time: number;
  author: PostAuthor;
  created_at: string;
  updated_at: string;
}

export interface PostCreate {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
}

export interface DeletePostResponse {
  message: string;
  deleted_item: {
    id: string;
    title: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  is_superuser: boolean;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Error handler helper
const handleApiError = (error: unknown): never => {
  let errorMsg = 'An unexpected error occurred';
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    errorMsg = axiosError.response?.data?.detail || 
               axiosError.response?.data?.message || 
               axiosError.message || 
               'API request failed';
  } else if (error instanceof Error) {
    errorMsg = error.message;
  }
  
  throw new Error(errorMsg);
};

// Blog API functions

/**
 * Get all posts
 * @param skip Number of posts to skip (for pagination)
 * @param limit Maximum number of posts to return
 * @param publishedStatus Filter by publication status: 'published' (default), 'unpublished', or 'all'
 * @param search Optional search term for filtering posts
 * @param tag Optional tag to filter posts by
 * @returns Object containing post items and pagination metadata
 */
export const getAllPosts = async (
  skip: number = 0, 
  limit: number = 10, 
  publishedStatus: "published" | "unpublished" | "all" = "published",
  search?: string,
  tag?: string
): Promise<PostListResponse> => {
  try {
    // Use correct endpoint for listing posts with pagination
    const response = await axiosInstance.get('/blog', {
      params: { 
        skip, 
        limit,
        published_status: publishedStatus,
        search,
        tag
      }
    });
    
    // The API now returns a structured response with pagination metadata
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new blog post
 * Requires authentication - only authenticated users can create posts
 */
export const createPost = async (postData: PostCreate): Promise<Post> => {
  try {
    // Ensure we're setting default values if needed
    const completePostData = {
      ...postData,
      published: postData.published ?? false,
      tags: postData.tags ?? [],
      // Add a placeholder excerpt if none is provided
      excerpt: postData.excerpt ?? ""
    };
    
    const response = await axiosInstance.post('/blog/admin', completePostData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a specific post by slug
 * This endpoint only returns published posts
 */
export const getPostBySlug = async (slug: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`/blog/${slug}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update an existing post
 * Requires authentication - only post author or superuser can update posts
 * @param postId ID of the post to update
 * @param postData Updated post data
 */
export const updatePost = async (postId: string, postData: PostCreate): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`/blog/admin/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a post
 * Requires authentication - only superuser can delete posts
 * @param postId ID of the post to delete
 */
export const deletePost = async (postId: string): Promise<DeletePostResponse> => {
  try {
    const response = await axiosInstance.delete(`/blog/admin/${postId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a specific post by slug for editing purposes.
 * This function is intended for authenticated users to retrieve full post content.
 * @param slug The URL-friendly identifier of the post.
 */
export const getPostBySlugForEdit = async (slug: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`/blog/${slug}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get total count of posts
 * @param publishedStatus Filter by publication status: 'published' (default), 'unpublished', or 'all'
 * @param search Optional search term for filtering posts
 * @param tag Optional tag to filter posts by
 */
export const getPostCount = async (
  publishedStatus: "published" | "unpublished" | "all" = "published",
  search?: string,
  tag?: string
): Promise<number> => {
  try {
    // With the new API format, we can get the total count by requesting just 1 item
    // since the pagination metadata is included in the response
    const response = await getAllPosts(
      0,
      1, // We just need 1 item since we only want the count
      publishedStatus,
      search,
      tag
    );
    
    // Return the total_count provided by the API
    return response.total_count;
  } catch (error) {
    console.error('Error getting post count:', error);
    throw handleApiError(error);
  }
};

// User API functions

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get('/auth/users');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (userData: { 
  username: string, 
  email: string, 
  password: string, 
  is_superuser?: boolean 
}): Promise<User> => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: string): Promise<{
  message: string;
  deleted_item: {
    id: string;
    username: string;
  };
}> => {
  try {
    const response = await axiosInstance.delete(`/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
