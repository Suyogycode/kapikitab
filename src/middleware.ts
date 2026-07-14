import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // DIAGNOSTIC LOG: This will print in your VS Code terminal when it works!
  console.log("🛡️ Middleware checking path:", pathname);

  // 1. ADMIN SECURE AREA (BASIC AUTH)
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      if (user === 'admin' && pwd === 'kapikitab2026') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Unauthorized access.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Kapikitab Admin Secure Area"' },
    });
  }

  // 2. STANDARD USER AUTHENTICATION (NEXT-AUTH)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  
  const isSignupPage = pathname.startsWith('/signup');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/set-profile');

  if (isSignupPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return null; 
  }

  if (!isAuth && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Added the exact "/admin" path just to be absolutely certain it catches it
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/signup", "/set-profile"]
};