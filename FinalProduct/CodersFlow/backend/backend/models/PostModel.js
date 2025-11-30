import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Project',
    },
    language: {
      type: String,
      required: false,
      default: 'javascript',
    },
    code: {
      type: String,
      required: false,
    },
    summary: {
      type: String,
      required: false,
    },
    tags: [{
      type: String,
    }],
    media_url: {
      type: String,
      required: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPinned: { // Field for pinned projects
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;