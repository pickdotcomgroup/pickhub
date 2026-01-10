/*
  Warnings:

  - You are about to drop the column `polarProductId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `polarOrderId` on the `JobPostingPayment` table. All the data in the column will be lost.
  - You are about to drop the column `polarCheckoutId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `polarOrderId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `polarPayoutId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the `PolarCustomer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymongoCheckoutId]` on the table `JobPostingPayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymongoCheckoutId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymongoCheckoutId` to the `JobPostingPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymongoCheckoutId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PolarCustomer" DROP CONSTRAINT "PolarCustomer_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropIndex
DROP INDEX "public"."Course_polarProductId_key";

-- DropIndex
DROP INDEX "public"."JobPostingPayment_polarOrderId_key";

-- DropIndex
DROP INDEX "public"."Order_polarOrderId_idx";

-- DropIndex
DROP INDEX "public"."Order_polarOrderId_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "polarProductId",
ALTER COLUMN "currency" SET DEFAULT 'PHP';

-- AlterTable
ALTER TABLE "JobPostingPayment" DROP COLUMN "polarOrderId",
ADD COLUMN     "paymongoCheckoutId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "polarCheckoutId",
DROP COLUMN "polarOrderId",
ADD COLUMN     "paymongoCheckoutId" TEXT NOT NULL,
ADD COLUMN     "paymongoPaymentId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'PHP';

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "polarPayoutId";

-- DropTable
DROP TABLE "public"."PolarCustomer";

-- DropTable
DROP TABLE "public"."Subscription";

-- CreateIndex
CREATE UNIQUE INDEX "JobPostingPayment_paymongoCheckoutId_key" ON "JobPostingPayment"("paymongoCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymongoCheckoutId_key" ON "Order"("paymongoCheckoutId");

-- CreateIndex
CREATE INDEX "Order_paymongoCheckoutId_idx" ON "Order"("paymongoCheckoutId");
