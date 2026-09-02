import { DocumentCategory } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class SetCategoryDto {
  /** null 이면 미지정으로 되돌린다. */
  @IsOptional()
  @IsEnum(DocumentCategory, { message: "서류 종류가 올바르지 않습니다." })
  category?: DocumentCategory | null;
}
