import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { extractCryptoTags } from '../../../lib/cryptoService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cryptoTag = searchParams.get('cryptoTag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    let query = {};

    if (cryptoTag) {
      // Slå upp symbol och namn för cryptoId
      const crypto = await db.collection('cryptocurrencies').findOne({ id: cryptoTag });
      if (crypto) {
        const symbol = crypto.symbol;
        const name = crypto.name;
        // Bygg regex som matchar $SYMBOL, #SYMBOL, SYMBOL, NAMN (case-insensitive)
        const regex = new RegExp(`(\\$|#)${symbol}|${symbol}|${name}`, 'i');
        query = {
          $or: [
            { 'cryptoTags.cryptoId': cryptoTag },
            { text: { $regex: regex } },
          ]
        };
      } else {
        // Om ingen crypto hittas, returnera tomt resultat
        return NextResponse.json({ posts: [] });
      }
    }

    const posts = await db
      .collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
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