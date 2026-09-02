import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AdminGuard, AuthGuard, AuthedRequest } from "../auth/auth.guard";
import { CreateSchoolDto } from "./dto/create-school.dto";
import { ListSchoolsDto } from "./dto/list-schools.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";
import { SchoolsService } from "./schools.service";

@Controller("schools")
export class SchoolsController {
  constructor(
    private readonly schools: SchoolsService,
    private readonly audit: AuditService,
  ) {}

  /** 에이전트도 학생 신청 시 학교를 골라야 하므로 조회는 staff 전체에 허용 */
  @Get()
  @UseGuards(AuthGuard)
  list(@Query() query: ListSchoolsDto) {
    return this.schools.list(query);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.schools.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateSchoolDto, @Req() req: AuthedRequest) {
    const school = await this.schools.create(dto);
    await this.audit.record(req, {
      actionCode: "CREATE_SCHOOL",
      entityType: "SCHOOL",
      entityId: school.id,
      detail: { nameKo: school.nameKo },
    });
    return school;
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSchoolDto,
    @Req() req: AuthedRequest,
  ) {
    const school = await this.schools.update(id, dto);
    await this.audit.record(req, {
      actionCode: "UPDATE_SCHOOL",
      entityType: "SCHOOL",
      entityId: school.id,
      detail: { changed: Object.keys(dto) },
    });
    return school;
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(AdminGuard)
  async remove(@Param("id") id: string, @Req() req: AuthedRequest) {
    const school = await this.schools.findOne(id);
    await this.schools.remove(id);
    await this.audit.record(req, {
      actionCode: "DELETE_SCHOOL",
      entityType: "SCHOOL",
      entityId: id,
      detail: { nameKo: school.nameKo },
    });
  }
}
