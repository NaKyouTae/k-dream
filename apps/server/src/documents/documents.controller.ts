import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AuditService } from "../audit/audit.service";
import { AdminGuard, AuthGuard, AuthedRequest } from "../auth/auth.guard";
import { StorageService } from "../storage/storage.service";
import { DocumentsService } from "./documents.service";
import { ReviewDocumentDto } from "./dto/review-document.dto";

@Controller("documents")
export class DocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  /**
   * 개발용 로컬 저장소 파일 서빙.
   * 서명 토큰을 검증하므로 경로만 알아서는 받을 수 없다.
   * Supabase 를 쓰면 이 경로는 아예 사용되지 않는다.
   */
  @Get("local-file")
  localFile(
    @Query("path") path: string,
    @Query("expires") expires: string,
    @Query("token") token: string,
    @Res() res: Response,
  ) {
    const local = this.storage.local;
    if (!local) throw new NotFoundException();

    const filePath = local.verify(path, Number(expires), token);
    if (!filePath) throw new NotFoundException("링크가 만료되었습니다.");
    return res.sendFile(filePath);
  }

  /** 비공개 버킷이라 만료 시간이 있는 링크를 그때그때 발급한다 */
  @Get(":id/download-url")
  @UseGuards(AuthGuard)
  downloadUrl(@Param("id") id: string, @Req() req: AuthedRequest) {
    return this.documents.downloadUrl(req.staff!, id);
  }

  @Patch(":id/review")
  @UseGuards(AdminGuard)
  async review(
    @Param("id") id: string,
    @Body() dto: ReviewDocumentDto,
    @Req() req: AuthedRequest,
  ) {
    const document = await this.documents.review(req.staff!, id, dto);
    await this.audit.record(req, {
      actionCode: "REVIEW_DOCUMENT",
      entityType: "DOCUMENT",
      entityId: id,
      detail: { reviewStatus: dto.reviewStatus },
    });
    return document;
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async remove(@Param("id") id: string, @Req() req: AuthedRequest) {
    const document = await this.documents.remove(req.staff!, id);
    await this.audit.record(req, {
      actionCode: "DELETE_DOCUMENT",
      entityType: "DOCUMENT",
      entityId: id,
      detail: { category: document.category, versionNo: document.versionNo },
    });
  }
}
