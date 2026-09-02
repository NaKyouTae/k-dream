import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { extname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { DocumentCategory, Prisma } from "@prisma/client";
import type { StaffPayload } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { ReviewDocumentDto } from "./dto/review-document.dto";

/** 기획서 기준 허용 형식 — 여권 스캔·증명서라 이미지와 PDF 면 충분하다 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const DOCUMENT_SELECT = {
  id: true,
  studentId: true,
  category: true,
  originalFileName: true,
  storedFileName: true,
  mimeType: true,
  fileSizeBytes: true,
  versionNo: true,
  reviewStatus: true,
  reviewNote: true,
  uploadedAt: true,
  uploader: { select: { id: true, name: true } },
} satisfies Prisma.DocumentSelect;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** 학생에 접근할 수 있는지 확인한다. 에이전트는 본인이 등록한 학생만 */
  private async assertStudentAccess(staff: StaffPayload, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        ...(staff.type === "ADMIN" ? {} : { agentId: staff.sub }),
      },
      select: { id: true, studentNo: true, status: true },
    });
    if (!student) throw new NotFoundException("학생을 찾을 수 없습니다.");
    return student;
  }

  /**
   * 같은 종류의 서류를 다시 올리면 새 버전이 된다.
   * 종류가 없는 동안에는 버전을 매기지 않는다 (서로 다른 파일이지 이전 버전이 아니다).
   */
  private async nextVersionNo(
    studentId: string,
    category: DocumentCategory | null,
  ) {
    if (!category) return 1;
    const latest = await this.prisma.document.findFirst({
      where: { studentId, category },
      orderBy: { versionNo: "desc" },
      select: { versionNo: true },
    });
    return (latest?.versionNo ?? 0) + 1;
  }

  async upload(
    staff: StaffPayload,
    studentId: string,
    category: DocumentCategory | null,
    file: Express.Multer.File,
  ) {
    const student = await this.assertStudentAccess(staff, studentId);

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "PDF 또는 이미지 파일만 업로드할 수 있습니다.",
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException("파일 크기는 10MB 를 넘을 수 없습니다.");
    }
    if (file.size === 0) {
      throw new BadRequestException("빈 파일은 업로드할 수 없습니다.");
    }

    const versionNo = await this.nextVersionNo(studentId, category);

    // 저장 경로에는 종류를 넣지 않는다. 나중에 분류를 바꿔도 파일을 옮길 필요가 없다.
    // 사용자 파일명도 경로에 쓰지 않는다 (경로 조작·중복 방지).
    const extension = safeExtension(file.originalname, file.mimetype);
    const storedFileName = `${randomUUID()}${extension}`;
    const storagePath = `students/${student.studentNo}/${storedFileName}`;

    const { storageUri } = await this.storage.upload(
      storagePath,
      file.buffer,
      file.mimetype,
    );

    return this.prisma.document.create({
      data: {
        studentId,
        category,
        originalFileName: file.originalname.slice(0, 255),
        storedFileName,
        storageUri,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        versionNo,
        uploaderId: staff.sub,
        sha256: createHash("sha256").update(file.buffer).digest("hex"),
      },
      select: DOCUMENT_SELECT,
    });
  }

  /** 업로드 후 서류 종류를 지정하거나 바꾼다. 파일은 그대로 두고 분류만 바뀐다. */
  async setCategory(
    staff: StaffPayload,
    id: string,
    category: DocumentCategory | null,
  ) {
    const document = await this.findAccessible(staff, id);
    if (document.category === category) return document;

    return this.prisma.document.update({
      where: { id },
      data: {
        category,
        // 새 분류 안에서 몇 번째 버전인지 다시 매긴다
        versionNo: await this.nextVersionNo(document.studentId, category),
      },
      select: DOCUMENT_SELECT,
    });
  }

  async list(staff: StaffPayload, studentId: string) {
    await this.assertStudentAccess(staff, studentId);
    return this.prisma.document.findMany({
      where: { studentId },
      orderBy: [
        { category: "asc" },
        { versionNo: "desc" },
        { uploadedAt: "desc" },
      ],
      select: DOCUMENT_SELECT,
    });
  }

  private async findAccessible(staff: StaffPayload, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: {
        ...DOCUMENT_SELECT,
        storageUri: true,
        student: { select: { agentId: true, studentNo: true } },
      },
    });
    if (!document) throw new NotFoundException("서류를 찾을 수 없습니다.");
    if (staff.type !== "ADMIN" && document.student.agentId !== staff.sub) {
      // 남의 학생 서류면 존재 자체를 알리지 않는다
      throw new NotFoundException("서류를 찾을 수 없습니다.");
    }
    return document;
  }

  /** 버킷이 비공개라 만료 시간이 있는 링크를 그때그때 발급한다 */
  async downloadUrl(staff: StaffPayload, id: string) {
    const document = await this.findAccessible(staff, id);
    return {
      url: await this.storage.signedUrl(document.storageUri),
      fileName: document.originalFileName,
    };
  }

  async review(staff: StaffPayload, id: string, dto: ReviewDocumentDto) {
    await this.findAccessible(staff, id);
    if (dto.reviewStatus === "SUPPLEMENT_REQUIRED" && !dto.reviewNote?.trim()) {
      throw new BadRequestException("보완이 필요한 사유를 입력해 주세요.");
    }
    return this.prisma.document.update({
      where: { id },
      data: {
        reviewStatus: dto.reviewStatus,
        reviewNote: dto.reviewNote?.trim() || null,
      },
      select: DOCUMENT_SELECT,
    });
  }

  async remove(staff: StaffPayload, id: string) {
    const document = await this.findAccessible(staff, id);
    if (staff.type === "AGENT" && document.reviewStatus === "OK") {
      throw new ForbiddenException("확인완료된 서류는 삭제할 수 없습니다.");
    }
    await this.prisma.document.delete({ where: { id } });
    // 저장소 삭제가 실패해도 DB 기준으로는 지워진 것으로 본다
    await this.storage.remove(document.storageUri).catch(() => undefined);
    return document;
  }
}

/** 확장자는 화이트리스트로만 결정한다 (원본 파일명을 신뢰하지 않는다) */
function safeExtension(originalName: string, mimeType: string) {
  const byMime: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/heic": ".heic",
    "image/webp": ".webp",
  };
  if (byMime[mimeType]) return byMime[mimeType];
  const ext = extname(originalName).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}
