import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter: new PrismaPg(pool) });

    if (!process.env.DATABASE_URL) {
      // 연결은 첫 쿼리 시점에 lazy 하게 이뤄지므로 DB 없이도 서버는 기동된다.
      this.logger.warn("DATABASE_URL 미설정 — DB 쿼리는 실패합니다.");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
