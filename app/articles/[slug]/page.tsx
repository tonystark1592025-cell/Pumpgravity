import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

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

  // Increment views
  await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/articles">
          <Button variant="ghost" className="mb-8 gap-2 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
            <img
              src={article.image}
              alt={article.title}
              className="h-[400px] w-full object-cover"
            />
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          {article.title}
        </h1>

        {/* Meta Information */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{article.views} views</span>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-8 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-lg italic leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-p:text-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-border
            prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-td:border prose-td:border-border
            prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Articles CTA */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <Link href="/articles">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              View More Articles
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
