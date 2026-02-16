import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

// Clean date formatter
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await dbConnect();
  const article = await Article.findOne({ slug, published: true }).lean();

  if (!article) {
    notFound();
  }

  // Increment views silently
  Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

  const readingTime = Math.ceil(article.content.length / 1000);

  // Get recommended articles
  const recommendedArticles = await Article.find({
    published: true,
    _id: { $ne: article._id },
    $or: [
      { category: article.category },
      { tags: { $in: article.tags || [] } }
    ]
  })
  .sort({ views: -1, createdAt: -1 })
  .limit(3)
  .lean();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <article className="mx-auto max-w-[680px] px-6">
          {/* 1. Minimal Navigation */}
          <Link 
            href="/articles" 
            className="group mb-8 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* 2. Left-Aligned Header */}
          <header className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {article.category}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(article.createdAt)}
              </span>
            </div>

            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
               <span>{readingTime} min read</span>
               {/* Optional: Add Author Name here if available */}
            </div>
          </header>

          {/* 3. Image matched EXACTLY to text width */}
          {article.image && (
            <div className="mb-10 w-full overflow-hidden rounded-md border border-border/40 bg-muted/30">
              <img
                src={article.image}
                alt={article.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* 4. Content Area - Strictly Prosed */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:text-[17px] prose-p:leading-8 prose-p:text-foreground/90 prose-p:font-normal
              prose-a:text-primary prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/30 hover:prose-a:decoration-primary
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:text-muted-foreground
              prose-img:rounded-md prose-img:border prose-img:border-border/50
              prose-code:rounded prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-foreground
              prose-hr:border-border/60 prose-hr:my-10"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* 5. Minimal Tags (Text based) */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-14 flex flex-wrap gap-x-4 gap-y-2 pt-6 border-t border-border/40">
              {article.tags.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/tags/${tag}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* 6. "Read Next" - Clean List Layout (No Cards) */}
        {recommendedArticles.length > 0 && (
          <div className="mx-auto mt-24 max-w-[680px] border-t border-border/40 px-6 pt-16">
            <h3 className="mb-8 text-lg font-semibold tracking-tight">Read Next</h3>
            <div className="grid gap-10">
              {recommendedArticles.map((rec: any) => (
                <Link key={rec._id.toString()} href={`/articles/${rec.slug}`} className="group block">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Thumbnail (Small & Discrete) */}
                    {rec.image && (
                      <div className="w-full sm:w-40 shrink-0 aspect-[3/2] overflow-hidden rounded-md bg-muted">
                        <img 
                          src={rec.image} 
                          alt={rec.title}
                          className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                        />
                      </div>
                    )}
                    
                    {/* Text Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                          {rec.category}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold leading-snug group-hover:text-muted-foreground transition-colors mb-2">
                        {rec.title}
                      </h4>
                      {rec.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {rec.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}