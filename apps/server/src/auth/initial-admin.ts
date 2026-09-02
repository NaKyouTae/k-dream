import { INestApplicationContext, Logger } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "./auth.constants";
import { PrismaService } from "../prisma/prisma.service";

/**
 * 관리자가 하나도 없을 때만 최초 계정을 만든다.
 *
 * 배포 직후의 빈 DB 에는 로그인할 계정이 없어서 콘솔에 들어갈 수 없다.
 * 이미 관리자가 있으면 아무것도 하지 않으므로 재배포마다 실행돼도 안전하고,
 * 비밀번호를 바꿔도 이 코드가 되돌리지 않는다.
 */
export async function ensureInitialAdmin(app: INestApplicationContext) {
  const logger = new Logger("InitialAdmin");
  const prisma = app.get(PrismaService);

  const loginId = process.env.ADMIN_LOGIN_ID?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!loginId || !password) {
    logger.warn(
      "ADMIN_LOGIN_ID / ADMIN_PASSWORD 가 없어 최초 관리자 생성을 건너뜁니다.",
    );
    return;
  }

  try {
    const adminCount = await prisma.staff.count({ where: { type: "ADMIN" } });
    if (adminCount > 0) return;

    await prisma.staff.create({
      data: {
        type: "ADMIN",
        loginId,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        name: process.env.ADMIN_NAME?.trim() || "K-DREAM 관리자",
      },
    });
    logger.log(`최초 관리자 계정을 생성했습니다: ${loginId}`);
  } catch (e) {
    // 여기서 실패해도 서버는 떠야 한다 (DB 미연결 등)
    logger.error("최초 관리자 생성 실패", e as Error);
  }
}
