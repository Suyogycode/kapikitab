import mongoose, { Schema, Document, models } from 'mongoose';

export interface IGraphic extends Document {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  modelUrl: string; 
  r2Key: string;
  themeColor: string; 
  accentColor: string; 
  glowColor: string; 
  componentRef?: string; // ADDED: TypeScript now knows this exists
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
  componentRef: { type: String, required: false }, // Must match the interface exactly
  createdAt: { type: Date, default: Date.now },
});

export default models.Graphic || mongoose.model<IGraphic>('Graphic', graphicSchema);