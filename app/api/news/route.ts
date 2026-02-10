import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import News from '@/lib/models/News';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const news = await News.find({ published: true }).sort({ createdAt: -1 });
    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const newsItem = await News.create(data);
    return NextResponse.json(newsItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
