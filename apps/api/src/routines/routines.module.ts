import { Module } from "@nestjs/common";
import { RoutinesController } from "./routines.controller.js";
import { RoutinesService } from "./routines.service.js";

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
