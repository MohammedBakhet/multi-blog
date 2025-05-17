import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../../../../lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NotificationType, createNotification } from '../../../../../lib/notifications';

interface UserPayload extends JwtPayload {
  email: string;
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Vänta på params-objektet enligt Next.js rekommendation
    const params = await context.params;
    const postId = params.id;
    
    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
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
    
    // Hämta inloggad användare
    const client = await clientPromise;
    const db = client.db();
    const currentUser = await db.collection('users').findOne({ email });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Hämta inlägget för att se om användaren redan har gillat det
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Kontrollera om användaren redan har gillat inlägget
    const userLiked = post.likes && post.likes.includes(userId);
    
    // Uppdatera likes-arrayen - använd typade operationer för MongoDB
    let result;
    if (userLiked) {
      // Ta bort like om användaren redan gillat
      result = await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { likes: userId } as any }
      );
    } else {
      // Lägg till like om användaren inte redan gillat
      result = await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { likes: userId } as any }
      );
    }
    
    // Om en like lades till och posten tillhör någon annan än den inloggade användaren
    // skapa en notifikation
    if (!userLiked && post.userId && post.userId !== userId) {
      // Hämta inläggsägaren
      const postOwner = await db.collection('users').findOne(
        { name: post.userId }
      );
      
      if (postOwner) {
        // Använd den nya createNotification-funktionen
        await createNotification({
          db,
          userId: postOwner._id.toString(),
          type: NotificationType.LIKE,
          message: `${userId} gillade ditt inlägg`,
          postId,
          postTitle: post.text ? post.text.substring(0, 30) + (post.text.length > 30 ? '...' : '') : 'Inlägg',
          relatedUserId: currentUser._id.toString(),
          relatedUsername: userId,
          relatedUserImage: currentUser.profileImage || null
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      liked: !userLiked 
    });
  } catch (error) {
    console.error('Fel vid hantering av like:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 