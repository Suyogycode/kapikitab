// lib/models/Chapter.ts
import mongoose, { Schema, models } from 'mongoose';

const unitSchema = new Schema({
  unitId: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true }
}, { _id: false });

const chapterSchema = new Schema({
  chapterId: { type: String, required: true, unique: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' }, // <-- CANONICAL CONTEXT FOR GROQ RAG-LITE
  units: [unitSchema]
}, { timestamps: true });

const Chapter = models.Chapter || mongoose.model('Chapter', chapterSchema);
export default Chapter;