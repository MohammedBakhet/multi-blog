import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';
import { ObjectId } from 'mongodb';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  email: string;
}

// PATCH-endpoint för att markera en specifik notifikation som läst
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    
    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }
    
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

    // Hitta notifikationen först för att kontrollera ägandeskapet
    const notification = await db.collection('notifications').findOne({
      _id: new ObjectId(notificationId)
    });
    
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    // Kontrollera att notifikationen tillhör den inloggade användaren
    if (notification.userId !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorized to update this notification' }, { status: 403 });
    }
    
    // Uppdatera notifikationen
    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fel vid markering av notifikation som läst:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 