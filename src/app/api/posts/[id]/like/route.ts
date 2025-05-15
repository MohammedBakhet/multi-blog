import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId krävs' }, { status: 400 });
  const client = await clientPromise;
  const db = client.db();
  const post = await db.collection('posts').findOne({ _id: new ObjectId(id) });
  if (!post) return NextResponse.json({ error: 'Inlägg hittades inte' }, { status: 404 });
  let update;
  if (post.likes?.includes(userId)) {
    update = { $pull: { likes: userId } };
  } else {
    update = { $addToSet: { likes: userId } };
  }
  const result = await db.collection('posts').findOneAndUpdate(
    { _id: new ObjectId(id) },
    update,
    { returnDocument: 'after' }
  );
  return NextResponse.json({ likes: result.value?.likes?.length || 0 });
} 