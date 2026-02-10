'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    image: '',
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slugError) {
      alert('Please fix the slug error before submitting.');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        slug: generateSlug(formData.slug), // Ensure slug is clean
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      
      console.log('Submitting article:', payload);
      
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Response:', data);

      if (res.ok) {
        router.push('/admin/articles');
      } else {
        alert(`Failed to create article: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error creating article: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const checkSlugExists = async (slug: string) => {
    if (!slug) return false;
    
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/admin/articles/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      return data.exists;
    } catch (err) {
      return false;
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = async (newSlug: string) => {
    const cleanSlug = generateSlug(newSlug);
    setFormData({ ...formData, slug: cleanSlug });
    
    if (cleanSlug) {
      const exists = await checkSlugExists(cleanSlug);
      if (exists) {
        setSlugError('This slug already exists. Please use a different one.');
      } else {
        setSlugError('');
      }
    } else {
      setSlugError('');
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData({ ...formData, title: newTitle });
    // Auto-generate slug from title if slug is empty
    if (!formData.slug) {
      const autoSlug = generateSlug(newTitle);
      setFormData({ ...formData, title: newTitle, slug: autoSlug });
    }
  };

  const handleGenerateSlug = async () => {
    let baseSlug = generateSlug(formData.title);
    if (!baseSlug) return;

    // Check if slug exists
    const exists = await checkSlugExists(baseSlug);
    if (exists) {
      // Add year to make it unique
      const year = new Date().getFullYear();
      baseSlug = `${baseSlug}-${year}`;
      
      // Check again
      const stillExists = await checkSlugExists(baseSlug);
      if (stillExists) {
        // Add timestamp
        baseSlug = `${baseSlug}-${Date.now()}`;
      }
      setSlugError('Original slug existed, modified to make it unique.');
    } else {
      setSlugError('');
    }
    
    setFormData({ ...formData, slug: baseSlug });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Article</h1>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        required
                        className={slugError ? 'border-red-500' : ''}
                      />
                      {checkingSlug && (
                        <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
                      )}
                      {slugError && (
                        <p className="text-xs text-red-500 mt-1">{slugError}</p>
                      )}
                      {formData.slug && !slugError && !checkingSlug && (
                        <p className="text-xs text-green-600 mt-1">✓ Slug is available</p>
                      )}
                    </div>
                    <Button type="button" onClick={handleGenerateSlug} variant="outline">
                      Generate
                    </Button>
                  </div>
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

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Pumps, Engineering, Tutorial"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="pump, hydraulics, tutorial"
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
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Article'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
