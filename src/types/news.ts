export interface ISource {
  name: string;        // e.g., "Nature", "Phys.org", "NASA"
  url: string;         // Original article link
}

export interface INewsArticle {
  _id?: string;
  title: string;              // AI-curated catchy headline
  slug: string;               // URL-friendly identifier
  tldr: string;               // 2-sentence high-level summary
  keyTakeaways: string[];     // Bullet points highlighting core facts
  deepDive: string;           // Detailed educational explanation (Markdown supported)
  category: string;           // Primary topic: "Space", "AI", "Physics", "Biology", "General Knowledge"
  tags: string[];             // Granular tags: ["Exoplanet", "Webb Telescope", "Astrophysics"]
  imageUrl?: string;          // Main image URL
  sources: ISource[];         // Multi-source aggregation array
  contentHash: string;        // Hash/key used to prevent duplicate coverage of the same event
  publishedAt: Date;          // Date the news event occurred / was fetched
  createdAt: Date;
  updatedAt: Date;
}