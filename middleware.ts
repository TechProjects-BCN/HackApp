// middleware.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function middleware(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next(); // Allow request to continue
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/"], // Protect these routes
};
