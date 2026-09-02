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
import { DEFAULT_AGENT_PASSWORD } from "./agents.constants";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { ListAgentsDto } from "./dto/list-agents.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";

@Controller("agents")
@UseGuards(AdminGuard)
export class AgentsController {
  constructor(
    private readonly staff: StaffService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: ListAgentsDto) {
    return this.staff.list("AGENT", query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.staff.findOne("AGENT", id);
  }

  @Post()
  async create(@Body() dto: CreateAgentDto, @Req() req: AuthedRequest) {
    const agent = await this.staff.create("AGENT", {
      ...dto,
      password: dto.password || DEFAULT_AGENT_PASSWORD,
    });
    await this.audit.record(req, {
      actionCode: "CREATE_AGENT",
      entityType: "STAFF",
      entityId: agent.id,
      detail: { loginId: agent.loginId, countryCode: agent.countryCode },
    });
    return agent;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAgentDto,
    @Req() req: AuthedRequest,
  ) {
    const agent = await this.staff.update("AGENT", id, dto, req.staff!.sub);
    await this.audit.record(req, {
      actionCode: dto.password ? "RESET_AGENT_PASSWORD" : "UPDATE_AGENT",
      entityType: "STAFF",
      entityId: agent.id,
      // 비밀번호 값 자체는 감사로그에도 남기지 않는다
      detail: { changed: Object.keys(dto).filter((k) => k !== "password") },
    });
    return agent;
  }
}
