import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../../../../lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NotificationType, createNotification } from '../../../../../lib/notifications';

interface UserPayload extends JwtPayload {
  email: string;
}

// Definiera en Comment-typ för att lösa TypeScript-fel
interface Comment {
  userId: string;
  text: string;
  createdAt: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const body = await req.json();
    const { userId, text } = body;
    
    if (!userId || !text) {
      return NextResponse.json({ error: 'userId and text are required' }, { status: 400 });
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
    
    // Hämta inlägget
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Skapa den nya kommentaren
    const comment: Comment = {
      userId,
      text,
      createdAt: new Date().toISOString()
    };
    
    // Lägg till kommentaren i inlägget
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } as any }
    );
    
    // Om inlägget tillhör någon annan än den inloggade användaren, skapa en notifikation
    if (post.userId && post.userId !== userId) {
      // Hämta inläggsägaren
      const postOwner = await db.collection('users').findOne({ name: post.userId });
      
      if (postOwner) {
        // Använd den nya createNotification-funktionen
        await createNotification({
          db,
          userId: postOwner._id.toString(),
          type: NotificationType.COMMENT,
          message: `${userId} kommenterade på ditt inlägg`,
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
      comment 
    });
  } catch (error) {
    console.error('Fel vid hantering av kommentar:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 