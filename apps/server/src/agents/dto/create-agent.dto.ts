import { CountryCode } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateAgentDto {
  /** 로그인 계정. 보통 이메일을 쓴다 */
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CountryCode)
  countryCode: CountryCode;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
