import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dbConnect from '@/lib/mongodb';
import News from '@/lib/models/News';

export default async function NewsPage() {
  const user = await verifyAuth();
  if (!user) redirect('/admin/login');
  
  await dbConnect();
  const newsData = await News.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize MongoDB data for client
  const news = newsData.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Management</h1>
        <Link href="/admin/news/new">
          <Button>Create New News</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No news yet. Create your first news item!
            </CardContent>
          </Card>
        ) : (
          news.map((item: any) => (
            <Card key={item._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.views} views • 
                      {item.published ? ' Published' : ' Draft'}
                    </p>
                  </div>
                  <Link href={`/admin/news/edit/${item._id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </CardHeader>
              {item.excerpt && (
                <CardContent>
                  <p className="text-sm text-gray-600">{item.excerpt}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
