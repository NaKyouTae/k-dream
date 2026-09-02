-- 관리자와 에이전트가 학생 건에 대해 주고받는 메모
CREATE TABLE "student_comments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_comments_studentId_createdAt_idx" ON "student_comments"("studentId", "createdAt");

-- 학생이 지워지면 대화도 함께 지운다
ALTER TABLE "student_comments" ADD CONSTRAINT "student_comments_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 작성자 계정은 남아 있어야 누가 썼는지 알 수 있다
ALTER TABLE "student_comments" ADD CONSTRAINT "student_comments_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
