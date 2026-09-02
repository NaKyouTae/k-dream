import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthGuard, AuthedRequest } from "../auth/auth.guard";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

/** 학생 건에 대해 관리자와 에이전트가 주고받는 메모 */
@Controller("students/:studentId/comments")
@UseGuards(AuthGuard)
export class StudentCommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Param("studentId") studentId: string, @Req() req: AuthedRequest) {
    return this.comments.list(req.staff!, studentId);
  }

  @Post()
  async create(
    @Param("studentId") studentId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthedRequest,
  ) {
    const comment = await this.comments.create(req.staff!, studentId, dto.body);
    await this.audit.record(req, {
      actionCode: "CREATE_COMMENT",
      entityType: "STUDENT",
      entityId: studentId,
      detail: { commentId: comment.id },
    });
    return comment;
  }
}

@Controller("comments")
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly audit: AuditService,
  ) {}

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @Req() req: AuthedRequest) {
    const comment = await this.comments.remove(req.staff!, id);
    await this.audit.record(req, {
      actionCode: "DELETE_COMMENT",
      entityType: "STUDENT",
      entityId: comment.studentId,
      detail: { commentId: id },
    });
  }
}
