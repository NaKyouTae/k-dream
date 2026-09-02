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
import { AdminGuard, AuthedRequest } from "../auth/auth.guard";
import { StaffService } from "../staff/staff.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { ListAdminsDto } from "./dto/list-admins.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";

@Controller("admins")
@UseGuards(AdminGuard)
export class AdminsController {
  constructor(
    private readonly staff: StaffService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: ListAdminsDto) {
    return this.staff.list("ADMIN", query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.staff.findOne("ADMIN", id);
  }

  @Post()
  async create(@Body() dto: CreateAdminDto, @Req() req: AuthedRequest) {
    const admin = await this.staff.create("ADMIN", dto);
    await this.audit.record(req, {
      actionCode: "CREATE_ADMIN",
      entityType: "STAFF",
      entityId: admin.id,
      detail: { loginId: admin.loginId },
    });
    return admin;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminDto,
    @Req() req: AuthedRequest,
  ) {
    if (dto.status === "SUSPENDED") {
      await this.staff.assertNotLastActiveAdmin(id);
    }
    const admin = await this.staff.update("ADMIN", id, dto, req.staff!.sub);
    await this.audit.record(req, {
      actionCode: dto.password ? "RESET_ADMIN_PASSWORD" : "UPDATE_ADMIN",
      entityType: "STAFF",
      entityId: admin.id,
      // 비밀번호 값 자체는 감사로그에도 남기지 않는다
      detail: { changed: Object.keys(dto).filter((k) => k !== "password") },
    });
    return admin;
  }
}
