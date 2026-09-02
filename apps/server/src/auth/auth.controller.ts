import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { CookieOptions, Response } from "express";
import { AuditService } from "../audit/audit.service";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "./auth.constants";
import { AuthGuard, AuthedRequest } from "./auth.guard";
import { AuthService, StaffPayload } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

const isProduction = process.env.NODE_ENV === "production";

/**
 * 운영에서는 API(Render)와 콘솔(Vercel)이 서로 다른 사이트라
 * SameSite=Lax 면 쿠키가 요청에 실리지 않는다. None + Secure 가 필요하다.
 * 로컬은 http 라 Secure 쿠키를 쓸 수 없어 Lax 를 유지한다.
 */
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly audit: AuditService,
  ) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StaffPayload> {
    const { token, staff } = await this.auth.login(dto);
    res.cookie(AUTH_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    await this.audit.record(req, {
      actorId: staff.sub,
      actionCode: "LOGIN",
      entityType: "STAFF",
      entityId: staff.sub,
    });
    return staff;
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    // 쿠키가 이미 만료됐어도 로그아웃 자체는 성공시킨다
    const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
    if (token) {
      try {
        const staff = this.auth.verify(token);
        await this.audit.record(req, {
          actorId: staff.sub,
          actionCode: "LOGOUT",
          entityType: "STAFF",
          entityId: staff.sub,
        });
      } catch {
        // 만료된 토큰은 기록하지 않고 넘어간다
      }
    }
    res.clearCookie(AUTH_COOKIE, COOKIE_OPTIONS);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.staff!.sub);
  }
}
