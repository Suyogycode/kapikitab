import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    
    // Kapikitab Specific Data (India Focused)
    state: { type: String, default: null },
    class: { type: String, default: null },
    board: { type: String, default: null },
    
    // Arrays for multi-select options
    exams: { type: [String], default: [] },
    entranceExams: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model('User', userSchema);
export default User;