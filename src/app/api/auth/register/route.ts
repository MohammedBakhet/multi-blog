import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }
    const userExists = await db.collection('users').findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }
    const hashedPassword = await hashPassword(password);
    await db.collection('users').insertOne({ email, password: hashedPassword });
    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 