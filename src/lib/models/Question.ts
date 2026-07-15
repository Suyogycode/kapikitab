import mongoose, { Schema, models } from 'mongoose';

const optionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const questionSchema = new Schema({
  questionId: { type: String, required: true, unique: true },
  chapterId: { type: String, required: true, index: true },
  unitId: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    // FIXED: Changed 'numerical_input' to 'numeric' to match frontend state
    enum: ['mcq_single', 'mcq_multiple', 'numeric'] 
  },
  text: { type: String, required: true },
  options: [optionSchema],
  correctAnswers: [{ type: String, required: true }],
  explanation: { type: String },
  tolerance: { type: Number, default: 0 } 
}, { timestamps: true });

const Question = models.Question || mongoose.model('Question', questionSchema);
export default Question;