import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  email: string;
}

// PATCH-endpoint för att markera alla notifikationer som lästa
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
    
    // Hämta användardata från databasen
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Uppdatera alla olästa notifikationer för användaren
    const result = await db.collection('notifications').updateMany(
      { userId: user._id.toString(), isRead: false },
      { $set: { isRead: true } }
    );
    
    return NextResponse.json({ 
      success: true, 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Fel vid markering av notifikationer som lästa:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 