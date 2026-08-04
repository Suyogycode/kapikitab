import mongoose, { Schema, Document, models } from 'mongoose';

export interface IGraphic extends Document {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  modelUrl?: string;     // THE FIX: Made optional for code-only labs
  r2Key?: string;        // THE FIX: Made optional for code-only labs
  themeColor: string; 
  accentColor: string; 
  glowColor: string; 
  componentRef?: string; 
  createdAt: Date;
}

const graphicSchema = new Schema<IGraphic>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  
  // THE FIX: Removed required: true, added a default empty string
  modelUrl: { type: String, required: false, default: "" }, 
  r2Key: { type: String, required: false, default: "" },    
  
  themeColor: { type: String, default: 'from-stone-800 to-stone-950' },
  accentColor: { type: String, default: 'text-stone-300' },
  glowColor: { type: String, default: 'shadow-stone-500/20' },
  componentRef: { type: String, required: false }, 
  createdAt: { type: Date, default: Date.now },
});

export default models.Graphic || mongoose.model<IGraphic>('Graphic', graphicSchema);