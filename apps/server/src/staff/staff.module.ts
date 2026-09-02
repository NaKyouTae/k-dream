import { Global, Module } from "@nestjs/common";
import { StaffService } from "./staff.service";

@Global()
@Module({
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
