import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Denna funktion körs för varje förfrågan
export function middleware(request: NextRequest) {
  // Hämta användarens token från cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Definiera vilka sidor som inte kräver autentisering
  const publicPaths = ['/', '/auth/register', '/auth/forgot-password'];
  const isPublicApiPath = request.nextUrl.pathname.startsWith('/api/auth/') && 
    !request.nextUrl.pathname.includes('/api/auth/logout');
  
  // Kontrollera om användaren besöker en publik sida eller inte
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path) || isPublicApiPath;
  
  // Om användaren inte är inloggad och försöker nå en skyddad sida
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Om användaren är inloggad och försöker nå inloggningssidan
  if (token && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/explore', request.url));
  }
  
  return NextResponse.next();
}

// Konfigurera på vilka sökvägar middleware ska köras
export const config = {
  matcher: [
    // Matcha alla sökvägar utom statiska filer
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
