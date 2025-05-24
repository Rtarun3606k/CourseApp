// export { auth as middleware } from "./app/auth";
// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  // Get the token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // If no token and accessing protected route
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/Login", request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      // Verify JWT token
      const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);
      const { payload } = await jwtVerify(token, secretKey);

      // Add user data to headers for API routes to access
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.id);
      requestHeaders.set("x-user-role", payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token is invalid - handle accordingly
    }
  }

  // For non-protected routes, continue normally
  return NextResponse.next();
}

function isProtectedRoute(path) {
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/api/protected",
    "/Admin/dashboard",
  ];
  return protectedRoutes.some((route) => path.startsWith(route));
}
