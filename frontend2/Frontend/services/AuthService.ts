import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  leecodeProfile?: {
    username: string;
    problemsSolved: number;
    rating: number;
  };
  githubProfile?: {
    username: string;
    contributions: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      const { token, _id, name, email: userEmail } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify({ _id, name, email: userEmail }));
      
      // Update instance variables
      this.token = token;
      this.user = { _id, name, email: userEmail };
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { user: this.user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        name,
        email,
        password,
      });

      const { token, _id, name: userName, email: userEmail } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify({ _id, name: userName, email: userEmail }));
      
      // Update instance variables
      this.token = token;
      this.user = { _id, name: userName, email: userEmail };
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { user: this.user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      // Clear instance variables
      this.token = null;
      this.user = null;
      
      // Remove axios header
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) {
      return this.user;
    }

    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        this.user = JSON.parse(userData);
        return this.user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }

    return null;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Method to refresh user data from server
  async refreshUserData(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile`);
      const userData = response.data;
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      this.user = userData;
      
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
