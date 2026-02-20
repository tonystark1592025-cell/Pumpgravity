import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { ArticleSearch } from '@/components/article-search';

const ARTICLES_PER_PAGE = 9;

const categoryColors: Record<string, string> = {
  Pumps: 'from-blue-500 to-cyan-500',
  Engineering: 'from-purple-500 to-pink-500',
  Tutorial: 'from-green-500 to-emerald-500',
  Technology: 'from-orange-500 to-red-500',
  Science: 'from-indigo-500 to-blue-500',
  default: 'from-gray-500 to-slate-500',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.q || '';

  await dbConnect();

  // Build search query
  let query: any = { published: true };
  if (searchQuery) {
    query = {
      published: true,
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { excerpt: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } },
      ],
    };
  }

  const totalArticles = await Article.countDocuments(query);
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  const articlesData = await Article.find(query)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ARTICLES_PER_PAGE)
    .limit(ARTICLES_PER_PAGE)
    .lean();

  const articles = articlesData.map((article: any) => ({
    ...article,
    _id: article._id.toString(),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our collection of technical articles, guides, and insights
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <ArticleSearch />
        </div>

        {articles.length === 0 ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : 'Check back soon for new content!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: any) => {
                const gradientClass =
                  categoryColors[article.category] || categoryColors.default;

                return (
                  <Link key={article._id} href={`/articles/${article.slug}`}>
                    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                      {/* Image or Gradient Fallback */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div
                            className={`h-full w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
                          >
                            <svg
                              className="h-16 w-16 text-white/80"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <CardHeader className="space-y-3">
                        <CardTitle className="line-clamp-2 text-xl leading-tight text-foreground transition-colors group-hover:text-primary">
                          {article.title}
                        </CardTitle>
                        
                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(article.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{article.views || 0}</span>
                          </div>
                        </div>
                      </CardHeader>

                      {article.excerpt && (
                        <CardContent>
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {article.excerpt}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <Link
                  href={`/articles?${searchQuery ? `q=${searchQuery}&` : ''}page=${Math.max(1, currentPage - 1)}`}
                  className={currentPage === 1 ? 'pointer-events-none' : ''}
                >
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous
                  </Button>
                </Link>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <Link key={pageNum} href={`/articles?${searchQuery ? `q=${searchQuery}&` : ''}page=${pageNum}`}>
                        <Button
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href={`/articles?${searchQuery ? `q=${searchQuery}&` : ''}page=${Math.min(totalPages, currentPage + 1)}`}
                  className={currentPage === totalPages ? 'pointer-events-none' : ''}
                >
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Next
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
