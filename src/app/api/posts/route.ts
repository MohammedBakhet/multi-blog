import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const posts = await db.collection('posts')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, imageUrl, userId } = body;
  if (!text && !imageUrl) {
    return NextResponse.json({ error: 'Text eller bild krävs' }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db();
  const newPost = {
    text: text || '',
    imageUrl: imageUrl || '',
    userId: userId || null,
    likes: [], // array av userId
    comments: [], // array av { userId, text, createdAt }
    createdAt: new Date(),
  };
  const result = await db.collection('posts').insertOne(newPost);
  return NextResponse.json({ ...newPost, _id: result.insertedId });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { oldUserId, newUserId, profileImage } = body;
  if (!oldUserId || !newUserId) {
    return NextResponse.json({ error: 'oldUserId och newUserId krävs' }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('posts').updateMany(
    { userId: oldUserId },
    { $set: { userId: newUserId, profileImage: profileImage || '' } }
  );
  return NextResponse.json({ updatedCount: result.modifiedCount });
} 