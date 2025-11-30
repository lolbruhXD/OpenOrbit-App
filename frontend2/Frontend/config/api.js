import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// --- Get the base configuration ---
const getApiConfig = () => {
    const isProduction = !__DEV__;
    let HOST_IP = process.env.EXPO_PUBLIC_DEV_HOST_IP;
    // Fallback: if EXPO_PUBLIC_DEV_HOST_IP isn't set, try to infer from the Expo debuggerHost
    // This helps when running on a physical device using Expo Go.
    try {
        const dbg = Constants.manifest?.debuggerHost || Constants.manifest2?.debuggerHost;
        if (!HOST_IP && dbg && typeof dbg === 'string') {
            HOST_IP = dbg.split(':')[0];
        }
    } catch (e) {
        // ignore
    }

    if (isProduction) {
        return {
            BASE_URL: 'https://your-production-url.com/api',
            WEBSOCKET_URL: 'https://your-production-url.com',
        };
    }

    if (Device.isDevice) {
        // For physical device testing
        const resolvedHost = HOST_IP || '127.0.0.1';
        return {
            BASE_URL: `http://${resolvedHost}:5000/api`,
            WEBSOCKET_URL: `http://${resolvedHost}:5000`,
            METRO_URL: `http://${resolvedHost}:8082`,  // Updated Metro port
        };
    }
    
    if (Platform.OS === 'android') {
        return {
            BASE_URL: 'http://10.0.2.2:5000/api',
            WEBSOCKET_URL: 'http://10.0.2.2:5000',
        };
    }
    
    return {
        BASE_URL: 'http://127.0.0.1:5000/api',
        WEBSOCKET_URL: 'http://127.0.0.1:5000',
    };
};

// --- Build and Export the Final Config Object ---
// 1. Get the base config (BASE_URL, etc.)
const config = getApiConfig();

// 2. Define and attach the endpoints
config.ENDPOINTS = {
    AUTH: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',
        PROFILE: '/users/profile'
    },
    POSTS: {
        ALL: '/posts/feed',
        MY_POSTS: '/posts',
        CREATE: '/posts',
        // Note: Update, Delete, and Like usually include an ID
        // e.g., LIKE: (postId) => `/posts/${postId}/like`
    },
    UPLOAD: {
        SINGLE: '/upload/single',
    }
};

// 3. Export the single, fully constructed object
export const API_CONFIG = config;

export default API_CONFIG;