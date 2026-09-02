import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ADMIN_LOGIN_ID = process.env.ADMIN_LOGIN_ID ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123!@#";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.staff.upsert({
    where: { loginId: ADMIN_LOGIN_ID },
    update: {},
    create: {
      type: "ADMIN",
      loginId: ADMIN_LOGIN_ID,
      passwordHash,
      name: "K-DREAM 관리자",
    },
  });

  console.log(`관리자 계정 준비 완료: ${admin.loginId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
