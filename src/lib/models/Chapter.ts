import mongoose, { Schema, models } from 'mongoose';

const chapterSchema = new Schema(
  {
    chapterId: { type: String, required: true, unique: true }, // e.g., 'coordinate-geometry'
    subject: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    zones: {
      overview: {
        content: { type: String },
        keyTerms: [{ type: String }]
      },
      cinema: {
        videoUrl: { type: String }, // This will hold your Bunny Stream URL
        transcript: { type: String }
      },
      lab: {
        simulationId: { type: String }
      },
      practice: {
        questions: [{
          questionText: { type: String },
          options: [{ type: String }],
          correctAnswer: { type: String }
        }]
      },
      reference: {
        nextChapterId: { type: String },
        resources: [{
          title: { type: String },
          url: { type: String } // This will hold your Cloudflare R2 PDF links
        }]
      }
    }
  },
  { timestamps: true }
);

const Chapter = models.Chapter || mongoose.model('Chapter', chapterSchema);
export default Chapter;