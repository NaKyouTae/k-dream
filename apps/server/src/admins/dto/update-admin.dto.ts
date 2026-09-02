import { StaffStatus } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  /** 값이 있으면 비밀번호를 재설정한다 */
  @IsOptional()
  @IsString()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  password?: string;
}
