// Edge Runtime compatible — sin next/headers
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { type NextRequest } from "next/server";

export const SESSION_COOKIE = "prode_session";
const EXPIRY = "7d";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export interface SessionPayload extends JWTPayload {
  sub: string;
  username: string;
  isAdmin: boolean;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Usada en middleware (Edge Runtime)
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}
