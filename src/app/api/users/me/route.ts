import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  email: string;
}

export async function GET(req: NextRequest) {
  try {
    // Hämta token från cookies
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verifiera token och hämta användarens e-post
    const payload = verifyToken(token) as UserPayload;
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const email = payload.email;
    
    // Hämta användaren från databasen
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      name: user.name || '', 
      email: user.email,
      profileImage: user.profileImage || '' 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Hämta token från cookies
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verifiera token och hämta användarens e-post
    const payload = verifyToken(token) as UserPayload;
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const email = payload.email;
    
    // Uppdatera användaren i databasen
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { name, profileImage } = body;
    
    const result = await db.collection('users').findOneAndUpdate(
      { email },
      { $set: { name, profileImage } },
      { returnDocument: 'after', upsert: true }
    );
    
    return NextResponse.json({ 
      name: result.value?.name || '', 
      email: result.value?.email,
      profileImage: result.value?.profileImage || '' 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 