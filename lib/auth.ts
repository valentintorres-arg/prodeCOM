import { getSession } from "./session-server";
import { prisma } from "./prisma";

const userSelect = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  totalPoints: true,
  isAdmin: true,
} as const;

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return { session: null, user: null };

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: userSelect,
  });

  return { session, user };
}

export async function requireAuth() {
  const { session, user } = await getSessionUser();
  if (!session || !user) throw new Error("No autenticado");
  return { session, user };
}

export async function requireAdmin() {
  const { session, user } = await getSessionUser();
  if (!session || !user || !user.isAdmin) throw new Error("Sin permisos de administrador");
  return { session, user };
}
