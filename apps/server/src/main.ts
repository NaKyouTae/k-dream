import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ensureInitialAdmin } from "./auth/initial-admin";

/** 로컬 개발용 기본값. 운영에서는 CORS_ORIGINS 로 덮어쓴다. */
const DEV_ORIGINS = [
  "http://localhost:17001",
  "http://localhost:17002",
  "http://127.0.0.1:17001",
  "http://127.0.0.1:17002",
];

function corsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEV_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const origins = corsOrigins();
  app.enableCors({ origin: origins, credentials: true });
  new Logger("Bootstrap").log(`CORS 허용 origin: ${origins.join(", ")}`);

  // 빈 DB 로 처음 뜰 때 로그인할 계정이 없으면 콘솔에 들어갈 수가 없다
  await ensureInitialAdmin(app);

  await app.listen(process.env.PORT ?? 17000, "0.0.0.0");
}
void bootstrap();
