import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuditService } from "../audit/audit.service";
import { AuthGuard, AuthedRequest } from "../auth/auth.guard";
import { DocumentsService, MAX_FILE_SIZE_BYTES } from "./documents.service";
import { UploadDocumentDto } from "./dto/upload-document.dto";

/** 학생에 속한 서류 목록/업로드 */
@Controller("students/:studentId/documents")
@UseGuards(AuthGuard)
export class StudentDocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Param("studentId") studentId: string, @Req() req: AuthedRequest) {
    return this.documents.list(req.staff!, studentId);
  }

  @Post()
  // 메모리에 받아 저장소로 넘긴다. 디스크에 임시 파일을 남기지 않는다.
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE_BYTES } }),
  )
  async upload(
    @Param("studentId") studentId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    const document = await this.documents.upload(
      req.staff!,
      studentId,
      dto.category ?? null,
      file,
    );
    await this.audit.record(req, {
      actionCode: "UPLOAD_DOCUMENT",
      entityType: "DOCUMENT",
      entityId: document.id,
      detail: {
        studentId,
        category: document.category,
        versionNo: document.versionNo,
      },
    });
    return document;
  }
}
