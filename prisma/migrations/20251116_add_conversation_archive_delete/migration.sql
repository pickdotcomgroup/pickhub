-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "archivedByClient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedByTalent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedByClient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedByTalent" BOOLEAN NOT NULL DEFAULT false;
