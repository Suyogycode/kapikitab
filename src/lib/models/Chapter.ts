import mongoose, { Schema, models } from 'mongoose';

const unitSchema = new Schema({
  unitId: { type: String, required: true }, // e.g., 'u1'
  title: { type: String, required: true },
  order: { type: Number, required: true }
}, { _id: false });

const chapterSchema = new Schema({
  chapterId: { type: String, required: true, unique: true }, // e.g., 'ch-c11-phy-03'
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  units: [unitSchema]
}, { timestamps: true });

const Chapter = models.Chapter || mongoose.model('Chapter', chapterSchema);
export default Chapter;