import { CountryCode, GenderCode, ProgramCode } from "@prisma/client";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

/** 에이전트가 학생을 등록할 때 쓴다. 학생번호와 담당 에이전트는 서버가 붙인다. */
export class CreateStudentDto {
  /**
   * 담당 에이전트. 관리자가 등록할 때는 필수이고,
   * 에이전트가 등록하면 본인 계정으로 고정된다.
   */
  @IsOptional()
  @IsUUID()
  agentId?: string;

  /**
   * 생략하면 담당 에이전트의 국가를 쓴다.
   * 값을 보냈는데 에이전트 국가와 다르면 거부한다.
   */
  @IsOptional()
  @IsEnum(CountryCode)
  countryCode?: CountryCode;

  @IsString()
  @IsNotEmpty()
  passportName: string;

  @IsOptional()
  @IsString()
  localName?: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(GenderCode)
  genderCode: GenderCode;

  @IsString()
  @IsNotEmpty()
  passportNo: string;

  @IsDateString()
  passportExpiry: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: "이메일 형식이 올바르지 않습니다." })
  email?: string;

  @IsEnum(ProgramCode)
  desiredProgram: ProgramCode;

  @IsOptional()
  @IsString()
  desiredMajor?: string;

  @IsOptional()
  @IsUUID()
  schoolId?: string;
}
