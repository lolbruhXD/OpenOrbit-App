import User from '../models/userModel.js';
import Post from '../models/PostModel.js';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const toggleSavePost = async (req, res) => {
  const user = await User.findById(req.user._id);
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const isSaved = user.savedPosts.find((id) => id.toString() === postId.toString());
  if (isSaved) {
    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId.toString());
    res.status(200).json({ message: 'Post unsaved' });
  } else {
    user.savedPosts.push(postId);
    res.status(200).json({ message: 'Post saved' });
  }
  await user.save();
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const allPosts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    const pinnedPosts = await Post.find({ user: user._id, isPinned: true }).sort({ createdAt: -1 });
    res.json({ profile: user, posts: allPosts, pinned: pinnedPosts });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.id === userToFollow.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    if (currentUser.following.includes(userToFollow.id)) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userToFollow.id.toString());
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== currentUser.id.toString());
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'User Unfollowed' });
    } else {
      currentUser.following.push(userToFollow.id);
      userToFollow.followers.push(currentUser.id);
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'User Followed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export { registerUser, loginUser, toggleSavePost, getUserProfile, followUser };