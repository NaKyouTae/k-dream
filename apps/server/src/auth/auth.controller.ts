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
 * 상위 도메인을 지정하면 그 도메인의 모든 서브도메인에 쿠키가 전달된다.
 * 예) ".k-dream.kr" → api.k-dream.kr 이 발급한 쿠키를 admin.k-dream.kr 도 받는다.
 * 콘솔의 미들웨어(proxy.ts)가 이 쿠키를 읽어 로그인 여부를 판단하므로 이게 필요하다.
 */
const cookieDomain = process.env.COOKIE_DOMAIN?.trim() || undefined;

/**
 * COOKIE_DOMAIN 이 있으면 API 와 콘솔이 같은 사이트가 되므로 Lax 로 충분하다.
 * Lax 는 브라우저의 서드파티 쿠키 차단(Safari 기본값)과 무관해서 더 안전하다.
 *
 * 값이 없으면 서로 다른 사이트라고 보고 None + Secure 를 쓴다. 이 경우
 * 콘솔 미들웨어는 쿠키를 볼 수 없고, 브라우저가 서드파티 쿠키를 허용해야만 동작한다.
 * 로컬은 http 라 Secure 쿠키를 쓸 수 없어 Lax 를 유지한다.
 */
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: cookieDomain ? "lax" : isProduction ? "none" : "lax",
  secure: isProduction,
  domain: cookieDomain,
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
