import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId'); // For edit mode

    if (!slug) {
      return NextResponse.json({ exists: false });
    }

    await dbConnect();
    
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const article = await Article.findOne(query);
    
    return NextResponse.json({ exists: !!article });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
