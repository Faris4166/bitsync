import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// กำหนดว่าหน้าไหนต้อง Login (Private)
const isProtectedRoute = createRouteMatcher(['/auth/home(.*)', '/dashboard(.*)']);
// กำหนดหน้าแรก
const isLandingPage = createRouteMatcher(['/']);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. ถ้า Login แล้วแต่อยู่หน้าแรก -> ให้เด้งไป /auth/home
  if (userId && isLandingPage(req)) {
    return NextResponse.redirect(new URL('/auth/home', req.url));
  }

  // 2. ถ้ายังไม่ Login แต่จะเข้าหน้า Private -> ให้เด้งไปหน้าแรกเพื่อให้ Login
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};