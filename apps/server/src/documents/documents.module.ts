import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { StudentDocumentsController } from "./student-documents.controller";
import { DocumentsService } from "./documents.service";

@Module({
  controllers: [StudentDocumentsController, DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
