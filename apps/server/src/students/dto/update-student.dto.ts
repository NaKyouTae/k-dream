import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateStudentDto } from "./create-student.dto";

/** 국가는 학생번호에, 담당 에이전트는 접근 범위에 걸려 있어 등록 후 바꾸지 않는다 */
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ["countryCode", "agentId"] as const),
) {}
