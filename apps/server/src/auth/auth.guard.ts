import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AUTH_COOKIE } from "./auth.constants";
import { AuthService, StaffPayload } from "./auth.service";

export interface AuthedRequest extends Request {
  staff?: StaffPayload;
}

/** 로그인한 staff(관리자 또는 에이전트)면 통과 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = extractToken(req);
    if (!token) throw new UnauthorizedException("로그인이 필요합니다.");

    req.staff = this.auth.verify(token);
    return true;
  }
}

/** 관리자(ADMIN)만 통과 */
@Injectable()
export class AdminGuard extends AuthGuard {
  canActivate(context: ExecutionContext): boolean {
    super.canActivate(context);
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (req.staff?.type !== "ADMIN") {
      throw new ForbiddenException("관리자 권한이 필요합니다.");
    }
    return true;
  }
}

function extractToken(req: AuthedRequest): string | undefined {
  const cookieToken = req.cookies?.[AUTH_COOKIE] as string | undefined;
  if (cookieToken) return cookieToken;

  const [scheme, value] = req.headers.authorization?.split(" ") ?? [];
  return scheme === "Bearer" ? value : undefined;
}
