// Production API Configuration
// Update these URLs to your deployed backend

export const API_CONFIG = {
  BASE_URL: 'https://your-backend-url.herokuapp.com/api',
  WEBSOCKET_URL: 'https://your-backend-url.herokuapp.com',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      PROFILE: '/users/profile'
    },
    POSTS: {
      ALL: '/posts/feed',
      MY_POSTS: '/posts',
      CREATE: '/posts',
      UPDATE: '/posts',
      DELETE: '/posts',
      LIKE: '/posts'
    },
    UPLOAD: {
      SINGLE: '/upload/single',
      MULTIPLE: '/upload/multiple'
    }
  }
};

export default API_CONFIG;
