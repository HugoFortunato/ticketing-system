-- AlterTable
ALTER TABLE "Event" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");
