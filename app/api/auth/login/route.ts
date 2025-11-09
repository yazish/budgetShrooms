import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.hashedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  cookies().set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}