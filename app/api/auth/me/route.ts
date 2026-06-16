import { NextResponse } from "next/server";
import { getSession } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, username: true, totalPoints: true, isAdmin: true },
  });

  return NextResponse.json({ user });
}
