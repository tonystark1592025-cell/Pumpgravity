import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import News from '@/lib/models/News';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const news = await News.findById(id);
    
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
    
    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();
    const data = await req.json();
    
    console.log('Updating news ID:', id);
    console.log('Update data:', data);
    
    const news = await News.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
    
    console.log('News updated successfully');
    return NextResponse.json(news);
  } catch (error: any) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();
    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
