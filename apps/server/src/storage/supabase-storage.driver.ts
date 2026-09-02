import { InternalServerErrorException } from "@nestjs/common";
import type { StorageDriver, StoredObject } from "./storage.types";

/**
 * Supabase Storage REST API 드라이버.
 *
 * S3 프로토콜 대신 REST 를 쓴다 — SigV4 서명이 필요 없어 의존성이 늘지 않고,
 * 서명 URL 발급이 한 번의 호출로 끝난다.
 */
export class SupabaseStorageDriver implements StorageDriver {
  readonly name = "supabase";

  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly bucket: string,
  ) {}

  private headers(extra: Record<string, string> = {}) {
    return {
      Authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      ...extra,
    };
  }

  async upload(
    path: string,
    body: Buffer,
    mimeType: string,
  ): Promise<StoredObject> {
    const res = await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${encodeURI(path)}`,
      {
        method: "POST",
        headers: this.headers({
          "Content-Type": mimeType,
          "cache-control": "3600",
        }),
        body: new Uint8Array(body),
      },
    );
    if (!res.ok) {
      throw new InternalServerErrorException(
        `파일 업로드에 실패했습니다. (${res.status} ${await res.text()})`,
      );
    }
    return { storageUri: path };
  }

  async signedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const res = await fetch(
      `${this.url}/storage/v1/object/sign/${this.bucket}/${encodeURI(path)}`,
      {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ expiresIn: expiresInSeconds }),
      },
    );
    if (!res.ok) {
      throw new InternalServerErrorException(
        `다운로드 링크 발급에 실패했습니다. (${res.status})`,
      );
    }
    const body = (await res.json()) as { signedURL?: string };
    if (!body.signedURL) {
      throw new InternalServerErrorException(
        "다운로드 링크를 받지 못했습니다.",
      );
    }
    return `${this.url}/storage/v1${body.signedURL}`;
  }

  async remove(path: string): Promise<void> {
    await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${encodeURI(path)}`,
      { method: "DELETE", headers: this.headers() },
    );
  }
}
