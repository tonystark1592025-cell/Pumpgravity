import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    await dbConnect();

    let admin = await Admin.findOne({ username });

    // Create default admin if none exists (temporary password: admin123)
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await Admin.create({
        username: 'admin',
        password: hashedPassword,
      });
      console.log('Created default admin user: admin / admin123');
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(username);
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
