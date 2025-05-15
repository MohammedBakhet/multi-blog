import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 1) {
    return NextResponse.json({ message: 'Inlägg raderat' });
  } else {
    return NextResponse.json({ message: 'Inlägg hittades inte' }, { status: 404 });
  }
} 