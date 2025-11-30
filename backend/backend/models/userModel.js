import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- NEW PROFILE FIELDS ---
    avatarUrl: { type: String, default: 'default_avatar_url_here' }, // <-- ADD THIS
    bio: { type: String, default: '' }, // <-- ADD THIS
    skills: [{ type: String }], // <-- ADD THIS
    leecodeProfile: { // <-- ADD THIS
        username: String,
        problemsSolved: Number,
        rating: Number,
    },
    githubProfile: { // <-- ADD THIS
        username: String,
        contributions: String, // Using String for "1.2k"
    },
    // --- END NEW FIELDS ---
    
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// ... (rest of the file with password methods remains the same) ...

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;