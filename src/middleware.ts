import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  if (!isAuthPage && !isLoggedIn && !nextUrl.pathname.startsWith('/api/')) {
    return Response.redirect(new URL('/login', nextUrl));
  }
  return undefined;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
