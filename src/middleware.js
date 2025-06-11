import { NextResponse } from 'next/server';
import pb from './app/lib/connection'; // Adjust based on how your pb instance is exported

export function middleware(request) {
  const isAuthenticated = pb.authStore.token !== null;
//   alert(`isAuthenticated: ${isAuthenticated}`);
// console.log(`isAuthenticated: ${isAuthenticated}`);

  // Allow public routes without authentication
  const publicPaths = ['/auth/auth1/login'];

  if (!isAuthenticated && !publicPaths.includes(request.nextUrl.pathname)) {
    const loginUrl = new URL('/auth/auth1/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply middleware to all paths (except static files and _next)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
