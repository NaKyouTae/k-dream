import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: "내용을 입력해 주세요." })
  @MaxLength(2000, { message: "2000자를 넘을 수 없습니다." })
  body: string;
}
