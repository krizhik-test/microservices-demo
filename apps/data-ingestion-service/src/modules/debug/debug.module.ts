import { Module } from "@nestjs/common";
import { DebugController } from "./debug.controller";
import { DebugService } from "./debug.service";
import { DataModule } from "../data/data.module";

@Module({
  imports: [DataModule],
  controllers: [DebugController],
  providers: [DebugService],
})
export class DebugModule {}
