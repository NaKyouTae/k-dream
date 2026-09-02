import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAdminDto {
  /** 로그인 계정 */
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @MinLength(8, { message: "비밀번호는 8자 이상이어야 합니다." })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
