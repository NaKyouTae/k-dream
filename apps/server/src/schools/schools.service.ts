import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSchoolDto } from "./dto/create-school.dto";
import { ListSchoolsDto } from "./dto/list-schools.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSchoolsDto) {
    const take = query.limit ?? 30;
    const where: Prisma.SchoolWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { nameKo: { contains: query.q, mode: "insensitive" } },
              { nameEn: { contains: query.q, mode: "insensitive" } },
              { region: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.school.findMany({
      where,
      include: { _count: { select: { students: true } } },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasNext = rows.length > take;
    const items = hasNext ? rows.slice(0, take) : rows;
    return { items, nextCursor: hasNext ? items[items.length - 1].id : null };
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException("학교를 찾을 수 없습니다.");
    return school;
  }

  create(dto: CreateSchoolDto) {
    return this.prisma.school.create({ data: dto });
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.findOne(id);
    return this.prisma.school.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });
    if (!school) throw new NotFoundException("학교를 찾을 수 없습니다.");
    if (school._count.students > 0) {
      throw new ConflictException(
        "이 학교에 신청한 학생이 있어 삭제할 수 없습니다. 비활성으로 변경하세요.",
      );
    }
    await this.prisma.school.delete({ where: { id } });
  }
}
