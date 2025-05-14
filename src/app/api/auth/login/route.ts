import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken, comparePasswords } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    // Anslut till databasen
    await dbConnect();
    
    // Hämta data från begäran
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-post och lösenord krävs' },
        { status: 400 }
      );
    }

    // Hämta användarmodellen direkt från mongoose
    const UserModel = mongoose.models.User || mongoose.model('User');
    
    // Sök efter användaren
    const user = await UserModel.findOne({ email });
    
    // Användaren hittades inte
    if (!user) {
      return NextResponse.json(
        { message: 'Felaktiga inloggningsuppgifter' },
        { status: 401 }
      );
    }

    // Jämför lösenordet
    const isValidPassword = await comparePasswords(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Felaktiga inloggningsuppgifter' },
        { status: 401 }
      );
    }

    // Skapa en token
    const token = generateToken(user.email);

    // Sätt cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 vecka
    });

    // Returnera framgångsmeddelande
    return NextResponse.json({ 
      message: 'Inloggning lyckades',
      user: {
        email: user.email,
        id: user._id
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { message: 'Ett serverfel inträffade', details: error.message },
      { status: 500 }
    );
  }
} 