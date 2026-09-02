import { createHmac, randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { InternalServerErrorException } from "@nestjs/common";
import type { StorageDriver, StoredObject } from "./storage.types";

/**
 * 개발용 로컬 디스크 드라이버.
 *
 * Supabase 설정이 없을 때만 쓰인다. 운영에서는 절대 선택되지 않도록
 * StorageService 에서 NODE_ENV=production 이면 기동을 막는다.
 * 서명 URL 은 서버가 직접 검증하는 토큰으로 흉내 낸다.
 */
export class LocalStorageDriver implements StorageDriver {
  readonly name = "local";
  private readonly secret = randomUUID();

  constructor(private readonly root: string) {}

  private absolute(path: string) {
    const full = resolve(this.root, path);
    // 경로 조작으로 저장소 밖에 쓰지 못하게 막는다
    if (!full.startsWith(resolve(this.root))) {
      throw new InternalServerErrorException("잘못된 저장 경로입니다.");
    }
    return full;
  }

  async upload(path: string, body: Buffer): Promise<StoredObject> {
    const full = this.absolute(path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, body);
    return { storageUri: path };
  }

  signedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const expires = Date.now() + expiresInSeconds * 1000;
    const token = this.sign(path, expires);
    const query = new URLSearchParams({
      path,
      expires: String(expires),
      token,
    });
    return Promise.resolve(`/documents/local-file?${query.toString()}`);
  }

  async remove(path: string): Promise<void> {
    await rm(this.absolute(path), { force: true });
  }

  sign(path: string, expires: number) {
    return createHmac("sha256", this.secret)
      .update(`${path}:${expires}`)
      .digest("hex");
  }

  verify(path: string, expires: number, token: string) {
    if (!Number.isFinite(expires) || expires < Date.now()) return null;
    if (this.sign(path, expires) !== token) return null;
    return this.absolute(path);
  }

  filePath(path: string) {
    return join(this.root, path);
  }
}
