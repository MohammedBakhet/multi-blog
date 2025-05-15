import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { userId, text } = await req.json();
  if (!userId || !text) return NextResponse.json({ error: 'userId och text krävs' }, { status: 400 });
  if (text.length > 180) return NextResponse.json({ error: 'Kommentaren är för lång' }, { status: 400 });
  const client = await clientPromise;
  const db = client.db();
  const comment = {
    userId,
    text,
    createdAt: new Date(),
  };
  const result = await db.collection('posts').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $push: { comments: comment } },
    { returnDocument: 'after' }
  );
  return NextResponse.json({ comments: result.value?.comments || [] });
} 