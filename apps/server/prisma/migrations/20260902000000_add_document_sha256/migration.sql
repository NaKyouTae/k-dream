-- 파일 무결성·중복 확인용 해시. 기존 행이 없는 상태를 전제로 NOT NULL 로 추가한다.
ALTER TABLE "documents" ADD COLUMN "sha256" CHAR(64) NOT NULL;
