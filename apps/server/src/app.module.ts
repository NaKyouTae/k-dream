import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AdminsModule } from "./admins/admins.module";
import { AgentsModule } from "./agents/agents.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { DocumentsModule } from "./documents/documents.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SchoolsModule } from "./schools/schools.module";
import { StaffModule } from "./staff/staff.module";
import { StorageModule } from "./storage/storage.module";
import { StudentsModule } from "./students/students.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    StaffModule,
    AdminsModule,
    AgentsModule,
    SchoolsModule,
    StudentsModule,
    StorageModule,
    DocumentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
