// Server Components / Route Handlers only — no Edge Runtime
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./session";

export type { SessionPayload };

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
