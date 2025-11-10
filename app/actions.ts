"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getSession } from "@/lib/session";

const expenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
    .transform((value) => value.replace(/^0+(?=\d)/, ""))
    .refine((value) => value.length > 0, "Enter a valid amount"),
  note: z
    .string()
    .trim()
    .max(160, "Keep notes under 160 characters")
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
});

const budgetSchema = z.object({
  budget: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid budget")
    .transform((value) => value.replace(/^0+(?=\d)/, ""))
    .refine((value) => value.length > 0, "Enter a valid budget"),
});

const deleteSchema = z.object({
  expenseId: z.string().cuid(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .max(60, "Keep names under 60 characters")
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  email: z.string().email(),
  password: z.string().min(1).max(256),
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

  const amountDecimal = new Prisma.Decimal(parsed.data.amount);
  if (amountDecimal.lte(0)) {
    throw new Error("Enter an amount greater than zero");
  }

  await prisma.expense.create({
    data: {
      amount: amountDecimal,
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

export async function updateBudget(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const rawBudget = formData.get("budget");
  const parsed = budgetSchema.safeParse({
    budget: typeof rawBudget === "string" ? rawBudget : "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid budget");
  }

  const budgetDecimal = new Prisma.Decimal(parsed.data.budget);
  if (budgetDecimal.lt(0)) {
    throw new Error("Budget cannot be negative");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { currentBudget: budgetDecimal },
  });

  revalidatePath("/");
}

export async function signUp(formData: FormData) {
  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = signUpSchema.safeParse({
    name: typeof rawName === "string" ? rawName : undefined,
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!parsed.success) {
    redirect("/signup?error=invalid");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/signup?error=exists");
  }

  const saltRounds = Number.parseInt(
    process.env.BCRYPT_SALT_ROUNDS ?? "12",
    10,
  );
  const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name ?? null,
      hashedPassword,
    },
  });

  await deleteSession();
  await createSession(user.id);
  redirect("/");
}
