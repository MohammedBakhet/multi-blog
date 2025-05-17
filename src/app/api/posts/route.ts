import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { extractCryptoTags } from '../../../lib/cryptoService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const cryptoTag = searchParams.get('cryptoTag');

  const client = await clientPromise;
  const db = client.db();
  
  let query = {};
  
  // If cryptoTag is provided, filter posts by that crypto tag
  if (cryptoTag) {
    query = { 'cryptoTags.cryptoId': cryptoTag };
  }
  
  const posts = await db.collection('posts')
    .find(query)
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
  
  // Get top cryptocurrencies for tag extraction
  const cryptos = await db.collection('cryptocurrencies')
    .find({})
    .limit(250)
    .toArray();
  
  // Extract crypto tags from post text
  const cryptoTags = text ? extractCryptoTags(text, cryptos) : [];
  
  const newPost = {
    text: text || '',
    imageUrl: imageUrl || '',
    userId: userId || null,
    likes: [], // array av userId
    comments: [], // array av { userId, text, createdAt }
    createdAt: new Date(),
    cryptoTags: cryptoTags,
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