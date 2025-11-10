/*
  Warnings:

  - You are about to drop the column `amountCents` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `currentBudgetCents` on the `User` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "amountCents",
ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentBudgetCents",
ADD COLUMN     "currentBudget" DECIMAL(14,2) NOT NULL DEFAULT 0;
