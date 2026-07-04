import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 1. Check if the user has a valid NextAuth session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  
  // 2. Identify the type of page they are trying to visit
  // We removed /set-profile from here!
  const isSignupPage = req.nextUrl.pathname.startsWith('/signup');
  
  // We added /set-profile here so it requires authentication!
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                         req.nextUrl.pathname.startsWith('/admin') || 
                         req.nextUrl.pathname.startsWith('/set-profile');

  // 3. Logic: If they are logged in and trying to go to Signup, redirect to Dashboard
  if (isSignupPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return null; // Allow unauthenticated users to stay on signup
  }

  // 4. Logic: If they are NOT logged in and trying to access a protected route, redirect to Signup
  if (!isAuth && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }
}

// 5. Tell the middleware exactly which routes it needs to actively monitor
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/signup", "/set-profile"]
};