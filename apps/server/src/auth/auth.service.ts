import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { StaffType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

export interface StaffPayload {
  sub: string;
  loginId: string;
  name: string;
  type: StaffType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto): Promise<{ token: string; staff: StaffPayload }> {
    const staff = await this.prisma.staff.findUnique({
      where: { loginId: dto.loginId },
    });

    // 계정이 없을 때도 해시 비교를 수행해 응답 시간으로 존재 여부가 드러나지 않게 한다.
    const hash =
      staff?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinva";
    const matches = await bcrypt.compare(dto.password, hash);

    if (!staff || !matches) {
      throw new UnauthorizedException(
        "계정 또는 비밀번호가 올바르지 않습니다.",
      );
    }
    if (staff.status === "SUSPENDED") {
      throw new UnauthorizedException(
        "정지된 계정입니다. 관리자에게 문의하세요.",
      );
    }

    await this.prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: StaffPayload = {
      sub: staff.id,
      loginId: staff.loginId,
      name: staff.name,
      type: staff.type,
    };
    return { token: this.jwt.sign(payload), staff: payload };
  }

  verify(token: string): StaffPayload {
    try {
      return this.jwt.verify<StaffPayload>(token);
    } catch {
      throw new UnauthorizedException("세션이 만료되었습니다.");
    }
  }

  /** 토큰 payload 가 아니라 DB 기준으로 현재 staff 를 돌려준다 */
  async me(staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        loginId: true,
        name: true,
        type: true,
        countryCode: true,
        organization: true,
        status: true,
      },
    });
    if (!staff || staff.status === "SUSPENDED") {
      throw new UnauthorizedException("다시 로그인해 주세요.");
    }
    return {
      sub: staff.id,
      loginId: staff.loginId,
      name: staff.name,
      type: staff.type,
      countryCode: staff.countryCode,
      organization: staff.organization,
    };
  }
}
