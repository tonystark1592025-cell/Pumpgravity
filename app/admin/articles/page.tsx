import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export default async function ArticlesPage() {
  const user = await verifyAuth();
  if (!user) redirect('/admin/login');
  
  await dbConnect();
  const articlesData = await Article.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize MongoDB data for client
  const articles = articlesData.map((article: any) => ({
    ...article,
    _id: article._id.toString(),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Articles Management</h1>
        <Link href="/admin/articles/new">
          <Button>Create New Article</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No articles yet. Create your first article!
            </CardContent>
          </Card>
        ) : (
          articles.map((article: any) => (
            <Card key={article._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{article.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {article.category} • {article.views} views • 
                      {article.published ? ' Published' : ' Draft'}
                    </p>
                  </div>
                  <Link href={`/admin/articles/edit/${article._id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </CardHeader>
              {article.excerpt && (
                <CardContent>
                  <p className="text-sm text-gray-600">{article.excerpt}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
