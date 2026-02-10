'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    published: false,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`/api/admin/news/${params.id}`);
      if (res.ok) {
        const news = await res.json();
        setFormData({
          title: news.title,
          slug: news.slug,
          content: news.content,
          excerpt: news.excerpt || '',
          image: news.image || '',
          published: news.published,
        });
      }
    } catch (err) {
      alert('Error loading news');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Updating news:', formData);
      
      const res = await fetch(`/api/admin/news/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Response:', data);

      if (res.ok) {
        router.push('/admin/news');
      } else {
        alert(`Failed to update news: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error updating news: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      const res = await fetch(`/api/admin/news/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin/news');
      } else {
        alert('Failed to delete news');
      }
    } catch (err) {
      alert('Error deleting news');
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-8">Loading...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit News</h1>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Cover Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.image}
                        alt="Cover preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Input
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Short description..."
                  />
                </div>

                <div>
                  <Label>Content *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h1 className="text-4xl font-bold mb-2">{formData.title || 'Untitled'}</h1>
                {formData.excerpt && (
                  <p className="text-gray-600 mb-4 italic">{formData.excerpt}</p>
                )}
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content yet...</p>' }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete News
          </Button>
        </div>
      </form>
    </div>
  );
}
