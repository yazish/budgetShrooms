import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { Session, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 90;
export const SESSION_COOKIE_NAME = "budgetshrooms_session";

export type ActiveSession = Session & { user: User };

export async function createSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { sessionToken, userId, expires },
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return;

  await prisma.session.deleteMany({ where: { sessionToken: token } });
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<ActiveSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

export async function requireSession(): Promise<ActiveSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("No active session");
  }
  return session;
}
