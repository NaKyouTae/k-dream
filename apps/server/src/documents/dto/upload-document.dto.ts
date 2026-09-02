import { DocumentCategory } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UploadDocumentDto {
  @IsEnum(DocumentCategory, { message: "서류 종류가 올바르지 않습니다." })
  category: DocumentCategory;
}
