import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/auth.guard";
import { ListAuditLogsDto } from "./dto/list-audit-logs.dto";
import { PrismaService } from "../prisma/prisma.service";

@Controller("audit-logs")
@UseGuards(AdminGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  /** 커서 기반 페이지네이션. cursor 는 직전 페이지 마지막 로그의 id */
  @Get()
  async list(@Query() query: ListAuditLogsDto) {
    const take = query.limit ?? 30;
    const rows = await this.prisma.auditLog.findMany({
      where: query.actionCode ? { actionCode: query.actionCode } : undefined,
      include: { actor: { select: { name: true, loginId: true, type: true } } },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasNext = rows.length > take;
    const items = hasNext ? rows.slice(0, take) : rows;
    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
