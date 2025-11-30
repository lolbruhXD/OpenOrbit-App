import Constants from 'expo-constants';

const DEFAULT_API_BASE = 'http://127.0.0.1:5000/api';
const API_BASE_URL: string =
  ((Constants as any)?.expoConfig?.extra?.apiBaseUrl as string) ||
  DEFAULT_API_BASE;

// Define a type for the post details for consistency across the app
export interface LoggablePost {
    id: string;
    username: string;
}

// Define the type for additional details you might want to log
export interface LogDetails {
    [key: string]: any;
}

/**
 * A centralized function to log various user events.
 * @param action - A string describing the user's action (e.g., 'upvote_post').
 * @param post - The post object related to the event.
 * @param details - An optional object for any other relevant data.
 */
const logEvent = (action: string, post: LoggablePost, details?: LogDetails): void => {
    const eventData = {
        event: 'button_press',
        action: action,
        postId: post.id,
        postAuthor: post.username,
        timestamp: new Date().toISOString(),
        ...details,
    };

    // The fetch call should be inside the main function
    fetch(`${API_BASE_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
    })
    .then(response => {
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => console.log('Server response:', data.message))
    .catch(error => console.error('Error logging to server:', error));
};

// Export the function so it can be used anywhere in the app
export const LoggingService = {
    logEvent,
};