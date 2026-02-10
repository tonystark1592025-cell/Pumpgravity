import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import News from '@/lib/models/News';

export default async function StatsPage() {
  const user = await verifyAuth();
  if (!user) redirect('/admin/login');
  await dbConnect();

  const [articles, news] = await Promise.all([
    Article.find({}),
    News.find({}),
  ]);

  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a: any) => a.published).length,
    totalArticleViews: articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0),
    totalNews: news.length,
    publishedNews: news.filter((n: any) => n.published).length,
    totalNewsViews: news.reduce((sum: number, n: any) => sum + (n.views || 0), 0),
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Stats</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalArticles}</p>
            <p className="text-sm text-gray-500">{stats.publishedArticles} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalArticleViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total News</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalNews}</p>
            <p className="text-sm text-gray-500">{stats.publishedNews} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>News Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalNewsViews}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
