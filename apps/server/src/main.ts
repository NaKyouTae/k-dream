import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: [
      "http://localhost:17001",
      "http://localhost:17002",
      "http://127.0.0.1:17001",
      "http://127.0.0.1:17002",
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 17000, "0.0.0.0");
}
void bootstrap();
