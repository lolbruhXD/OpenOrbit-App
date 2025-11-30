import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    text: { 
        type: String, 
        required: true 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Link to the User who made the comment
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Post', // Link to the Post the comment is on
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;