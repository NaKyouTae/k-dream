import { DocumentReviewStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class ReviewDocumentDto {
  @IsEnum(DocumentReviewStatus)
  reviewStatus: DocumentReviewStatus;

  /** SUPPLEMENT_REQUIRED 로 바꿀 때는 사유가 필수다 */
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
