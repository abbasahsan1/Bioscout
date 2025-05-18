import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only execute middleware for the observations route
  if (request.nextUrl.pathname === '/observations') {
    console.log('Middleware handling /observations route');
    // This ensures the route is processed properly
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/observations'],
};
