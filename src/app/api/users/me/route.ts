import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

const DEMO_USER_ID = 'demo-user';

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ userId: DEMO_USER_ID });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ name: user.name, email: user.email, profileImage: user.profileImage || '' });
}

export async function PATCH(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db();
  const body = await req.json();
  const { name, profileImage } = body;
  const result = await db.collection('users').findOneAndUpdate(
    { userId: DEMO_USER_ID },
    { $set: { name, profileImage } },
    { returnDocument: 'after', upsert: true }
  );
  return NextResponse.json({ name: result.value?.name, email: result.value?.email, profileImage: result.value?.profileImage || '' });
} 