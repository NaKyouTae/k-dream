import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_EXPIRES_IN, JWT_SECRET } from "./auth.constants";
import { AuthController } from "./auth.controller";
import { AdminGuard, AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard],
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}
