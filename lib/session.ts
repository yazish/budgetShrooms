import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function createSessionToken(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { sessionToken, userId, expires },
  });

  return sessionToken;
}

export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    if (token) await prisma.session.deleteMany({ where: { sessionToken: token } });
    cookies().delete("session");
    return null;
  }

  return session;
}