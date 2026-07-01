import mongoose, { Schema, models } from 'mongoose';

const chatHistorySchema = new Schema(
  {
    userEmail: { type: String, required: true },
    
    // The "Room" this chat belongs to (e.g., 'global', 'chapter_geometry', 'chapter_polynomials')
    threadId: { type: String, required: true }, 
    
    // The rolling summary you suggested!
    summary: { type: String, default: "No previous context." },
    
    // We will only ever store a maximum of ~10 recent messages here before summarizing
    messages: [
      {
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Compound index to quickly find the exact chat for a specific user in a specific room
chatHistorySchema.index({ userEmail: 1, threadId: 1 }, { unique: true });

const ChatHistory = models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;