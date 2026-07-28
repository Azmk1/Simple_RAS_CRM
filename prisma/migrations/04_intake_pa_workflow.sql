-- AlterEnum
ALTER TYPE "ClientStatus" ADD VALUE 'MAGIC_LINK_SENT';
ALTER TYPE "ClientStatus" ADD VALUE 'DOCS_SUBMITTED';
ALTER TYPE "ClientStatus" ADD VALUE 'DOCS_APPROVED_INTAKE';
ALTER TYPE "ClientStatus" ADD VALUE 'CLINICAL_REVIEW_APPROVED';
ALTER TYPE "ClientStatus" ADD VALUE 'VOB_COMPLETED';
ALTER TYPE "ClientStatus" ADD VALUE 'PA_SUBMITTED';
ALTER TYPE "ClientStatus" ADD VALUE 'PA_APPROVED';

-- CreateEnum
CREATE TYPE "IntakePacketStatus" AS ENUM ('PENDING_CLIENT_SUBMISSION', 'SUBMITTED', 'REJECTED_BY_INTAKE', 'REJECTED_BY_CLINICAL', 'APPROVED');
CREATE TYPE "PARequestStatus" AS ENUM ('NOT_STARTED', 'SUBMITTED', 'DENIED_CLERICAL', 'DENIED_CLINICAL', 'APPROVED');

-- AlterTable
ALTER TABLE "Client" 
ADD COLUMN "childGender" TEXT,
ADD COLUMN "childAge" INTEGER,
ADD COLUMN "parentGender" TEXT,
ADD COLUMN "parentAddress" TEXT;

-- CreateTable
CREATE TABLE "IntakePacket" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "status" "IntakePacketStatus" NOT NULL DEFAULT 'PENDING_CLIENT_SUBMISSION',
    "form1Complete" BOOLEAN NOT NULL DEFAULT false,
    "form2Complete" BOOLEAN NOT NULL DEFAULT false,
    "form3Complete" BOOLEAN NOT NULL DEFAULT false,
    "insuranceCardUploaded" BOOLEAN NOT NULL DEFAULT false,
    "medicaidCardUploaded" BOOLEAN NOT NULL DEFAULT false,
    "diagnosticEvalUploaded" BOOLEAN NOT NULL DEFAULT false,
    "physicianRxUploaded" BOOLEAN NOT NULL DEFAULT false,
    "custodyDocsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "rejectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakePacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PARequest" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "type" "AuthType" NOT NULL,
    "status" "PARequestStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "vobCompleted" BOOLEAN NOT NULL DEFAULT false,
    "providerCredentialed" BOOLEAN NOT NULL DEFAULT false,
    "authNumber" TEXT,
    "approvedUnits" INTEGER,
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PARequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakePacket_clientId_key" ON "IntakePacket"("clientId");

-- AddForeignKey
ALTER TABLE "IntakePacket" ADD CONSTRAINT "IntakePacket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PARequest" ADD CONSTRAINT "PARequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
