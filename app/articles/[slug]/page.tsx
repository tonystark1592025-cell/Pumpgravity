import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Eye, Tag, Clock, ArrowRight } from 'lucide-react';
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

  const readingTime = Math.ceil(article.content.length / 1000);

  // Get recommended articles (same category or similar tags, excluding current article)
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Minimal Hero Section */}
      <div className="border-b border-border/40">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/articles">
            <Button variant="ghost" size="sm" className="mb-8 -ml-3 gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {/* Category Badge */}
          <Badge variant="secondary" className="mb-4 text-xs font-medium uppercase tracking-wide">
            {article.category}
          </Badge>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{article.views} views</span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Image */}
        {article.image && (
          <div className="mb-12 overflow-hidden rounded-lg">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-10 border-l-2 border-primary pl-6">
            <p className="text-lg leading-relaxed text-muted-foreground italic">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none dark:prose-invert
            prose-headings:font-semibold prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
            prose-strong:text-foreground prose-strong:font-semibold
            prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:my-6
            prose-blockquote:border-l-2 prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:my-8
            prose-hr:border-border/50 prose-hr:my-10
            prose-ul:my-5 prose-li:my-1
            prose-ol:my-5
            prose-table:my-6
            prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2
            prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Recommended Articles Section */}
      {recommendedArticles.length > 0 && (
        <section className="border-t border-border/50 bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Continue Reading</h2>
              <p className="text-muted-foreground">More articles you might enjoy</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedArticles.map((rec: any) => (
                <Link key={rec._id.toString()} href={`/articles/${rec.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 group">
                    {rec.image && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted">
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit text-xs mb-2">
                        {rec.category}
                      </Badge>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {rec.title}
                      </CardTitle>
                      {rec.excerpt && (
                        <CardDescription className="line-clamp-2">
                          {rec.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.ceil(rec.content.length / 1000)} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {rec.views}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/articles">
                <Button variant="outline" className="gap-2 group">
                  View All Articles
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
