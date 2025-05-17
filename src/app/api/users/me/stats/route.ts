import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';
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
    const userName = user.name;
    // Hämta alla inlägg av användaren
    const posts = await db.collection('posts').find({ userId: userName }).toArray();
    const postCount = posts.length;
    const likeCount = posts.reduce((acc, post) => acc + (post.likes ? post.likes.length : 0), 0);
    const commentCount = posts.reduce((acc, post) => acc + (post.comments ? post.comments.length : 0), 0);
    // Hämta de tre senaste inläggen
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(post => ({
        _id: post._id,
        text: post.text,
        createdAt: post.createdAt
      }));
    // Returnera statistik och senaste inlägg
    return NextResponse.json({
      stats: {
        posts: postCount,
        likes: likeCount,
        comments: commentCount
      },
      recentPosts,
      favoriteCrypto: user.favoriteCrypto || '',
      bio: user.bio || ''
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 