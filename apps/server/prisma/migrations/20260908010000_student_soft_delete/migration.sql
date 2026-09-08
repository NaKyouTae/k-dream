-- 학생을 실제로 지우면 documents 가 CASCADE 로 함께 사라진다.
-- 서류는 영구 보관 대상이므로 학생도 표시만 하고 남긴다.
ALTER TABLE "students" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "students_deletedAt_idx" ON "students"("deletedAt");
