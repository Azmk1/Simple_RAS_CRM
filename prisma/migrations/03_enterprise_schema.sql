-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PHONE', 'EMAIL', 'IN_PERSON', 'VIDEO', 'PORTAL');

-- CreateEnum
CREATE TYPE "DeficiencyStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "clinicalSupportId" UUID;

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "method" "ContactMethod" NOT NULL,
    "subject" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "nextStep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RbtOnboarding" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "rbtId" UUID NOT NULL,
    "bacbVerified" BOOLEAN NOT NULL DEFAULT false,
    "backgroundCleared" BOOLEAN NOT NULL DEFAULT false,
    "trainingsComplete" BOOLEAN NOT NULL DEFAULT false,
    "artemisAccountSetup" BOOLEAN NOT NULL DEFAULT false,
    "payrollComplete" BOOLEAN NOT NULL DEFAULT false,
    "payerCredentialed" BOOLEAN NOT NULL DEFAULT false,
    "planOrientationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RbtOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteDeficiency" (
    "id" UUID NOT NULL,
    "noteId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "flaggedById" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DeficiencyStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "NoteDeficiency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RbtOnboarding_clientId_key" ON "RbtOnboarding"("clientId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_clinicalSupportId_fkey" FOREIGN KEY ("clinicalSupportId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RbtOnboarding" ADD CONSTRAINT "RbtOnboarding_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RbtOnboarding" ADD CONSTRAINT "RbtOnboarding_rbtId_fkey" FOREIGN KEY ("rbtId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDeficiency" ADD CONSTRAINT "NoteDeficiency_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "SessionNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDeficiency" ADD CONSTRAINT "NoteDeficiency_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDeficiency" ADD CONSTRAINT "NoteDeficiency_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
