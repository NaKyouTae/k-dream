import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { StaffPayload } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

const COMMENT_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  author: { select: { id: true, name: true, type: true } },
} satisfies Prisma.StudentCommentSelect;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 에이전트는 본인이 등록한 학생 건에만 접근할 수 있다 */
  private async assertStudentAccess(staff: StaffPayload, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        ...(staff.type === "ADMIN" ? {} : { agentId: staff.sub }),
      },
      select: { id: true },
    });
    if (!student) throw new NotFoundException("학생을 찾을 수 없습니다.");
  }

  async list(staff: StaffPayload, studentId: string) {
    await this.assertStudentAccess(staff, studentId);
    return this.prisma.studentComment.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
      select: COMMENT_SELECT,
    });
  }

  async create(staff: StaffPayload, studentId: string, body: string) {
    await this.assertStudentAccess(staff, studentId);
    return this.prisma.studentComment.create({
      data: { studentId, authorId: staff.sub, body: body.trim() },
      select: COMMENT_SELECT,
    });
  }

  /** 본인이 쓴 것만 지울 수 있다. 관리자는 모두 지울 수 있다. */
  async remove(staff: StaffPayload, id: string) {
    const comment = await this.prisma.studentComment.findUnique({
      where: { id },
      select: { id: true, authorId: true, studentId: true },
    });
    if (!comment) throw new NotFoundException("메모를 찾을 수 없습니다.");
    await this.assertStudentAccess(staff, comment.studentId);

    if (staff.type !== "ADMIN" && comment.authorId !== staff.sub) {
      throw new ForbiddenException("본인이 쓴 메모만 삭제할 수 있습니다.");
    }
    await this.prisma.studentComment.delete({ where: { id } });
    return comment;
  }
}
