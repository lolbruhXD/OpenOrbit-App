import Post from '../models/PostModel.js';

/**
 * @desc    Fetches post recommendations for a user
 * @param   {object} user - The logged-in user object
 * @returns {Promise<Array>} A promise that resolves to an array of post documents
 */
const getPostRecommendations = async (user) => {
  try {
    // Find all posts where the 'user' field is not the current user's ID
    // Sort by the newest posts first and limit to 10 results
    const posts = await Post.find({ user: { $ne: user._id } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name'); // Also fetch the name of the post's author

    return posts;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export { getPostRecommendations };