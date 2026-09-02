import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CountryCode } from "@prisma/client";
import type { StaffPayload } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { ListStudentsDto } from "./dto/list-students.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { UpdateStudentStatusDto } from "./dto/update-status.dto";

const LIST_SELECT = {
  id: true,
  studentNo: true,
  countryCode: true,
  passportName: true,
  localName: true,
  desiredProgram: true,
  desiredMajor: true,
  status: true,
  reviewNote: true,
  createdAt: true,
  updatedAt: true,
  agent: { select: { id: true, name: true, organization: true } },
  school: { select: { id: true, nameKo: true } },
  _count: { select: { documents: true } },
} satisfies Prisma.StudentSelect;

const DETAIL_INCLUDE = {
  agent: {
    select: { id: true, name: true, organization: true, loginId: true },
  },
  school: { select: { id: true, nameKo: true, type: true } },
  reviewedBy: { select: { id: true, name: true } },
  documents: {
    orderBy: [{ category: "asc" }, { versionNo: "desc" }],
    include: { uploader: { select: { id: true, name: true } } },
  },
} satisfies Prisma.StudentInclude;

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 에이전트는 본인이 등록한 학생만 볼 수 있다 */
  private scopeOf(staff: StaffPayload): Prisma.StudentWhereInput {
    return staff.type === "ADMIN" ? {} : { agentId: staff.sub };
  }

  async list(staff: StaffPayload, query: ListStudentsDto) {
    const take = query.limit ?? 30;
    const where: Prisma.StudentWhereInput = {
      ...this.scopeOf(staff),
      ...(query.status ? { status: query.status } : {}),
      ...(query.countryCode ? { countryCode: query.countryCode } : {}),
      // 에이전트 필터는 관리자만 의미가 있다
      ...(staff.type === "ADMIN" && query.agentId
        ? { agentId: query.agentId }
        : {}),
      ...(query.q
        ? {
            OR: [
              { studentNo: { contains: query.q, mode: "insensitive" } },
              { passportName: { contains: query.q, mode: "insensitive" } },
              { localName: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.student.findMany({
      where,
      select: LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasNext = rows.length > take;
    const items = hasNext ? rows.slice(0, take) : rows;
    return { items, nextCursor: hasNext ? items[items.length - 1].id : null };
  }

  async findOne(staff: StaffPayload, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, ...this.scopeOf(staff) },
      include: DETAIL_INCLUDE,
    });
    // 남의 학생이면 존재 자체를 알리지 않는다
    if (!student) throw new NotFoundException("학생을 찾을 수 없습니다.");
    return student;
  }

  async statusCounts(staff: StaffPayload) {
    const rows = await this.prisma.student.groupBy({
      by: ["status"],
      where: this.scopeOf(staff),
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.status] = row._count._all;
    return counts;
  }

  async create(staff: StaffPayload, dto: CreateStudentDto) {
    await this.assertSchoolUsable(dto.schoolId);

    // 에이전트는 본인 앞으로만, 관리자는 담당 에이전트를 골라서 등록한다
    if (staff.type === "AGENT" && dto.agentId && dto.agentId !== staff.sub) {
      throw new ForbiddenException("본인 앞으로만 학생을 등록할 수 있습니다.");
    }
    const agentId = staff.type === "ADMIN" ? dto.agentId : staff.sub;
    if (!agentId) {
      throw new BadRequestException("담당 에이전트를 선택해 주세요.");
    }

    // 학생번호에 국가가 들어가므로 화면 입력이 아니라 담당 에이전트 기준으로 정한다
    const agent = await this.prisma.staff.findFirst({
      where: { id: agentId, type: "AGENT" },
      select: { countryCode: true },
    });
    if (!agent) {
      throw new BadRequestException("존재하지 않는 에이전트입니다.");
    }
    if (!agent.countryCode) {
      throw new BadRequestException(
        "에이전트 계정에 국가가 설정돼 있지 않습니다.",
      );
    }
    if (dto.countryCode && dto.countryCode !== agent.countryCode) {
      throw new ForbiddenException(
        "담당 에이전트의 국가와 다른 학생은 등록할 수 없습니다.",
      );
    }
    const countryCode = agent.countryCode;

    // 학생번호는 국가-연도-일련번호. 동시 등록 시 유니크 충돌이 나면 다시 뽑는다.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.student.create({
          data: {
            studentNo: await this.nextStudentNo(countryCode),
            countryCode,
            agentId,
            passportName: dto.passportName,
            localName: dto.localName,
            birthDate: new Date(dto.birthDate),
            genderCode: dto.genderCode,
            passportNo: dto.passportNo,
            passportExpiry: new Date(dto.passportExpiry),
            phone: dto.phone,
            email: dto.email,
            desiredProgram: dto.desiredProgram,
            desiredMajor: dto.desiredMajor,
            schoolId: dto.schoolId,
            // 등록하면 바로 검토요청 상태가 된다
            status: "REVIEW_REQUESTED",
          },
          select: LIST_SELECT,
        });
      } catch (e) {
        if (!isUniqueViolation(e, "studentNo") || attempt === 4) throw e;
      }
    }
    throw new BadRequestException(
      "학생번호 발급에 실패했습니다. 다시 시도해 주세요.",
    );
  }

  async update(staff: StaffPayload, id: string, dto: UpdateStudentDto) {
    const student = await this.findOne(staff, id);
    if (staff.type === "AGENT" && student.status === "REVIEW_COMPLETED") {
      throw new ForbiddenException("검토 완료된 학생은 수정할 수 없습니다.");
    }
    await this.assertSchoolUsable(dto.schoolId);

    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.birthDate ? { birthDate: new Date(dto.birthDate) } : {}),
        ...(dto.passportExpiry
          ? { passportExpiry: new Date(dto.passportExpiry) }
          : {}),
      },
      select: LIST_SELECT,
    });
  }

  async updateStatus(
    staff: StaffPayload,
    id: string,
    dto: UpdateStudentStatusDto,
  ) {
    await this.findOne(staff, id);

    if (dto.status === "REVIEW_REQUESTED") {
      throw new BadRequestException(
        "검토 요청은 에이전트가 등록할 때만 붙는 상태입니다.",
      );
    }
    if (dto.status === "SUPPLEMENT_REQUIRED" && !dto.reviewNote?.trim()) {
      throw new BadRequestException("보완이 필요한 사유를 입력해 주세요.");
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedById: staff.sub,
      },
      select: LIST_SELECT,
    });
  }

  /**
   * 에이전트가 보완을 마치고 다시 검토를 요청한다.
   *
   * 관리자용 updateStatus 와 분리한 이유는, 그쪽은 AdminGuard 로 막혀 있고
   * REVIEW_REQUESTED 로 되돌리는 것을 막고 있기 때문이다. 여기서는 반대로
   * 그 상태로만 보낸다.
   */
  async requestReview(staff: StaffPayload, id: string) {
    const student = await this.findOne(staff, id);

    if (student.status === "REVIEW_COMPLETED") {
      throw new BadRequestException("이미 검토가 완료된 학생입니다.");
    }
    if (student.status === "REVIEW_REQUESTED") {
      throw new BadRequestException("이미 검토를 요청한 상태입니다.");
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        status: "REVIEW_REQUESTED",
        // 지난 보완 사유는 더 이상 현재 상태가 아니다. 오간 내용은 메모에 남는다.
        reviewNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
      select: LIST_SELECT,
    });
  }

  /** 비활성 학교로는 신청할 수 없다 */
  private async assertSchoolUsable(schoolId?: string) {
    if (!schoolId) return;
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { status: true },
    });
    if (!school) throw new BadRequestException("존재하지 않는 학교입니다.");
    if (school.status === "INACTIVE") {
      throw new BadRequestException(
        "비활성 상태인 학교에는 신청할 수 없습니다.",
      );
    }
  }

  private async nextStudentNo(countryCode: CountryCode): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${countryCode}-${year}-`;
    const last = await this.prisma.student.findFirst({
      where: { studentNo: { startsWith: prefix } },
      orderBy: { studentNo: "desc" },
      select: { studentNo: true },
    });
    const seq = last ? Number(last.studentNo.slice(prefix.length)) + 1 : 1;
    return `${prefix}${String(seq).padStart(4, "0")}`;
  }
}

function isUniqueViolation(e: unknown, field: string): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2002" &&
    JSON.stringify(e.meta ?? {}).includes(field)
  );
}
