import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  email: string;
}

// Enkel cache för notifikationer för att minska onödiga databasanrop
const CACHE_TIME = 15 * 1000; // 15 sekunder
const notificationsCache = new Map<string, { data: any; timestamp: number }>();

// GET-endpoint för att hämta notifikationer för inloggad användare
export async function GET(req: NextRequest) {
  try {
    // Kolla om denna request har en no-cache header (för forcerad uppdatering)
    const noCache = req.headers.get('x-no-cache') === 'true';

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
    
    // Kontrollera cache först om vi inte har en no-cache header
    if (!noCache && notificationsCache.has(email)) {
      const cached = notificationsCache.get(email)!;
      const now = Date.now();
      
      // Använd cache om den fortfarande är giltig
      if (now - cached.timestamp < CACHE_TIME) {
        console.log('Returnerar cachade notifikationer för', email);
        return NextResponse.json(cached.data);
      }
    }
    
    // Hämta användardata från databasen
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hämta notifikationer för användaren
    const notifications = await db.collection('notifications')
      .find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();
    
    // Uppdatera cache
    notificationsCache.set(email, {
      data: notifications,
      timestamp: Date.now()
    });
    
    // Returnera notifikationer
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fel vid hämtning av notifikationer:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST-endpoint för att skapa en ny notifikation (används av servern)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, message, postId, relatedUserId } = body;
    
    if (!userId || !type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Skapa ny notifikation
    const newNotification = {
      userId,
      type,
      message,
      postId,
      relatedUserId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('notifications').insertOne(newNotification);
    
    // Ogiltigförklara cache för denna användare vid ny notifikation
    Object.keys(notificationsCache).forEach(key => {
      const user = key.split(':')[0];
      if (user === userId) {
        notificationsCache.delete(key);
      }
    });
    
    return NextResponse.json({
      id: result.insertedId,
      ...newNotification
    });
  } catch (error) {
    console.error('Fel vid skapande av notifikation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 