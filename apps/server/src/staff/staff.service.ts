import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma, StaffType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "../auth/auth.constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateStaffInput,
  ListStaffQuery,
  UpdateStaffInput,
} from "./staff.types";

/** 비밀번호 해시는 어떤 응답에도 포함하지 않는다 */
const STAFF_SELECT = {
  id: true,
  type: true,
  loginId: true,
  name: true,
  countryCode: true,
  organization: true,
  phone: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  _count: { select: { students: true } },
} satisfies Prisma.StaffSelect;

/**
 * 관리자(ADMIN)와 에이전트(AGENT)는 같은 staff 테이블을 쓰므로
 * type 을 받아 한 서비스에서 처리한다.
 */
@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(type: StaffType, query: ListStaffQuery) {
    const take = query.limit ?? 30;
    const where: Prisma.StaffWhereInput = {
      type,
      ...(query.countryCode ? { countryCode: query.countryCode } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { loginId: { contains: query.q, mode: "insensitive" } },
              { organization: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.staff.findMany({
      where,
      select: STAFF_SELECT,
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasNext = rows.length > take;
    const items = hasNext ? rows.slice(0, take) : rows;
    return { items, nextCursor: hasNext ? items[items.length - 1].id : null };
  }

  async findOne(type: StaffType, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, type },
      select: STAFF_SELECT,
    });
    if (!staff)
      throw new NotFoundException(labelOf(type) + "를 찾을 수 없습니다.");
    return staff;
  }

  async create(type: StaffType, dto: CreateStaffInput) {
    const exists = await this.prisma.staff.findUnique({
      where: { loginId: dto.loginId },
      select: { id: true },
    });
    if (exists) throw new ConflictException("이미 사용 중인 계정입니다.");

    return this.prisma.staff.create({
      data: {
        type,
        loginId: dto.loginId,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        name: dto.name,
        countryCode: dto.countryCode ?? null,
        organization: dto.organization ?? null,
        phone: dto.phone,
      },
      select: STAFF_SELECT,
    });
  }

  async update(
    type: StaffType,
    id: string,
    dto: UpdateStaffInput,
    actorId: string,
  ) {
    await this.findOne(type, id);

    // 스스로를 정지시켜 콘솔에서 잠겨버리는 것을 막는다
    if (id === actorId && dto.status === "SUSPENDED") {
      throw new ForbiddenException("본인 계정은 정지할 수 없습니다.");
    }

    const { password, ...rest } = dto;
    return this.prisma.staff.update({
      where: { id },
      data: {
        ...rest,
        ...(password
          ? { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) }
          : {}),
      },
      select: STAFF_SELECT,
    });
  }

  /** 마지막 활성 관리자를 정지시키면 아무도 콘솔에 들어올 수 없게 된다 */
  async assertNotLastActiveAdmin(id: string) {
    const activeAdmins = await this.prisma.staff.count({
      where: { type: "ADMIN", status: "ACTIVE", NOT: { id } },
    });
    if (activeAdmins === 0) {
      throw new ForbiddenException("마지막 활성 관리자는 정지할 수 없습니다.");
    }
  }
}

function labelOf(type: StaffType) {
  return type === "ADMIN" ? "관리자" : "에이전트";
}
