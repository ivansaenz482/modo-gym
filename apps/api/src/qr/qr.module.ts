import { Module } from "@nestjs/common";
import { QrController } from "./qr.controller.js";

@Module({
  controllers: [QrController],
})
export class QrModule {}
