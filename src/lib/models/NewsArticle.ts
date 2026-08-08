import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsArticleDocument extends Document {
  title: string;
  slug: string;
  tldr: string;
  keyTakeaways: string[];
  deepDive: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  sources: { name: string; url: string }[];
  contentHash: string;
  publishedAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const NewsArticleSchema = new Schema<INewsArticleDocument>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    tldr: { 
      type: String, 
      required: true 
    },
    keyTakeaways: { 
      type: [String], 
      required: true, 
      default: [] 
    },
    deepDive: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true, 
      index: true 
    },
    tags: { 
      type: [String], 
      index: true, 
      default: [] 
    },
    imageUrl: { 
      type: String, 
      default: '' 
    },
    sources: { 
      type: [SourceSchema], 
      required: true 
    },
    contentHash: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    publishedAt: { 
      type: Date, 
      required: true, 
      default: Date.now, 
      index: true 
    },  
  },
  { 
    timestamps: true 
  }
);

// Your existing compound index for fast UI sorting
NewsArticleSchema.index({ category: 1, publishedAt: -1 });

// NEW: The MongoDB TTL Index. Automatically deletes documents 30 days after creation.
NewsArticleSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const NewsArticle: Model<INewsArticleDocument> =
  mongoose.models.NewsArticle || mongoose.model<INewsArticleDocument>('NewsArticle', NewsArticleSchema);

export default NewsArticle;