-- 여러 파일을 먼저 올리고 종류는 나중에 지정할 수 있게 한다.
ALTER TABLE "documents" ALTER COLUMN "category" DROP NOT NULL;
