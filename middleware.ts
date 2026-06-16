import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PUBLIC_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/dashboard", "/leaderboard", "/mis-predicciones", "/admin"];

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const path = request.nextUrl.pathname;

  if (session && PUBLIC_ROUTES.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && PROTECTED_ROUTES.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
