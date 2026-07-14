import mongoose, { Schema, models } from 'mongoose';

const subSubjectSchema = new Schema({
  subjectId: { type: String, required: true },
  title: { type: String, required: true }
}, { _id: false });

const subjectSchema = new Schema({
  subjectId: { type: String, required: true },
  title: { type: String, required: true },
  isGroup: { type: Boolean, default: false },
  subSubjects: [subSubjectSchema]
}, { _id: false });

const curriculumSchema = new Schema({
  classId: { type: String, required: true, unique: true }, // e.g., 'c11'
  className: { type: String, required: true }, // e.g., 'Class 11'
  subjects: [subjectSchema]
}, { timestamps: true });

const Curriculum = models.Curriculum || mongoose.model('Curriculum', curriculumSchema);
export default Curriculum;