// lib/models/StagingAsset.ts
import mongoose from 'mongoose';

const StagingAssetSchema = new mongoose.Schema({
  r2Url: { type: String, required: true },
  origin: { type: String, enum: ['manual', 'auto_scraper'], required: true },
  status: { type: String, enum: ['unprocessed', 'processing', 'parsed', 'failed'], default: 'unprocessed' },
  metadata: {
    targetClassId: String,
    targetSubjectId: String,
    sourceWebsite: String
  },
  logs: [String]
}, { timestamps: true });

export default mongoose.models.StagingAsset || mongoose.model('StagingAsset', StagingAssetSchema);