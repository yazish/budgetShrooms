"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getSession } from "@/lib/session";

const expenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole dollar amount")
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().min(1).max(1_000_000)),
  note: z
    .string()
    .trim()
    .max(160, "Keep notes under 160 characters")
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
});

const deleteSchema = z.object({
  expenseId: z.string().cuid(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function createExpense(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const rawAmount = formData.get("amount");
  const rawNote = formData.get("note");

  const parsed = expenseSchema.safeParse({
    amount: typeof rawAmount === "string" ? rawAmount : "",
    note: typeof rawNote === "string" ? rawNote : "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense");
  }

  await prisma.expense.create({
    data: {
      amountCents: parsed.data.amount * 100,
      note: parsed.data.note ?? null,
      userId: session.userId,
    },
  });

  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const rawId = formData.get("expenseId");
  const parsed = deleteSchema.safeParse({
    expenseId: typeof rawId === "string" ? rawId : "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense");
  }

  const deletion = await prisma.expense.deleteMany({
    where: {
      id: parsed.data.expenseId,
      userId: session.userId,
    },
  });

  if (deletion.count === 0) {
    throw new Error("Expense not found");
  }

  revalidatePath("/");
}

export async function signIn(formData: FormData) {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const parsed = signInSchema.safeParse({
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    redirect("/login?error=invalid");
  }

  const validPassword = await bcrypt.compare(
    parsed.data.password,
    user.hashedPassword,
  );

  if (!validPassword) {
    redirect("/login?error=invalid");
  }

  await deleteSession();
  await createSession(user.id);
  redirect("/");
}

export async function signOut() {
  await deleteSession();
  redirect("/login");
}
