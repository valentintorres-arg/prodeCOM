import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, buildSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  const clean = username?.trim().toLowerCase().replace(/\s+/g, "_");
  if (!clean || !/^[a-z0-9_]{3,20}$/.test(clean)) {
    return NextResponse.json({ error: "Usuario inválido (3-20 caracteres, letras, números y _)" }, { status: 400 });
  }
  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: clean }, { email: email.trim().toLowerCase() }] },
    select: { username: true, email: true },
  });

  if (existing?.username === clean) {
    return NextResponse.json({ error: "Ese nombre de usuario ya está en uso" }, { status: 409 });
  }
  if (existing?.email === email.trim().toLowerCase()) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username: clean,
      email: email.trim().toLowerCase(),
      passwordHash,
    },
    select: { id: true, username: true, isAdmin: true },
  });

  const token = await createSessionToken({ sub: user.id, username: user.username, isAdmin: user.isAdmin });
  const cookie = buildSessionCookie(token);

  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(cookie);
  return res;
}
