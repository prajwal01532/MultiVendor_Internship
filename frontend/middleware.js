import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token');
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/auth/login', '/auth/register'];

    // Check if the path is public
    const isPublicPath = publicPaths.includes(pathname);

    // If the path is not public and user is not authenticated, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};