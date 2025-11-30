import Comment from '../models/commentModel.js';
import Post from '../models/PostModel.js';

/**
 * @desc    Create a new comment on a post
 * @route   POST /api/posts/:postId/comments
 * @access  Private
 */
const createComment = async (req, res) => {
  const { text } = req.body;
  const postId = req.params.postId;
  const userId = req.user._id;

  if (!text) {
    return res.status(400).json({ message: 'Comment text cannot be empty' });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comment = await Comment.create({
    text,
    user: userId,
    post: postId,
  });

  res.status(201).json(comment);
};

/**
 * @desc    Get all comments for a post
 * @route   GET /api/posts/:postId/comments
 * @access  Public
 */
const getCommentsForPost = async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId }).populate(
    'user',
    'name'
  ); // .populate() fetches the name of the user who commented

  res.status(200).json(comments);
};

export { createComment, getCommentsForPost };