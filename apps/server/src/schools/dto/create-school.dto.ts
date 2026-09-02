import { SchoolStatus, SchoolType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  nameKo: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsEnum(SchoolType)
  type: SchoolType;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsEnum(SchoolStatus)
  status?: SchoolStatus;
}
