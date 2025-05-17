import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldUserId, newUserId, profileImage } = body;
    if (!oldUserId || !newUserId) {
      return NextResponse.json({ error: 'oldUserId och newUserId krävs' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('posts').updateMany(
      { userId: oldUserId },
      { $set: { userId: newUserId, profileImage } }
    );
    return NextResponse.json({ updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Fel vid uppdatering av inlägg:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 