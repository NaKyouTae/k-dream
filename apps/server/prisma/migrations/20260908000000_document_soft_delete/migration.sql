-- 서류는 영구 보관한다. 삭제는 표시만 하고 파일과 행은 남긴다.
ALTER TABLE "documents" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- 목록은 살아 있는 서류만 읽으므로 그 조건으로 조회한다.
CREATE INDEX "documents_studentId_deletedAt_idx" ON "documents"("studentId", "deletedAt");
