import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

    await dbConnect();

    if (!query.trim()) {
      return NextResponse.json({ articles: [], total: 0, totalPages: 0 });
    }

    // Create search query using MongoDB text search or regex
    const searchQuery = {
      published: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    const total = await Article.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    const articlesData = await Article.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const articles = articlesData.map((article: any) => ({
      ...article,
      _id: article._id.toString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }));

    return NextResponse.json({ articles, total, totalPages, currentPage: page });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}
