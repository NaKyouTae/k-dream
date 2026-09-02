import { Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AuthedRequest } from "../auth/auth.guard";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditEntry {
  /** LOGIN / CREATE_AGENT / UPDATE_SCHOOL … */
  actionCode: string;
  entityType: string;
  entityId?: string;
  detail?: Prisma.InputJsonValue;
  actorId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 관리자 사이트에서 실행한 액션을 기록한다.
   * 감사 기록 실패가 본 요청을 실패시키지 않도록 예외를 삼키고 로그만 남긴다.
   */
  async record(req: AuthedRequest, entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId ?? req.staff?.sub ?? null,
          actionCode: entry.actionCode,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          detail: entry.detail,
          ipAddress: clientIp(req),
          userAgent: req.headers["user-agent"]?.slice(0, 500) ?? null,
        },
      });
    } catch (e) {
      this.logger.error(`감사로그 기록 실패: ${entry.actionCode}`, e as Error);
    }
  }
}

function clientIp(req: AuthedRequest): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? null;
}
