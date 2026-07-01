import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    
    // Kapikitab Specific Data
    grade: { type: String, default: null },
    subject: { type: [String], default: ['Math'] },
    level: { type: String, default: null },
    reason: { type: String, default: null },
    time: { type: String, default: null },
    source: { type: String, default: null },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model('User', userSchema);
export default User;