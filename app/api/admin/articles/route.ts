import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find({}).sort({ createdAt: -1 });
    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    console.log('Creating article with data:', data);
    
    const article = await Article.create(data);
    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
