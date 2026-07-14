import mongoose, { Schema, models } from 'mongoose';

const assetSchema = new Schema({
  assetId: { type: String, required: true, unique: true }, // e.g., 'ast-001'
  chapterId: { type: String, required: true, index: true },
  unitId: { type: String, required: true },
  order: { type: Number, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['video_lecture', 'diagram', 'react_simulation', 'note', 'pdf_document'] 
  },
  title: { type: String, required: true },
  // Schema.Types.Mixed allows us to store flexible data (URLs for videos, markdown for notes)
  content: { type: Schema.Types.Mixed, required: true } 
}, { timestamps: true });

const Asset = models.Asset || mongoose.model('Asset', assetSchema);
export default Asset;