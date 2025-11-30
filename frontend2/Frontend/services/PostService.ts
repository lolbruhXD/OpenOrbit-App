import axios from 'axios';
import { authService } from './AuthService';
import { API_CONFIG } from '../config/api';

// Define the API configuration type
interface ApiConfig {
  BASE_URL: string;
  WEBSOCKET_URL: string;
  METRO_URL?: string;
  ENDPOINTS: {
    AUTH: {
      LOGIN: string;
      REGISTER: string;
      PROFILE: string;
    };
    POSTS: {
      ALL: string;
      MY_POSTS: string;
      CREATE: string;
    };
    UPLOAD: {
      SINGLE: string;
    };
  };
}

// Type assertion for API_CONFIG
const apiConfig = API_CONFIG as ApiConfig;

export interface Post {
  _id: string;
  title: string;
  language?: string;
  code?: string;
  summary?: string;
  tags: string[];
  media_url?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  likes: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  language?: string;
  code?: string;
  summary?: string;
  tags?: string[];
  media_url?: string;
}

export interface PostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

class PostService {
  private async makeRequest(url: string, options: any = {}) {
    try {
      console.log('Attempting request to:', url);
      const response = await axios.get(url, options);
      return response.data;
    } catch (error: any) {
      console.error('Request failed:', error.message);
      throw error;
    }
  }

  async getAllPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const url = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.POSTS.ALL}`;
    const response = await this.makeRequest(url, {
        params: { page, limit }
    });
    return response;
}

  async getMyPosts(): Promise<Post[]> {
    try {
      const response = await this.makeRequest(`${API_CONFIG.BASE_URL}/posts`);
      return response;
    } catch (error) {
      console.error('Error fetching my posts:', error);
      throw new Error('Failed to fetch your posts');
    }
  }

  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await this.makeRequest(`${API_CONFIG.BASE_URL}/posts/${postId}`);
      return response;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw new Error('Failed to fetch post');
    }
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/posts`, postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  async updatePost(postId: string, postData: Partial<CreatePostData>): Promise<Post> {
    try {
      const response = await axios.put(`${API_CONFIG.BASE_URL}/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/posts/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      await axios.put(`${API_CONFIG.BASE_URL}/posts/${postId}/like`);
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Failed to like post');
    }
  }

  // File upload methods
  async uploadFile(formData: FormData): Promise<{ file: any }> {
    try {
      const token = await authService.getToken();
      const headers: any = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading to:', `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.UPLOAD.SINGLE}`);
      const response = await axios.post(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.UPLOAD.SINGLE}`, 
        formData,
        { headers });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: any[]): Promise<{ files: any[] }> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.UPLOAD.SINGLE}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  }
}

export const postService = new PostService();
export default postService;
