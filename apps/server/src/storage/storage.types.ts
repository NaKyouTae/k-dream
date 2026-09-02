export interface StoredObject {
  /** 저장소 안의 경로. DB 에는 이 값만 남기고 공개 URL 은 저장하지 않는다 */
  storageUri: string;
}

export interface StorageDriver {
  readonly name: string;
  upload(path: string, body: Buffer, mimeType: string): Promise<StoredObject>;
  /** 만료 시간이 있는 다운로드 URL. 버킷이 비공개라 이 URL 로만 접근한다 */
  signedUrl(path: string, expiresInSeconds: number): Promise<string>;
  remove(path: string): Promise<void>;
}
