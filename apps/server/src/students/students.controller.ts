import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AdminGuard, AuthGuard, AuthedRequest } from "../auth/auth.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { ListStudentsDto } from "./dto/list-students.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { UpdateStudentStatusDto } from "./dto/update-status.dto";
import { StudentsService } from "./students.service";

/**
 * 관리자는 전체 학생을, 에이전트는 본인이 등록한 학생만 다룬다.
 * 범위 제한은 서비스에서 where 절로 강제한다.
 */
@Controller("students")
@UseGuards(AuthGuard)
export class StudentsController {
  constructor(
    private readonly students: StudentsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: ListStudentsDto, @Req() req: AuthedRequest) {
    return this.students.list(req.staff!, query);
  }

  @Get("status-counts")
  statusCounts(@Req() req: AuthedRequest) {
    return this.students.statusCounts(req.staff!);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: AuthedRequest) {
    return this.students.findOne(req.staff!, id);
  }

  @Post()
  async create(@Body() dto: CreateStudentDto, @Req() req: AuthedRequest) {
    const student = await this.students.create(req.staff!, dto);
    await this.audit.record(req, {
      actionCode: "CREATE_STUDENT",
      entityType: "STUDENT",
      entityId: student.id,
      detail: { studentNo: student.studentNo },
    });
    return student;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateStudentDto,
    @Req() req: AuthedRequest,
  ) {
    const student = await this.students.update(req.staff!, id, dto);
    await this.audit.record(req, {
      actionCode: "UPDATE_STUDENT",
      entityType: "STUDENT",
      entityId: student.id,
      detail: { studentNo: student.studentNo, changed: Object.keys(dto) },
    });
    return student;
  }

  /** 검토 결과 반영은 관리자만. 에이전트가 스스로 검토완료 시키면 안 된다. */
  @Patch(":id/status")
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStudentStatusDto,
    @Req() req: AuthedRequest,
  ) {
    const student = await this.students.updateStatus(req.staff!, id, dto);
    await this.audit.record(req, {
      actionCode: "UPDATE_STUDENT_STATUS",
      entityType: "STUDENT",
      entityId: student.id,
      detail: { studentNo: student.studentNo, status: dto.status },
    });
    return student;
  }
}
