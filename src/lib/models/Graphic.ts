// src/lib/models/Graphic.ts
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IGraphic extends Document {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  modelUrl: string; // The Cloudflare R2 Public URL (e.g., for Brain.glb)
  r2Key: string;
  themeColor: string; // Tailwind gradient classes (e.g., 'from-stone-800 to-stone-900')
  accentColor: string; // Tailwind text class
  glowColor: string; // Tailwind shadow class
  createdAt: Date;
}

const graphicSchema = new Schema<IGraphic>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  modelUrl: { type: String, required: true },
  r2Key: { type: String, required: true },
  themeColor: { type: String, default: 'from-stone-800 to-stone-950' },
  accentColor: { type: String, default: 'text-stone-300' },
  glowColor: { type: String, default: 'shadow-stone-500/20' },
  createdAt: { type: Date, default: Date.now },
});

export default models.Graphic || mongoose.model<IGraphic>('Graphic', graphicSchema);