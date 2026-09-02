import { StudentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

/** 관리자가 검토 결과를 반영한다. REVIEW_REQUESTED 는 등록 시점에만 붙는다. */
export type AdminSettableStatus = Exclude<StudentStatus, "REVIEW_REQUESTED">;

export class UpdateStudentStatusDto {
  @IsEnum(StudentStatus)
  status: StudentStatus;

  /** 서류보완필요로 바꿀 때는 사유가 필수다 (에이전트에게 노출된다) */
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
