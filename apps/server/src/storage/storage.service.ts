import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { resolve } from "node:path";
import { LocalStorageDriver } from "./local-storage.driver";
import { SupabaseStorageDriver } from "./supabase-storage.driver";
import type { StorageDriver } from "./storage.types";

/** 다운로드 링크 유효시간 */
export const SIGNED_URL_TTL_SECONDS = 60 * 5;

@Injectable()
export class StorageService implements OnModuleInit, StorageDriver {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;

  constructor() {
    const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    this.driver =
      url && key && bucket
        ? new SupabaseStorageDriver(url, key, bucket)
        : new LocalStorageDriver(
            resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR ?? "uploads"),
          );
  }

  onModuleInit() {
    if (this.driver.name === "local") {
      // 운영에서 로컬 디스크에 쌓이면 재배포마다 파일이 사라진다
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "운영 환경에는 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_STORAGE_BUCKET 이 모두 필요합니다.",
        );
      }
      this.logger.warn(
        "Supabase 설정이 없어 로컬 디스크에 파일을 저장합니다 (개발 전용).",
      );
    }
  }

  get name() {
    return this.driver.name;
  }

  /** 로컬 드라이버일 때만 값이 있다 (개발용 파일 서빙에 쓰인다) */
  get local(): LocalStorageDriver | null {
    return this.driver instanceof LocalStorageDriver ? this.driver : null;
  }

  upload(path: string, body: Buffer, mimeType: string) {
    return this.driver.upload(path, body, mimeType);
  }

  signedUrl(path: string, expiresInSeconds = SIGNED_URL_TTL_SECONDS) {
    return this.driver.signedUrl(path, expiresInSeconds);
  }

  remove(path: string) {
    return this.driver.remove(path);
  }
}
