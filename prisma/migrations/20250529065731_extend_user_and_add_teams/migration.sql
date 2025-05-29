-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");
