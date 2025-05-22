import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_CRYPTOPANIC_API_KEY;
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&public=true`;

  const res = await fetch(url, { next: { revalidate: 60 } }); 
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
  const data = await res.json();
  return NextResponse.json(data);
} 