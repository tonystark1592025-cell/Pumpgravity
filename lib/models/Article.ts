import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: { type: String, default: 'Uncategorized' },
  tags: [String],
  image: { type: String },
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Delete the model if it exists to force reload
if (mongoose.models.Article) {
  delete mongoose.models.Article;
}

export default mongoose.model('Article', ArticleSchema);
