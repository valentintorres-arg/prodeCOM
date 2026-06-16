import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, buildSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const clean = identifier.trim().toLowerCase();
  const isEmail = clean.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: clean } : { username: clean },
    select: { id: true, username: true, passwordHash: true, isAdmin: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createSessionToken({ sub: user.id, username: user.username, isAdmin: user.isAdmin });
  const cookie = buildSessionCookie(token);

  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(cookie);
  return res;
}
