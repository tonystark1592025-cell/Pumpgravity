import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { verifyAuth } from '@/lib/auth';

export async function POST() {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    let dropped = [];
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      dropped.push(collection.name);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database cleared',
      dropped 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
