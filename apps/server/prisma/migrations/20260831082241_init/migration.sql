-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CountryCode" AS ENUM ('UZ', 'MN');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('LANGUAGE', 'COLLEGE', 'UNIVERSITY', 'GRADUATE');

-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProgramCode" AS ENUM ('LANG', 'ASSOC', 'BACH', 'MASTER');

-- CreateEnum
CREATE TYPE "GenderCode" AS ENUM ('M', 'F', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('REVIEW_REQUESTED', 'REVIEWING', 'SUPPLEMENT_REQUIRED', 'REVIEW_COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('PASSPORT', 'PHOTO', 'GRAD_CERT', 'TRANSCRIPT', 'TOPIK', 'FINANCE', 'FAMILY', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('NOT_REVIEWED', 'OK', 'SUPPLEMENT_REQUIRED');

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "type" "StaffType" NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" "CountryCode",
    "organization" TEXT,
    "phone" TEXT,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT,
    "type" "SchoolType" NOT NULL,
    "region" TEXT,
    "website" TEXT,
    "memo" TEXT,
    "status" "SchoolStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "studentNo" TEXT NOT NULL,
    "countryCode" "CountryCode" NOT NULL,
    "agentId" TEXT NOT NULL,
    "passportName" TEXT NOT NULL,
    "localName" TEXT,
    "birthDate" DATE NOT NULL,
    "genderCode" "GenderCode" NOT NULL,
    "passportNo" TEXT NOT NULL,
    "passportExpiry" DATE NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "desiredProgram" "ProgramCode" NOT NULL,
    "desiredMajor" TEXT,
    "schoolId" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'REVIEW_REQUESTED',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "storageUri" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "versionNo" INTEGER NOT NULL DEFAULT 1,
    "uploaderId" TEXT NOT NULL,
    "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewNote" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actionCode" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_loginId_key" ON "staff"("loginId");

-- CreateIndex
CREATE INDEX "staff_type_status_idx" ON "staff"("type", "status");

-- CreateIndex
CREATE INDEX "schools_status_idx" ON "schools"("status");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentNo_key" ON "students"("studentNo");

-- CreateIndex
CREATE INDEX "students_agentId_idx" ON "students"("agentId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "documents_studentId_category_idx" ON "documents"("studentId", "category");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
